import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import drugRoutes from "./routes/drugRoutes.js"
import movementRoutes from "./routes/movementRoutes.js"
import alertRoutes from "./routes/alertRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"
import { setupSocketHandlers } from "./socket/socketHandler.js"
import { startAlertCronJobs } from "./jobs/alertCron.js"

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
})

// Make io accessible in routes
app.set("io", io)

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/drugs", drugRoutes)
app.use("/api/movements", movementRoutes)
app.use("/api/alerts", alertRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/reports", reportRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!", error: err.message })
})

// Connect to database and start server
const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)

      // Setup socket handlers
      setupSocketHandlers(io)

      // Start cron jobs
      startAlertCronJobs(io)
    })
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error)
    process.exit(1)
  })
