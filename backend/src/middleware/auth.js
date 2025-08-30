import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

export function auth() {
  return (req, res, next) => {
    const h = req.headers.authorization || ""
    const m = h.match(/^Bearer\s+(.+)$/i)
    if (!m) return res.status(401).json({ error: "Unauthorized" })
    try {
      const payload = jwt.verify(m[1], env.JWT_ACCESS_SECRET)
      req.user = { id: payload.sub, roles: payload.roles || [] }
      next()
    } catch {
      return res.status(401).json({ error: "Invalid token" })
    }
  }
}

export function roles(...allowed) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || []
    const ok = allowed.length === 0 || userRoles.some((r) => allowed.includes(r))
    if (!ok) return res.status(403).json({ error: "Forbidden" })
    next()
  }
}
