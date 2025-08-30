import { Router } from "express"
import * as authCtrl from "../controllers/authController.js"
import * as eventCtrl from "../controllers/eventController.js"
import * as ticketCtrl from "../controllers/ticketController.js"
import * as couponCtrl from "../controllers/couponController.js"
import * as bookingCtrl from "../controllers/bookingController.js"
import * as deliveryCtrl from "../controllers/deliveryController.js"
import * as checkinCtrl from "../controllers/checkinController.js"
import * as webhookCtrl from "../controllers/webhookController.js"
import * as reportsCtrl from "../controllers/reportsController.js"
import { auth, roles } from "../middleware/auth.js"

const router = Router()

// Auth
router.post("/auth/register", authCtrl.register)
router.post("/auth/login", authCtrl.login)
router.get("/auth/me", auth(), authCtrl.me)
router.post("/auth/refresh", authCtrl.refresh)
router.post("/auth/logout", authCtrl.logout)

// Events
router.get("/events", eventCtrl.list)
router.get("/events/featured", eventCtrl.featured)
router.get("/events/trending", eventCtrl.trending)
router.get("/events/:slug", eventCtrl.getBySlug)
router.post("/events", auth(), roles("Admin", "EventManager"), eventCtrl.create)
router.put("/events/:id", auth(), roles("Admin", "EventManager"), eventCtrl.update)
router.post("/events/:id/publish", auth(), roles("Admin", "EventManager"), eventCtrl.publish)

// Ticket types
router.get("/events/:eventId/tickets", ticketCtrl.listByEvent)
router.post("/events/:eventId/tickets", auth(), roles("Admin", "EventManager"), ticketCtrl.create)
router.put("/tickets/:id", auth(), roles("Admin", "EventManager"), ticketCtrl.update)

// Coupons
router.post("/coupons", auth(), roles("Admin", "EventManager"), couponCtrl.create)
router.get("/coupons/:code", couponCtrl.getByCode)
router.post("/coupons/validate", couponCtrl.validate)

// Checkout & bookings
router.post("/checkout/order", auth(), bookingCtrl.createOrder)
router.post("/checkout/verify", auth(), bookingCtrl.verifyAndFinalize)
router.get("/me/bookings", auth(), bookingCtrl.myBookings)
router.post("/bookings/:bookingId/cancel", auth(), bookingCtrl.cancelBooking)

// Delivery
router.post("/bookings/:bookingId/email", auth(), deliveryCtrl.sendEmailForBooking)
router.post("/bookings/:bookingId/whatsapp", auth(), deliveryCtrl.sendWhatsAppForBooking)

// Check-in
router.post("/checkin/scan", auth(), roles("Admin", "EventManager", "Volunteer"), checkinCtrl.scan)
router.get("/events/:eventId/checkin/stats", auth(), roles("Admin", "EventManager"), checkinCtrl.stats)
router.get("/events/:eventId/checkin/stream", auth(), roles("Admin", "EventManager"), checkinCtrl.stream)

// Reports/Exports
router.get("/events/:eventId/reports/attendees.csv", auth(), roles("Admin", "EventManager"), reportsCtrl.attendeesCsv)
router.get("/events/:eventId/reports/sales.csv", auth(), roles("Admin", "EventManager"), reportsCtrl.salesCsv)
router.get("/events/:eventId/reports/attendees.xlsx", auth(), roles("Admin", "EventManager"), reportsCtrl.attendeesXlsx)
router.get("/events/:eventId/reports/sales.xlsx", auth(), roles("Admin", "EventManager"), reportsCtrl.salesXlsx)

// Webhooks
router.post("/webhooks/razorpay", webhookCtrl.razorpay)

// Health
router.get("/health", (_req, res) => res.json({ ok: true }))

export default router
