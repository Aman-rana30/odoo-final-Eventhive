import { Router } from "express"
import crypto from "crypto"
import { env } from "../config/env.js"

const r = Router()

// Simple signature verification (replace body as raw in production)
r.post("/razorpay", (req, res) => {
  const signature = req.headers["x-razorpay-signature"]
  if (!signature || !env.RAZORPAY_KEY_SECRET) return res.status(400).end()
  const body = JSON.stringify(req.body || {})
  const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(body).digest("hex")
  if (expected !== signature) return res.status(400).json({ error: "Invalid signature" })
  // Handle event
  console.log("[eventhive] razorpay webhook received")
  res.status(200).json({ ok: true })
})

export default r
