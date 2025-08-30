import Razorpay from "razorpay"
import crypto from "crypto"

function getClient() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) throw new Error("Razorpay keys not set")
  return new Razorpay({ key_id, key_secret })
}

export async function createOrder(amount, currency = "INR", receipt) {
  const client = getClient()
  return client.orders.create({ amount: Math.round(amount * 100), currency, receipt, payment_capture: 1 })
}

export function verifySignature({ orderId, paymentId, signature }) {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  hmac.update(`${orderId}|${paymentId}`)
  const digest = hmac.digest("hex")
  return digest === signature
}
