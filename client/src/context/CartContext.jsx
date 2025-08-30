"use client"

import { createContext, useContext, useMemo, useState } from "react"

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [eventId, setEventId] = useState(null)
  const [items, setItems] = useState([]) // [{ticketTypeId, qty, price}]
  const [couponCode, setCouponCode] = useState("")

  function addItem({ eventId: eId, ticketTypeId, price }) {
    if (eventId && eventId !== eId) {
      // reset if switching events
      setItems([])
    }
    setEventId(eId)
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.ticketTypeId === ticketTypeId)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }
        return copy
      }
      return [...prev, { ticketTypeId, qty: 1, price }]
    })
  }

  function removeItem(ticketTypeId) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.ticketTypeId === ticketTypeId)
      if (idx < 0) return prev
      const copy = [...prev]
      const nextQty = copy[idx].qty - 1
      if (nextQty <= 0) return copy.filter((i) => i.ticketTypeId !== ticketTypeId)
      copy[idx] = { ...copy[idx], qty: nextQty }
      return copy
    })
  }

  function clear() {
    setItems([])
    setCouponCode("")
    setEventId(null)
  }

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items])

  return (
    <CartCtx.Provider value={{ eventId, items, couponCode, setCouponCode, addItem, removeItem, clear, subtotal }}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() {
  return useContext(CartCtx)
}
