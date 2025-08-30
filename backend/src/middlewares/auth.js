import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: "Unauthorized" })
  try {
    req.user = jwt.verify(token, env.JWT_ACCESS_SECRET)
    next()
  } catch {
    res.status(401).json({ error: "Unauthorized" })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" })
    const ok = (req.user.roles || []).some((r) => roles.includes(r))
    if (!ok) return res.status(403).json({ error: "Forbidden" })
    next()
  }
}
