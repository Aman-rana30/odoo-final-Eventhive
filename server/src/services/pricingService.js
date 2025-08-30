import { Coupon } from "../models/Coupon.js"

export function calcSubtotal(items) {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0)
}

export function applyCouponToItems(items, coupon, now = new Date()) {
  if (!coupon || !coupon.active) return { discount: 0, items }
  if (coupon.validFrom && now < new Date(coupon.validFrom)) return { discount: 0, items }
  if (coupon.validTo && now > new Date(coupon.validTo)) return { discount: 0, items }

  let discount = 0
  const subtotal = calcSubtotal(items)

  switch (coupon.type) {
    case "PERCENT": {
      discount = Math.round((subtotal * coupon.value) / 100)
      break
    }
    case "FIXED": {
      discount = Math.min(coupon.value, subtotal)
      break
    }
    case "EARLY_BIRD": {
      // Same as fixed or percent but gated by time window; assume coupon.validTo is early window end
      discount = Math.round((subtotal * coupon.value) / 100)
      break
    }
    case "GROUP": {
      // e.g., value = 6 means "Buy 5 Get 1" (one free per 6 tickets)
      const totalQty = items.reduce((q, it) => q + it.qty, 0)
      const freeCount = Math.floor(totalQty / coupon.value)
      // Free ticket value equals cheapest ticket price
      const prices = items.flatMap((it) => Array(it.qty).fill(it.price)).sort((a, b) => a - b)
      discount = prices.slice(0, freeCount).reduce((s, p) => s + p, 0)
      break
    }
    case "BOGO": {
      // For simplicity treat as GROUP of 2
      const totalQty = items.reduce((q, it) => q + it.qty, 0)
      const freeCount = Math.floor(totalQty / 2)
      const prices = items.flatMap((it) => Array(it.qty).fill(it.price)).sort((a, b) => a - b)
      discount = prices.slice(0, freeCount).reduce((s, p) => s + p, 0)
      break
    }
  }

  if (coupon.minAmount && subtotal < coupon.minAmount) discount = 0
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)

  return { discount, items }
}

export async function resolveCoupon(code) {
  if (!code) return null
  return Coupon.findOne({ code: code.toUpperCase(), active: true })
}
