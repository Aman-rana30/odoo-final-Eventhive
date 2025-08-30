// Simple placeholder cron; wire in src/server.js if needed.
import cron from "node-cron"
import Event from "../models/Event.js"

export function startReminderCron() {
  cron.schedule("*/10 * * * *", async () => {
    const now = new Date()
    const t24 = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const t1 = new Date(now.getTime() + 60 * 60 * 1000)

    const eventsSoon = await Event.find({ startAt: { $gte: now, $lte: t24 } })
    const eventsVerySoon = await Event.find({ startAt: { $gte: now, $lte: t1 } })
    // TODO: mark reminders sent and email users; kept concise here.
    console.log("[cron] reminders checked", eventsSoon.length, eventsVerySoon.length)
  })
}
