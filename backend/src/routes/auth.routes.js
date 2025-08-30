import { Router } from "express"
import { authController } from "../controllers/authController.js"
import { auth as requireAuth } from "../middleware/auth.js"

const r = Router()
r.post("/register", authController.register)
r.post("/login", authController.login)
r.get("/me", requireAuth(), authController.me)

export default r
