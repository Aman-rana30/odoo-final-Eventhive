"use client"

import { createContext, useContext, useEffect, useState } from "react"
import api from "../api/axios"

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("eh_token")
    if (token) {
      api
        .get("/api/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setReady(true))
    } else {
      setReady(true)
    }
  }, [])

  const persist = (res) => {
    const token = res.data?.token || res.data?.tokens?.access
    const u = res.data?.user
    if (token) localStorage.setItem("eh_token", token)
    if (u) setUser(u)
    return u
  }

  const login = async (email, password) => {
    setError(null)
    const res = await api.post("/api/auth/login", { email, password })
    return persist(res)
  }
  const register = async (name, email, password) => {
    setError(null)
    const res = await api.post("/api/auth/register", { name, email, password })
    return persist(res)
  }
  const logout = () => {
    localStorage.removeItem("eh_token")
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, ready, error, login, register, logout }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
