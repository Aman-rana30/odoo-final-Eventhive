import crypto from "crypto"
import Joi from "joi"
import TicketType from "../models/TicketType.js"
import Booking from "../models/Booking.js"
import { generateTicketQR } from "../utils/qr.js"
import { generateTicketPDF } from "../utils/pdf.js"
import { sendBookingEmail } from "../utils/email.js"
import Event from "../models/Event.js"

const cartSchema = Joi.object({
  eventId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      ticketTypeId: Joi.string().required(),
      qty: Joi.number().integer().min(1).required(),
    }),
  ),
  couponCode: Joi.string().allow("", null),
})

function genBookingId() {
  return `EHV-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${Date.now().toString().slice(-6)}`
}

export async function checkout(req, res) {
  const { error, value } = cartSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.message })

  const event = await Event.findById(value.eventId).lean()
  if (!event) return res.status(404).json({ error: "Event not found" })

  const tickets = await TicketType.find({
    _id: { $in: value.items.map((i) => i.ticketTypeId) },
    eventId: value.eventId,
  }).lean()
  if (tickets.length !== value.items.length) return res.status(400).json({ error: "Invalid ticket selection" })

  let subtotal = 0
  const items = value.items.map((i) => {
    const tt = tickets.find((t) => t._id.toString() === i.ticketTypeId)
    subtotal += tt.price * i.qty
    return { ticketTypeId: tt._id, name: tt.name, qty: i.qty, priceAtPurchase: tt.price }
  })

  // Apply coupon on client via /coupons/validate; trust client discount? Safer to recalc; keeping simple:
  const discount = 0
  const total = subtotal - discount

  const booking = await Booking.create({
    bookingId: genBookingId(),
    userId: req.user._id,
    eventId: value.eventId,
    items,
    subtotal,
    discount,
    total,
    payment: { status: "Paid" }, // Simplified: mark as paid for local demo. Integrate gateway to set Pending->Paid.
    status: "Paid",
  })

  const qrUrl = await generateTicketQR(booking.bookingId)
  booking.qrCodeUrl = qrUrl
  const pdfUrl = await generateTicketPDF(booking)
  booking.pdfUrl = pdfUrl
  await booking.save()

  // Email ticket
  await sendBookingEmail(
    req.user.email,
    "Your EventHive Ticket",
    `<p>Thanks for your purchase! Booking <b>${booking.bookingId}</b></p><p>Download your ticket: <a href="${pdfUrl}">${pdfUrl}</a></p>`,
    [{ path: `.${pdfUrl}` }],
  )

  res.status(201).json({ booking })
}

export async function myBookings(req, res) {
  const list = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
  res.json({ bookings: list })
}
