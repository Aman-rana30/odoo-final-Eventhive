export function applyDiscount({ subtotal, coupon }) {
  if (!coupon) return { discount: 0, total: subtotal }
  if (coupon.type === "PERCENT") {
    const d = Math.round((subtotal * coupon.value) / 100)
    return { discount: d, total: subtotal - d }
  }
  if (coupon.type === "FIXED") {
    const d = Math.min(coupon.value, subtotal)
    return { discount: d, total: subtotal - d }
  }
  return { discount: 0, total: subtotal }
}
