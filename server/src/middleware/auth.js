import jwt from "jsonwebtoken"

export function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null
    if (!token) {
      if (!required) return next()
      return res.status(401).json({ error: "Unauthorized" })
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      req.user = payload
      return next()
    } catch {
      return res.status(401).json({ error: "Invalid token" })
    }
  }
}

export function roles(...allowed) {
  return (req, res, next) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: "Unauthorized" })
    const ok = (user.roles || []).some((r) => allowed.includes(r))
    if (!ok) return res.status(403).json({ error: "Forbidden" })
    return next()
  }
}
