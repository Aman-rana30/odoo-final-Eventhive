import { Router } from "express"
import authRoutes from "./auth.routes.js"
import eventRoutes from "./event.routes.js"
import webhookRoutes from "../webhooks/razorpay.js"

const router = Router()
router.use("/auth", authRoutes)
router.use("/events", eventRoutes)
router.use("/webhooks", webhookRoutes)
export default router
