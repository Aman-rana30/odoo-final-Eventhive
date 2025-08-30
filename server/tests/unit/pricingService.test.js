import { applyCouponToItems } from "../../src/services/pricingService.js"

describe("pricing engine", () => {
  const items = [
    { price: 100, qty: 2 },
    { price: 200, qty: 1 },
  ] // subtotal 400

  test("percent coupon", () => {
    const r = applyCouponToItems(items, { type: "PERCENT", value: 10, active: true })
    expect(r.discount).toBe(40)
  })

  test("fixed coupon", () => {
    const r = applyCouponToItems(items, { type: "FIXED", value: 50, active: true })
    expect(r.discount).toBe(50)
  })

  test("group 6 (buy 5 get 1 free)", () => {
    const six = Array.from({ length: 6 }, () => ({ price: 100, qty: 1 }))
    const r = applyCouponToItems(six, { type: "GROUP", value: 6, active: true })
    expect(r.discount).toBe(100)
  })

  test("bogo", () => {
    const two = [{ price: 100, qty: 2 }]
    const r = applyCouponToItems(two, { type: "BOGO", value: 2, active: true })
    expect(r.discount).toBe(100)
  })
})
