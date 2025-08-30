"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState("Attendee")
  const [email, setEmail] = useState("attendee@eventhive.local")
  const [password, setPassword] = useState("password")
  const [err, setErr] = useState("")

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(name, email, password)
      nav("/")
    } catch (e) {
      setErr("Registration failed")
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-3">Create your account</h3>
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={onSubmit} className="vstack gap-3">
        <input className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="form-control"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-100" type="submit">
          Register
        </button>
      </form>
      <p className="mt-3 text-muted">
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
