import * as svc from "../services/bookingService.js"
import { Booking } from "../models/Booking.js"

export async function createOrder(req, res) {
  const { eventId, items, couponCode } = req.body
  const resp = await svc.createGatewayOrder(req.user.sub, { eventId, items, couponCode })
  res.json(resp)
}

export async function verifyAndFinalize(req, res) {
  const { orderId, paymentId, signature } = req.body
  const booking = await svc.verifyAndFinalizeBooking(req.user.sub, { orderId, paymentId, signature })
  res.json(booking)
}

export async function myBookings(req, res) {
  const list = await Booking.find({ userId: req.user.sub }).sort({ createdAt: -1 }).lean()
  res.json(list)
}

export async function cancelBooking(req, res) {
  const { bookingId } = req.params
  const resp = await svc.cancelAndRefundBooking(req.user.sub, bookingId)
  res.json(resp)
}
