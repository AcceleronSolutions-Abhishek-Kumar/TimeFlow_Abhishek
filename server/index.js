import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import taskRoutes from "./routes/taskRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import moduleRoutes from "./routes/moduleRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"

dotenv.config()

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.use("/api/health", (req, res) => {
  res.json({ status: "OK", message: "TimeFlow Backend API Server Running", time: new Date() })
})

// REST API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/modules", moduleRoutes)

// Start Express Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🔑 Auth API: http://localhost:${PORT}/api/auth/login`)
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`)
  console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`)
  console.log(`📁 Projects API: http://localhost:${PORT}/api/projects`)
  console.log(`🧩 Modules API: http://localhost:${PORT}/api/modules`)
})
