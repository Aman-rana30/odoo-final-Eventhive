import http from "http"
import app from "./app.js"
import { connectDB } from "./config/db.js"
import { env } from "./config/env.js"
import { startCronJobs } from "./jobs/index.js"

const server = http.createServer(app)

async function bootstrap() {
  await connectDB()
  server.listen(env.PORT, () => {
    console.log(`[eventhive] backend on ${env.BASE_URL}`)
  })
  startCronJobs()
}

bootstrap().catch((e) => {
  console.error("[eventhive] bootstrap error:", e)
  process.exit(1)
})
