import express from "express"
import cors from "cors"
import { generateResponse } from "../services/ai-service.js"

// Add process error handlers
process.on("uncaughtException", error => {
  console.error("Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", error => {
  console.error("Unhandled Rejection:", error)
  process.exit(1)
})

async function startServer() {
  try {
    const app = express()
    const port = process.env.SERVER_PORT || 3001

    app.use(
      cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"]
      })
    )
    app.use(express.json())

    // Basic health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" })
    })

    // AI response endpoint
    app.post("/api/chat", async (req, res) => {
      try {
        const { prompt, section, model = "claude", allMessages, credentials } = req.body

        // Validate required fields
        if (!prompt) {
          throw new Error("Missing prompt")
        }
        if (!section) {
          throw new Error("Missing section")
        }
        if (!credentials) {
          throw new Error("Missing credentials")
        }

        const requiredProvider = model === "gpt" ? "openai" : "anthropic"
        if (!credentials[requiredProvider]) {
          throw new Error(`Missing API key for ${requiredProvider}`)
        }

        console.log("Received chat request:", { prompt, section, model })
        const response = await generateResponse(
          prompt,
          section,
          model,
          allMessages,
          credentials
        )
        res.json(response)
      } catch (error) {
        console.error("Error in chat endpoint:", error)
        res.status(500).json({ error: error.message })
      }
    })

    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })

    // Add error handler for the server
    server.on("error", error => {
      console.error("Server error:", error)
      process.exit(1)
    })
  } catch (error) {
    console.error("Error in server setup:", error)
    throw error
  }
}

startServer().catch(error => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
