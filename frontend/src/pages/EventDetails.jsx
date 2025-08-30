"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

export default function EventDetails() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const { data } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => (await api.get(`/api/events/${slug}`)).data,
  })
  const [qtyById, setQtyById] = useState({})
  const subtotal = useMemo(() => {
    return data?.tickets?.reduce((sum, t) => sum + (qtyById[t._id] || 0) * t.price, 0) || 0
  }, [data, qtyById])

  const onCheckout = () => {
    if (!user) return nav("/login")
    // Save cart
    const items = Object.entries(qtyById)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => ({ ticketTypeId: id, qty: q }))
    if (!items.length) return
    localStorage.setItem("eh_cart", JSON.stringify({ eventId: data.event._id, items }))
    nav("/checkout")
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-7">
          <img
            className="img-fluid rounded"
            alt={data?.event?.title || "Event"}
            src={data?.event?.coverImageUrl || "/placeholder.svg?height=400&width=800&query=event banner"}
          />
          <h2 className="mt-3">{data?.event?.title}</h2>
          <p className="text-muted">{data?.event?.description}</p>
        </div>
        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              <h5>Tickets</h5>
              {data?.tickets?.map((t) => (
                <div className="d-flex align-items-center justify-content-between border-bottom py-2" key={t._id}>
                  <div>
                    <div className="fw-semibold">{t.name}</div>
                    <div className="text-muted">₹{t.price}</div>
                  </div>
                  <div className="input-group" style={{ width: 140 }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setQtyById({ ...qtyById, [t._id]: Math.max(0, (qtyById[t._id] || 0) - 1) })}
                    >
                      -
                    </button>
                    <input className="form-control text-center" readOnly value={qtyById[t._id] || 0} />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setQtyById({ ...qtyById, [t._id]: (qtyById[t._id] || 0) + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between mt-3">
                <div className="fw-bold">Subtotal</div>
                <div className="fw-bold">₹{subtotal}</div>
              </div>
              <button className="btn btn-primary w-100 mt-3" disabled={subtotal === 0} onClick={onCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
