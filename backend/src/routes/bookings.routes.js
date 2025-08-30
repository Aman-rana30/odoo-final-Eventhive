import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { checkout, myBookings } from "../controllers/bookingController.js"

const r = Router()
r.post("/checkout", auth(true), checkout)
r.get("/mine", auth(true), myBookings)
export default r
