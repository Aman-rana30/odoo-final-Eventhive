export async function razorpay(req, res) {
  // Verify webhook signature here if configured. For brevity, we accept and log.
  console.log("[webhook] razorpay", req.body?.event || "received")
  res.json({ received: true })
}
