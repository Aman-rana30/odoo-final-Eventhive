import { Router } from "express"
import { validateCoupon } from "../controllers/couponController.js"
const r = Router()
r.post("/validate", validateCoupon)
export default r
