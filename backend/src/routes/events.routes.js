import { Router } from "express"
import { auth, requireRoles } from "../middlewares/auth.js"
import { listEvents, getBySlug, createEvent } from "../controllers/eventController.js"

const r = Router()
r.get("/", listEvents)
r.get("/:slug", getBySlug)
r.post("/", auth(true), requireRoles("Admin", "EventManager"), createEvent)
export default r
