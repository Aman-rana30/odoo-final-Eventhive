"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import api from "../api/axios"
import { useNavigate } from "react-router-dom"

export default function Checkout() {
  const nav = useNavigate()
  const [cart, setCart] = useState(null)

  useEffect(() => {
    const c = localStorage.getItem("eh_cart")
    if (!c) return nav("/browse")
    setCart(JSON.parse(c))
  }, [nav])

  const checkout = useMutation({
    mutationFn: async () => (await api.post("/api/bookings/checkout", cart)).data,
  })

  const onPay = async () => {
    const res = await checkout.mutateAsync()
    localStorage.removeItem("eh_cart")
    nav("/my")
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h3>Checkout</h3>
      <p className="text-muted">Confirm and place your order.</p>
      <button className="btn btn-primary" onClick={onPay} disabled={!cart || checkout.isPending}>
        {checkout.isPending ? "Processing..." : "Pay & Get Tickets"}
      </button>
      {checkout.isError && (
        <div className="alert alert-danger mt-3">
          Failed: {checkout.error?.response?.data?.error || "Unknown error"}
        </div>
      )}
    </div>
  )
}
