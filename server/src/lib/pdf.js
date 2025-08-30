import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"

export async function generateTicketPdf({ booking, qrBuffer }) {
  const outDir = process.env.UPLOADS_DIR || "uploads"
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const filePath = path.join(outDir, `ticket-${booking.bookingId}.pdf`)
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const stream = fs.createWriteStream(filePath)
  doc.pipe(stream)
  doc.fontSize(20).text("EventHive Ticket", { align: "center" })
  doc.moveDown()
  doc.fontSize(12).text(`Booking ID: ${booking.bookingId}`)
  doc.text(`Event: ${booking.eventId}`)
  doc.text(`Total: ₹${booking.total}`)
  doc.moveDown()
  doc.text("Scan at entry:", { underline: true })
  doc.image(qrBuffer, { fit: [200, 200] })
  doc.end()
  await new Promise((resolve) => stream.on("finish", resolve))
  return filePath
}
