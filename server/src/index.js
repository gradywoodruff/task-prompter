import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Import AI service
import { generateResponse } from "./services/aiService.js"

dotenv.config()

const app = express()
const port = process.env.SERVER_PORT || 3001

app.use(cors())
app.use(express.json())

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// AI response endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, model } = req.body
    const response = await generateResponse(prompt, model)
    res.json(response)
  } catch (error) {
    console.error("Error in chat endpoint:", error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
