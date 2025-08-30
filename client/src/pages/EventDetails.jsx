"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../api/client.js"
import { useCart } from "../context/CartContext.jsx"

export default function EventDetails() {
  const { slug } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState({ event: null, tickets: [] })
  const [coupon, setCoupon] = useState("")
  const { addItem, removeItem, items, setCouponCode, subtotal } = useCart()

  useEffect(() => {
    api.get(`/events/${slug}`).then((res) => setData(res.data))
  }, [slug])

  const selectedById = useMemo(() => {
    const idx = new Map(items.map((i) => [i.ticketTypeId, i.qty]))
    return idx
  }, [items])

  function inc(tt) {
    addItem({ eventId: data.event._id, ticketTypeId: tt._id, price: tt.price })
  }
  function dec(tt) {
    removeItem(tt._id)
  }
  function goCheckout() {
    setCouponCode(coupon)
    nav("/checkout")
  }

  if (!data.event) return <div>Loading...</div>
  return (
    <div>
      <h2 className="mb-3 text-pretty">{data.event.title}</h2>
      <p>{data.event.description}</p>
      <div className="list-group mb-3" role="list">
        {data.tickets.map((t) => {
          const qty = selectedById.get(t._id) || 0
          return (
            <div
              className="list-group-item d-flex justify-content-between align-items-center"
              key={t._id}
              role="listitem"
            >
              <div>
                <div className="fw-bold">{t.name}</div>
                <small>₹{t.price}</small>
              </div>
              <div className="btn-group" role="group" aria-label={`Quantity for ${t.name}`}>
                <button className="btn btn-outline-secondary" onClick={() => dec(t)} aria-label={`Decrease ${t.name}`}>
                  -
                </button>
                <button className="btn btn-outline-secondary" disabled aria-live="polite">
                  {qty}
                </button>
                <button className="btn btn-outline-secondary" onClick={() => inc(t)} aria-label={`Increase ${t.name}`}>
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="row g-2 align-items-center">
        <div className="col-12 col-md">
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              aria-label="Coupon code"
            />
            <span className="input-group-text">Subtotal ₹{subtotal}</span>
          </div>
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-primary w-100" onClick={goCheckout} disabled={items.length === 0}>
            Go to checkout
          </button>
        </div>
      </div>
    </div>
  )
}
