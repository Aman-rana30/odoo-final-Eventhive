import { Booking } from "../models/Booking.js"
import { User } from "../models/User.js"
import { stringify } from "csv-stringify"
import ExcelJS from "exceljs"

async function getPaidBookings(eventId) {
  const bookings = await Booking.find({ eventId, status: "Paid" }).lean()
  const userIds = [...new Set(bookings.map((b) => b.userId?.toString()).filter(Boolean))]
  const users = await User.find({ _id: { $in: userIds } })
    .select("name email phone")
    .lean()
  const usersMap = new Map(users.map((u) => [u._id.toString(), u]))
  return bookings.map((b) => ({
    ...b,
    userInfo: b.userId ? usersMap.get(b.userId.toString()) : null,
  }))
}

export async function attendeesCsv(req, res) {
  const { eventId } = req.params
  const rows = [["Booking ID", "Name", "Email", "Phone", "Tickets", "Total", "Created At"]]
  const bookings = await getPaidBookings(eventId)
  for (const b of bookings) {
    const qty = (b.items || []).reduce((q, it) => q + (it.qty || 0), 0)
    rows.push([
      b.bookingId,
      b.userInfo?.name || "",
      b.userInfo?.email || "",
      b.userInfo?.phone || "",
      qty,
      b.total,
      new Date(b.createdAt).toISOString(),
    ])
  }
  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", `attachment; filename="attendees-${eventId}.csv"`)
  stringify(rows).pipe(res)
}

export async function salesCsv(req, res) {
  const { eventId } = req.params
  const rows = [["Booking ID", "Subtotal", "Discount", "Total", "Payment Status", "Created At"]]
  const bookings = await getPaidBookings(eventId)
  for (const b of bookings) {
    rows.push([
      b.bookingId,
      b.subtotal,
      b.discount,
      b.total,
      b.payment?.status || b.status,
      new Date(b.createdAt).toISOString(),
    ])
  }
  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", `attachment; filename="sales-${eventId}.csv"`)
  stringify(rows).pipe(res)
}

async function writeWorkbook(sheets) {
  const wb = new ExcelJS.Workbook()
  for (const { name, header, data } of sheets) {
    const ws = wb.addWorksheet(name)
    ws.addRow(header)
    data.forEach((row) => ws.addRow(row))
  }
  const buf = await wb.xlsx.writeBuffer()
  return buf
}

export async function attendeesXlsx(req, res) {
  const { eventId } = req.params
  const header = ["Booking ID", "Name", "Email", "Phone", "Tickets", "Total", "Created At"]
  const bookings = await getPaidBookings(eventId)
  const data = bookings.map((b) => [
    b.bookingId,
    b.userInfo?.name || "",
    b.userInfo?.email || "",
    b.userInfo?.phone || "",
    (b.items || []).reduce((q, it) => q + (it.qty || 0), 0),
    b.total,
    new Date(b.createdAt).toISOString(),
  ])
  const buf = await writeWorkbook([{ name: "Attendees", header, data }])
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  res.setHeader("Content-Disposition", `attachment; filename="attendees-${eventId}.xlsx"`)
  res.send(Buffer.from(buf))
}

export async function salesXlsx(req, res) {
  const { eventId } = req.params
  const header = ["Booking ID", "Subtotal", "Discount", "Total", "Payment Status", "Created At"]
  const bookings = await getPaidBookings(eventId)
  const data = bookings.map((b) => [
    b.bookingId,
    b.subtotal,
    b.discount,
    b.total,
    b.payment?.status || b.status,
    new Date(b.createdAt).toISOString(),
  ])
  const buf = await writeWorkbook([{ name: "Sales", header, data }])
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  res.setHeader("Content-Disposition", `attachment; filename="sales-${eventId}.xlsx"`)
  res.send(Buffer.from(buf))
}
