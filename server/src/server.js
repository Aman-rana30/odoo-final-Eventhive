import "./config/index.js"
import { connectDB } from "./db.js"
import { app } from "./app.js"
import { scheduleReminderJobs } from "./jobs/reminderJob.js"
import { scheduleTrendingJob } from "./jobs/trendingJob.js"

const PORT = process.env.PORT || 4000

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`[server] EventHive API running on http://localhost:${PORT}`)
  })
  scheduleReminderJobs()
  scheduleTrendingJob()
}

start().catch((err) => {
  console.error("[server] Fatal start error", err)
  process.exit(1)
})
