"use client"

import { createContext, useContext, useMemo, useState } from "react"

const CartCtx = createContext(null)
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("eh_cart") || "{}"))
  const save = (c) => {
    setCart(c)
    localStorage.setItem("eh_cart", JSON.stringify(c))
  }
  const clear = () => save({})
  const value = useMemo(() => ({ cart, save, clear }), [cart])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}
export const useCart = () => useContext(CartCtx)
