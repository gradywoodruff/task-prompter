import { Anthropic } from "@anthropic-ai/sdk"
import axios from "axios"

// Move the client initialization inside the function
let anthropic = null

const initAnthropicClient = () => {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }
  return anthropic
}

const SYSTEM_PROMPTS = {
  description: `You are a helpful AI assistant focused on helping users clarify their programming tasks. 
    Help them describe their task clearly and thoroughly.`,
  acceptance: `You are helping users define clear acceptance criteria for their programming tasks. 
    Guide them to think about edge cases, user scenarios, and specific requirements.`,
  assumptions: `You are helping users identify and document important assumptions about their programming task. 
    Help them consider technical constraints, dependencies, and environmental factors.`,
  technical: `You are helping users plan their technical approach. 
    Guide them to think about architecture, design patterns, and implementation details.`
}

const SYSTEM_PROMPT = `You are a project manager helping a tech lead plan a task. The ultimate aim is to help the tech lead brainstorm the task and flesh out a detailed description of the task.

Please respond in a single JSON object with no other text. Here is the format of the expected JSON object:
{
    "section": "<name of current section>",
    "response": "<updated section text>",
    "confidence": <float from 0-1 of how sure you are this is a good update>
}
`

const generateClaudeResponse = async (prompt, section, allMessages) => {
  try {
    const client = initAnthropicClient()

    // Format current document state
    const currentDocument = Object.entries(allMessages)
      .map(([section, msgs]) => {
        const content = msgs
          ?.filter(msg => msg.role === "assistant")
          ?.map(msg => msg.content)
          ?.join("\n\n")

        if (!content) return null
        return `### ${section.charAt(0).toUpperCase() + section.slice(1)}\n${content}`
      })
      .filter(Boolean)
      .join("\n\n")

    const formattedPrompt = `
You are helping a tech lead refine a task specification document. 

CURRENT DOCUMENT STATE:
${currentDocument || "The document is currently empty."}

The tech lead wants to update the ${section} section. Here is their request:
${prompt}

You must respond with a JSON object containing two key elements:
1. A complete markdown document reflecting the requested changes
2. A conversational response explaining what you changed

IMPORTANT: You must respond with ONLY a JSON object. No other text, no markdown formatting around the JSON.
The JSON must have exactly these fields:
{
    "section": "${section}",
    "document": "<the complete updated document in markdown format>",
    "chatResponse": "<your conversational response explaining what you updated>",
    "confidence": <number between 0 and 1>
}

Guidelines for the document field:
1. This should be the ENTIRE markdown document after applying the requested changes
2. The document should maintain its current structure and content, only changing what was specifically requested
3. Each section should start with "### SectionName"
4. Use proper markdown formatting (headers, lists, code blocks, etc.)
5. Do not add new sections unless specifically requested
6. Do not remove sections unless specifically requested
7. The document state shown above is the source of truth - maintain its structure unless explicitly asked to change it

Guidelines for the chatResponse field:
1. This should be a conversational explanation of what changes you made to the document
2. Explain your reasoning for the changes
3. If you chose not to make certain changes, explain why

Remember: The "document" field maintains the document state, while the "chatResponse" field explains your changes conversationally.`

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system:
        "You are a JSON-only response AI. You must respond with valid JSON objects only, no other text.",
      messages: [
        {
          role: "user",
          content: formattedPrompt
        }
      ]
    })

    // Debug log the raw response
    console.log("Raw AI response:", response.content[0].text)

    // Clean and parse the JSON response
    let jsonResponse
    try {
      // Clean the response text
      let cleanedResponse = response.content[0].text
        .trim()
        // Remove any markdown code block markers
        .replace(/```json\s*|\s*```/g, "")
        // Remove any leading/trailing whitespace or newlines
        .trim()
        // Remove any non-JSON text before or after the JSON object
        .replace(/^[^{]*({.*})[^}]*$/s, "$1")

      // Try to parse as is first
      try {
        jsonResponse = JSON.parse(cleanedResponse)
      } catch (initialParseError) {
        // If that fails, try more aggressive cleaning
        console.log("Initial parse failed, trying more aggressive cleaning...")

        // Replace all newlines with actual \n strings
        cleanedResponse = cleanedResponse.replace(/\n/g, "\\n")
        // Escape quotes within the response field
        cleanedResponse = cleanedResponse.replace(
          /"response":\s*"([^"]*)"/,
          (match, p1) => {
            return `"response": "${p1.replace(/"/g, '\\"')}"`
          }
        )
        // Remove any double escaped newlines
        cleanedResponse = cleanedResponse.replace(/\\\\n/g, "\\n")

        console.log("Aggressively cleaned response:", cleanedResponse)
        jsonResponse = JSON.parse(cleanedResponse)
      }

      // Validate the response format
      if (
        !jsonResponse.section ||
        !jsonResponse.document ||
        !jsonResponse.chatResponse ||
        jsonResponse.confidence === undefined
      ) {
        throw new Error("Invalid response format from AI")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.error("Parse error details:", parseError.message)
      // Fallback response if parsing fails
      jsonResponse = {
        section: section,
        document:
          "I apologize, but I encountered an error processing your request. Could you please rephrase or clarify your message?",
        chatResponse:
          "I apologize, but I encountered an error processing your request. Could you please rephrase or clarify your message?",
        confidence: 0.5
      }
    }

    return {
      message: jsonResponse.chatResponse,
      document: jsonResponse.document,
      section: jsonResponse.section,
      confidence: jsonResponse.confidence,
      ai: "claude"
    }
  } catch (error) {
    console.error("Error in Claude response:", error)
    throw error
  }
}

const generateGPTResponse = async (prompt, section) => {
  console.log("******************")
  console.log("process.env.OPENAI_API_KEY")
  console.log(process.env.OPENAI_API_KEY)
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS[section] || SYSTEM_PROMPTS.description
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )

    return {
      message: response.data.choices[0].message.content,
      ai: "gpt",
      section
    }
  } catch (error) {
    console.error("Error in GPT response:", error)
    throw error
  }
}

export const generateResponse = async (
  prompt,
  section,
  model = "claude",
  allMessages = {}
) => {
  if (model === "gpt") {
    return generateGPTResponse(prompt, section)
  }
  return generateClaudeResponse(prompt, section, allMessages)
}
