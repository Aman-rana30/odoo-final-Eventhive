"use client"

import { useNavigate } from "react-router-dom"
import { api } from "../api/client.js"
import { useState } from "react"
import { useCart } from "../context/CartContext.jsx"

export default function Checkout() {
  const nav = useNavigate()
  const { eventId, items, couponCode, clear, subtotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [resp, setResp] = useState(null)

  async function pay() {
    setLoading(true)
    try {
      const co = await api.post(
        "/checkout/order",
        { eventId, items, couponCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access") || ""}`,
            "Content-Type": "application/json",
          },
        },
      )
      setResp(co.data)

      // Integrate Razorpay UI in real-world. For demo, simulate and request verification:
      const orderId = co.data.order.id
      const paymentId = "pay_test_" + Math.random().toString(36).slice(2)
      // NOTE: Signature verification requires real signature; for demo, backend verify may reject.
      const signature = "simulate"

      await api.post(
        "/checkout/verify",
        { orderId, paymentId, signature },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access") || ""}` },
        },
      )

      clear()
      nav("/my-tickets")
    } catch (e) {
      alert(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!eventId || items.length === 0) return <div>Nothing to checkout</div>
  return (
    <div>
      <h3>Checkout</h3>
      <div className="mb-3">
        <div className="fw-bold">Order summary</div>
        <ul className="list-group">
          {items.map((it) => (
            <li className="list-group-item d-flex justify-content-between" key={it.ticketTypeId}>
              <span>{it.ticketTypeId}</span>
              <span>
                {it.qty} × ₹{it.price}
              </span>
            </li>
          ))}
          <li className="list-group-item d-flex justify-content-between">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </li>
          {couponCode && (
            <li className="list-group-item d-flex justify-content-between">
              <span>Coupon</span>
              <span>{couponCode}</span>
            </li>
          )}
        </ul>
      </div>
      <button className="btn btn-primary" disabled={loading} onClick={pay}>
        {loading ? "Processing..." : "Pay (Simulate)"}
      </button>
    </div>
  )
}
