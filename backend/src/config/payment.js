import crypto from "crypto"
import { env } from "./env.js"

// Minimal helpers; replace with real SDK if desired
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!env.RAZORPAY_KEY_SECRET) return false
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(body).digest("hex")
  return expected === signature
}
