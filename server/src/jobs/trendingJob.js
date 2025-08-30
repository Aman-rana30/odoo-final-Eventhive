import cron from "node-cron"
import { Event } from "../models/Event.js"

export function scheduleTrendingJob() {
  cron.schedule("0 * * * *", async () => {
    console.log("[cron] trending recompute")
    // Simple decay
    await Event.updateMany({}, { $mul: { trendingScore: 0.9 } })
  })
}
