"use client"

import { createContext, useContext, useEffect, useState } from "react"

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem("access")
    if (stored) setToken(stored)
  }, [])

  function login(t) {
    localStorage.setItem("access", t)
    setToken(t)
  }

  function logout() {
    localStorage.removeItem("access")
    setToken(null)
  }

  return <AuthCtx.Provider value={{ token, isAuthenticated: !!token, login, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
