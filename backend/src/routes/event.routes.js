import { Router } from "express"
import { eventController } from "../controllers/eventController.js"
import { requireAuth, requireRole } from "../middlewares/auth.js"

const r = Router()
r.get("/", eventController.list)
r.get("/:slug", eventController.bySlug)
r.post("/", requireAuth, requireRole("Admin", "EventManager"), eventController.create)
export default r
