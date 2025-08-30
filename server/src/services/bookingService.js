import { TicketType } from "../models/Event.js"
import { Booking } from "../models/Booking.js"
import { applyCouponToItems, resolveCoupon, calcSubtotal } from "./pricingService.js"
import { createOrder, verifySignature } from "./paymentService.js"
import { generateBookingId } from "../lib/id.js"
import { generateQrPng } from "../lib/qr.js"
import { generateTicketPdf } from "../lib/pdf.js"
import { sendEmail } from "../lib/email.js"
import { sendWhatsAppLink } from "../lib/whatsapp.js"
import mongoose from "mongoose"
import fs from "fs"
import path from "path"
import { User } from "../models/User.js"

export async function createGatewayOrder(userId, { eventId, items, couponCode }) {
  // items: [{ticketTypeId, qty, price}]
  const enriched = []
  for (const it of items) {
    const tt = await TicketType.findById(it.ticketTypeId).lean()
    if (!tt) throw new Error("Invalid ticket type")
    const now = Date.now()
    if (now < new Date(tt.saleStartAt).getTime() || now > new Date(tt.saleEndAt).getTime()) {
      throw new Error("Ticket not on sale")
    }
    enriched.push({ ...it, price: tt.price })
  }
  const coupon = await resolveCoupon(couponCode)
  const { discount } = applyCouponToItems(enriched, coupon)
  const subtotal = calcSubtotal(enriched)
  const total = Math.max(subtotal - discount, 0)

  const receipt = generateBookingId()
  const order = await createOrder(total, "INR", receipt)
  // Create pending booking record
  const booking = await Booking.create({
    bookingId: receipt,
    userId,
    eventId,
    items: enriched.map((it) => ({ ticketTypeId: it.ticketTypeId, qty: it.qty, priceAtPurchase: it.price })),
    subtotal,
    discount,
    total,
    payment: { gateway: "razorpay", orderId: order.id, status: "Pending" },
    status: "Pending",
  })

  return { order, booking }
}

export async function verifyAndFinalizeBooking(userId, { orderId, paymentId, signature }) {
  if (!verifySignature({ orderId, paymentId, signature })) throw new Error("Signature verification failed")
  const booking = await Booking.findOne({ "payment.orderId": orderId, userId })
  if (!booking) throw new Error("Booking not found")

  // Atomic inventory decrement in a transaction
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      for (const it of booking.items) {
        const res = await TicketType.findOneAndUpdate(
          { _id: it.ticketTypeId, remainingQuantity: { $gte: it.qty } },
          { $inc: { remainingQuantity: -it.qty } },
          { session, new: true },
        )
        if (!res) throw new Error("Insufficient stock")
      }
      booking.payment.paymentId = paymentId
      booking.payment.signature = signature
      booking.payment.status = "Paid"
      booking.status = "Paid"

      // Generate QR + PDF and send email
      const qr = await generateQrPng({ bookingId: booking.bookingId, userId })

      const outDir = process.env.UPLOADS_DIR || "uploads"
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
      const qrPath = path.join(outDir, `qr-${booking.bookingId}.png`)
      fs.writeFileSync(qrPath, qr)

      const pdfPath = await generateTicketPdf({ booking, qrBuffer: qr })
      booking.qrCodeUrl = `/${qrPath.replace(/^[.\\/]+/, "")}` // ensure leading slash
      booking.pdfUrl = `/${pdfPath.replace(/^[.\\/]+/, "")}`
      await booking.save({ session })

      const user = await User.findById(userId).lean()
      const toEmail = user?.email || "user@example.com"
      const downloadUrl = `${process.env.BASE_URL}${booking.pdfUrl}`
      await sendEmail({
        to: toEmail,
        subject: `Your EventHive Ticket ${booking.bookingId}`,
        html: `Thanks for your purchase. Download your ticket: <a href="${downloadUrl}">${downloadUrl}</a>`,
        attachments: [{ filename: `ticket-${booking.bookingId}.pdf`, path: pdfPath }],
      })

      // WhatsApp link (if configured and user has phone)
      const toPhone = user?.phone ? user.phone : null
      if (toPhone) {
        await sendWhatsAppLink({
          toPhoneE164: toPhone,
          text: `Your EventHive ticket ${booking.bookingId}: ${downloadUrl}`,
        })
      } else {
        console.log("[whatsapp] skipped (no phone on user)")
      }
    })
  } finally {
    session.endSession()
  }

  return booking
}

export async function cancelAndRefundBooking(userId, bookingId) {
  const booking = await Booking.findOne({ bookingId, userId })
  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "Paid") throw new Error("Booking not refundable")

  // Simple refund policy: >=48h full, 24–48h 50%, <24h none
  const now = Date.now()
  // Event start omitted for brevity; assume >=48h full
  const refundPercent = 1 // TODO: compute based on event.startAt
  const refundAmount = Math.round(booking.total * refundPercent)

  // Razorpay refund call omitted for brevity (would use client.payments.refund)

  // Restore inventory
  for (const it of booking.items) {
    await TicketType.findByIdAndUpdate(it.ticketTypeId, { $inc: { remainingQuantity: it.qty } })
  }
  booking.status = "Refunded"
  booking.payment.status = "Refunded"
  await booking.save()
  return { booking, refundAmount }
}
