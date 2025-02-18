import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
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
    // Get directory paths
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const rootDir = path.resolve(__dirname, "../../")

    console.log("Root directory:", rootDir)
    console.log("Env file path:", path.join(rootDir, ".env"))

    // Configure dotenv to look in root directory
    const result = dotenv.config({ path: path.join(rootDir, ".env") })

    if (result.error) {
      throw new Error(`Failed to load .env file: ${result.error.message}`)
    }

    // Debug log for env vars
    console.log("Environment check on startup:", {
      anthropicKey: !!process.env.ANTHROPIC_API_KEY,
      openaiKey: !!process.env.OPENAI_API_KEY,
      port: process.env.SERVER_PORT || 3001,
      envKeys: Object.keys(process.env)
    })

    const app = express()
    const port = process.env.SERVER_PORT || 3001

    // Update CORS configuration
    app.use(
      cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"]
      })
    )
    app.use(express.json())

    // Add debug endpoint to check env vars
    app.get("/api/debug", (req, res) => {
      console.log("API Keys present:", {
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        openai: !!process.env.OPENAI_API_KEY
      })
      res.json({ status: "ok" })
    })

    // Basic health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" })
    })

    // AI response endpoint
    app.post("/api/chat", async (req, res) => {
      try {
        const { prompt, section, model } = req.body
        console.log("Received chat request:", { prompt, section, model })
        const response = await generateResponse(prompt, section, model)
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
