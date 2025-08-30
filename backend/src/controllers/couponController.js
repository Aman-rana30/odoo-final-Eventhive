import Joi from "joi"
import Coupon from "../models/Coupon.js"

export async function validateCoupon(req, res) {
  const schema = Joi.object({
    code: Joi.string().required(),
    eventId: Joi.string().required(),
    amount: Joi.number().required(),
  })
  const { error, value } = schema.validate(req.body)
  if (error) return res.status(400).json({ error: error.message })

  const now = new Date()
  const coupon = await Coupon.findOne({ code: value.code, active: true }).lean()
  if (!coupon) return res.status(404).json({ error: "Invalid coupon" })
  if (coupon.validFrom && now < new Date(coupon.validFrom)) return res.status(400).json({ error: "Coupon not started" })
  if (coupon.validTo && now > new Date(coupon.validTo)) return res.status(400).json({ error: "Coupon expired" })
  if (coupon.applicableEventIds?.length && !coupon.applicableEventIds.some((id) => id.toString() === value.eventId)) {
    return res.status(400).json({ error: "Coupon not applicable" })
  }
  if (coupon.minAmount && value.amount < coupon.minAmount) return res.status(400).json({ error: "Amount too low" })

  let discount = 0
  if (coupon.type === "PERCENT")
    discount = Math.min(value.amount * (coupon.value / 100), coupon.maxDiscount || Number.POSITIVE_INFINITY)
  if (coupon.type === "FIXED") discount = Math.min(coupon.value, value.amount)

  res.json({ valid: true, discount, coupon })
}
