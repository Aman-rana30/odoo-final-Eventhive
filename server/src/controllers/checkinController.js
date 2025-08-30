import { Checkin } from "../models/Checkin.js"
import { Booking } from "../models/Booking.js"
import { Event } from "../models/Event.js"
import createError from "http-errors"

const eventClients = new Map() // eventId -> Set<res>

function broadcast(eventId, payload) {
  const set = eventClients.get(eventId) || new Set()
  for (const res of set) {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }
}

export async function scan(req, res, next) {
  const { bookingId } = req.body // payload from QR
  const booking = await Booking.findOne({ bookingId })
  if (!booking) return next(createError(404, "Booking not found"))
  if (booking.status !== "Paid") return next(createError(400, "Unpaid booking"))
  try {
    const rec = await Checkin.create({
      bookingId,
      eventId: booking.eventId,
      scannedBy: req.user.sub,
      deviceInfo: req.headers["user-agent"] || "unknown",
    })
    // broadcast updated stats
    const s = await statsForEvent(booking.eventId)
    broadcast(booking.eventId.toString(), { type: "stats", data: s })
    res.json({ ok: true, rec })
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Already checked in" })
    throw e
  }
}

async function statsForEvent(eventId) {
  const totalBookings = await Booking.countDocuments({ eventId, status: "Paid" })
  const checkedIn = await Checkin.countDocuments({ eventId })
  return { totalBookings, checkedIn, rate: totalBookings ? Math.round((checkedIn / totalBookings) * 100) : 0 }
}

export async function stats(req, res) {
  const eventId = req.params.eventId
  const s = await statsForEvent(eventId)
  res.json(s)
}

export async function stream(req, res, next) {
  const { eventId } = req.params
  const exists = await Event.findById(eventId).select("_id").lean()
  if (!exists) return next(createError(404, "Event not found"))

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  })
  res.flushHeaders?.()
  res.write(`data: ${JSON.stringify({ type: "hello", eventId })}\n\n`)

  const set = eventClients.get(eventId) || new Set()
  set.add(res)
  eventClients.set(eventId, set)

  req.on("close", () => {
    set.delete(res)
  })
}
