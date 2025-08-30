import { Coupon } from "../models/Coupon.js"
import { applyCouponToItems } from "../services/pricingService.js"

export async function create(req, res) {
  const c = await Coupon.create(req.body)
  res.status(201).json(c)
}

export async function getByCode(req, res) {
  const c = await Coupon.findOne({ code: req.params.code.toUpperCase(), active: true }).lean()
  if (!c) return res.status(404).json({ error: "Coupon not found" })
  res.json(c)
}

export async function validate(req, res) {
  const { coupon, items } = req.body
  const result = applyCouponToItems(items || [], coupon || null)
  res.json(result)
}
