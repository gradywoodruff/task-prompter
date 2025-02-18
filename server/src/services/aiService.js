import { Anthropic } from "@anthropic-ai/sdk"
import axios from "axios"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const generateClaudeResponse = async prompt => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    })

    return {
      message: response.content[0].text,
      ai: "claude"
    }
  } catch (error) {
    console.error("Error in Claude response:", error)
    throw error
  }
}

const generateGPTResponse = async prompt => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
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
      ai: "gpt"
    }
  } catch (error) {
    console.error("Error in GPT response:", error)
    throw error
  }
}

export const generateResponse = async (prompt, model = "claude") => {
  if (model === "gpt") {
    return generateGPTResponse(prompt)
  }
  return generateClaudeResponse(prompt)
}
