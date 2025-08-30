"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Link, useNavigate, useLocation } from "react-router-dom"

export default function Login() {
  const { login, user } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      nav(from, { replace: true })
    }
  }, [user, from, nav])

  async function onSubmit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      await login(email, password)
      // navigation handled by effect once user is set
    } catch (e) {
      setMsg(e.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 420 }}>
      <h1 className="h4 mb-3">Login</h1>
      <form onSubmit={onSubmit}>
        <div className="mb-2">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary w-100" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {msg && <div className="alert alert-danger mt-3">{msg}</div>}
      <p className="mt-3 text-muted">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  )
}
