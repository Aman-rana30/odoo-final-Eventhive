import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/User.js"

function signTokens(user) {
  const payload = { sub: user._id.toString(), email: user.email, roles: user.roles }
  const access = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  })
  const refresh = jwt.sign({ sub: user._id.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  })
  return { access, refresh }
}

export async function register(req, res) {
  const { name, email, password, roles = ["Attendee"] } = req.body
  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ error: "Email already registered" })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, roles })
  const tokens = signTokens(user)
  return res.status(201).json({
    token: tokens.access,
    refreshToken: tokens.refresh,
    user: { id: user._id, name: user.name, email: user.email, roles: user.roles },
  })
}

export async function login(req, res) {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ error: "Invalid email or password" })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(400).json({ error: "Invalid email or password" })
  const tokens = signTokens(user)
  return res.json({
    token: tokens.access,
    refreshToken: tokens.refresh,
    user: { id: user._id, name: user.name, email: user.email, roles: user.roles },
  })
}

export async function refresh(req, res) {
  const { refresh } = req.body
  try {
    const payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ error: "Invalid refresh" })
    const tokens = signTokens(user)
    return res.json({ token: tokens.access, refreshToken: tokens.refresh })
  } catch {
    return res.status(401).json({ error: "Invalid refresh" })
  }
}

export async function logout(_req, res) {
  return res.json({ success: true })
}

export async function me(req, res) {
  const id = req.user?.sub
  if (!id) return res.status(401).json({ error: "Unauthorized" })
  const user = await User.findById(id).select("_id name email roles")
  if (!user) return res.status(404).json({ error: "User not found" })
  return res.json({ id: user._id, name: user.name, email: user.email, roles: user.roles })
}
