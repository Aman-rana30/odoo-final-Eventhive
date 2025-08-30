"use client"

import { useState } from "react"
import { api } from "../api/client.js"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

export default function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("att@eventhive.local")
  const [password, setPassword] = useState("password")
  const [error, setError] = useState("")

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await api.post("/auth/login", { email, password })
      login(res.data.tokens.access)
      nav("/")
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    }
  }

  return (
    <form className="mx-auto" style={{ maxWidth: 420 }} onSubmit={submit} aria-label="Login form">
      <h3 className="mb-3">Login</h3>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="btn btn-primary w-100">Login</button>
      <div className="mt-3 text-center">
        <small>
          New here? <Link to="/register">Create an account</Link>
        </small>
      </div>
    </form>
  )
}
