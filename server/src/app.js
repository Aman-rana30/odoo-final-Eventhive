import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import xss from "xss-clean"
import { v4 as uuidv4 } from "uuid"
import routes from "./routes/index.js"
import { errorHandler, notFoundHandler } from "./middleware/error.js"

export const app = express()

app.use((req, _res, next) => {
  req.id = uuidv4()
  return next()
})

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",") || "*", credentials: true }))
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(xss())
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
app.use(morgan("dev"))

app.use("/uploads", express.static(process.env.UPLOADS_DIR || "uploads"))

app.use("/api", routes)

app.use(notFoundHandler)
app.use(errorHandler)
