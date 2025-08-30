import cron from "node-cron"
import { Booking } from "../models/Booking.js"
import { Event } from "../models/Event.js"
import { User } from "../models/User.js"
import { sendEmail } from "../lib/email.js"
import { sendWhatsAppLink } from "../lib/whatsapp.js"

function windowMatch(targetTs, now = Date.now(), windowMinutes = 15) {
  const diffMin = Math.abs((targetTs - now) / 60000)
  return diffMin <= windowMinutes
}

export function scheduleReminderJobs() {
  // Every 15 minutes, check for events starting in 24h and 1h
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = Date.now()
      const oneHour = 60 * 60 * 1000
      const twentyFour = 24 * oneHour

      // Find events in Published state (optional) — fetch upcoming within ~24h+/-window or 1h+/-window
      const upcoming = await Event.find({ status: "Published", startAt: { $gte: new Date(now) } })
        .select("_id title startAt")
        .lean()

      const targets24 = new Set(
        upcoming
          .filter((e) => windowMatch(new Date(e.startAt).getTime() - twentyFour, now, 15))
          .map((e) => e._id.toString()),
      )
      const targets1 = new Set(
        upcoming
          .filter((e) => windowMatch(new Date(e.startAt).getTime() - oneHour, now, 15))
          .map((e) => e._id.toString()),
      )

      // 24h reminders
      if (targets24.size) {
        const bookings24 = await Booking.find({
          eventId: { $in: [...targets24] },
          status: "Paid",
          "reminders.sent24h": { $ne: true },
        }).lean()

        for (const b of bookings24) {
          const user = await User.findById(b.userId).lean()
          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: "Reminder: Your event starts in 24 hours",
              html: `Booking ${b.bookingId} for your upcoming event starts in 24 hours. Please have your ticket ready.`,
            })
          }
          if (user?.phone) {
            await sendWhatsAppLink({
              toPhoneE164: user.phone,
              text: `Event reminder: Booking ${b.bookingId} starts in 24 hours.`,
            })
          }
          await Booking.updateOne({ _id: b._id }, { $set: { "reminders.sent24h": true } })
          console.log("[cron] sent 24h reminder", b.bookingId)
        }
      }

      // 1h reminders
      if (targets1.size) {
        const bookings1 = await Booking.find({
          eventId: { $in: [...targets1] },
          status: "Paid",
          "reminders.sent1h": { $ne: true },
        }).lean()

        for (const b of bookings1) {
          const user = await User.findById(b.userId).lean()
          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: "Reminder: Your event starts in 1 hour",
              html: `Booking ${b.bookingId} for your event starts in 1 hour. See you soon!`,
            })
          }
          if (user?.phone) {
            await sendWhatsAppLink({
              toPhoneE164: user.phone,
              text: `Event reminder: Booking ${b.bookingId} starts in 1 hour.`,
            })
          }
          await Booking.updateOne({ _id: b._id }, { $set: { "reminders.sent1h": true } })
          console.log("[cron] sent 1h reminder", b.bookingId)
        }
      }

      if (!targets24.size && !targets1.size) {
        console.log("[cron] reminder sweep — nothing to send this run")
      }
    } catch (e) {
      console.error("[cron] reminder error", e.message)
    }
  })
}
