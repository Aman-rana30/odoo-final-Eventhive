// Express app: security, JSON, CORS, routes, errors
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import mongoSanitize from "express-mongo-sanitize"
import path from "path"
import { env } from "./config/env.js"
import router from "./routes/index.js"

const app = express()

app.use(helmet())
const allowed = (env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
app.use(
  cors({
    origin: allowed.length ? allowed : "*",
    credentials: true,
  }),
)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }))

// Static uploads
app.use("/uploads", express.static(path.resolve(env.UPLOADS_DIR)))

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "eventhive-backend" }))

// API
app.use("/api", router)

// 404
app.use((req, res) => res.status(404).json({ error: "Not Found", path: req.originalUrl }))

// Errors
app.use((err, _req, res, _next) => {
  const status = err.status || 500
  res.status(status).json({ error: err.message || "Internal Server Error" })
})

export default app
