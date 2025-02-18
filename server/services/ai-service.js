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

const generateClaudeResponse = async (prompt, section) => {
  try {
    const client = initAnthropicClient()
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: SYSTEM_PROMPTS[section] || SYSTEM_PROMPTS.description,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    return {
      message: response.content[0].text,
      ai: "claude",
      section
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

export const generateResponse = async (prompt, section, model = "claude") => {
  if (model === "gpt") {
    return generateGPTResponse(prompt, section)
  }
  return generateClaudeResponse(prompt, section)
}
