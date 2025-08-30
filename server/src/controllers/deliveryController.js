import { Booking } from "../models/Booking.js"
import { generateQrPng } from "../lib/qr.js"
import { generateTicketPdf } from "../lib/pdf.js"
import { sendEmail } from "../lib/email.js"
import { sendWhatsAppLink } from "../lib/whatsapp.js"
import { User } from "../models/User.js"
import fs from "fs"

export async function sendEmailForBooking(req, res) {
  const b = await Booking.findOne({ bookingId: req.params.bookingId, userId: req.user.sub })
  if (!b) return res.status(404).json({ error: "Booking not found" })

  let pdfPath = b.pdfUrl?.startsWith("/") ? `.${b.pdfUrl}` : b.pdfUrl
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    const qr = await generateQrPng({ bookingId: b.bookingId, userId: req.user.sub })
    pdfPath = await generateTicketPdf({ booking: b, qrBuffer: qr })
  }
  const downloadUrl = `${process.env.BASE_URL}${pdfPath.startsWith("/") ? "" : "/"}${pdfPath}`

  const user = await User.findById(req.user.sub).lean()
  const toEmail = user?.email || "user@example.com"

  await sendEmail({
    to: toEmail,
    subject: `Your EventHive Ticket ${b.bookingId}`,
    html: `Download: <a href="${downloadUrl}">${downloadUrl}</a>`,
    attachments: [{ filename: `ticket-${b.bookingId}.pdf`, path: pdfPath }],
  })
  res.json({ ok: true })
}

export async function sendWhatsAppForBooking(req, res) {
  const b = await Booking.findOne({ bookingId: req.params.bookingId, userId: req.user.sub })
  if (!b) return res.status(404).json({ error: "Booking not found" })

  const user = await User.findById(req.user.sub).lean()
  if (!user?.phone) return res.status(400).json({ error: "No phone on user" })

  const pdfPath = b.pdfUrl?.startsWith("/") ? `.${b.pdfUrl}` : b.pdfUrl
  const downloadUrl = `${process.env.BASE_URL}${b.pdfUrl?.startsWith("/") ? "" : "/"}${b.pdfUrl || pdfPath}`

  const r = await sendWhatsAppLink({ toPhoneE164: user.phone, text: `Ticket ${b.bookingId}: ${downloadUrl}` })
  res.json({ ok: !!r, r })
}
