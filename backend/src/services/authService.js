import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { userRepo } from "../repositories/userRepo.js"
import { env } from "../config/env.js"

function signTokens(user) {
  const payload = { sub: user._id.toString(), roles: user.roles }
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES })
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES })
  return { accessToken, refreshToken }
}

export const authService = {
  async register({ name, email, password }) {
    const exists = await userRepo.findByEmail(email)
    if (exists) throw Object.assign(new Error("Email already registered"), { status: 400 })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await userRepo.create({ name, email, passwordHash, roles: ["Attendee"] })
    const tokens = signTokens(user)
    return { user: { id: user.id, name: user.name, email: user.email, roles: user.roles }, tokens }
  },
  async login({ email, password }) {
    const user = await userRepo.findByEmail(email)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 })
    }
    const tokens = signTokens(user)
    return { user: { id: user.id, name: user.name, email: user.email, roles: user.roles }, tokens }
  },
}
