"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const nav = useNavigate()

  function handleLogout() {
    logout()
    nav("/login")
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom" aria-label="Main Navigation">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary text-balance" to="/">
          EventHive
        </Link>
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          <li className="nav-item">
            <Link className="nav-link" to="/my-tickets">
              My Tickets
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/organizer">
              Organizer
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/scan">
              Scan
            </Link>
          </li>
          {!isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link className="btn btn-outline-primary btn-sm" to="/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary btn-sm" to="/register">
                  Sign up
                </Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout} aria-label="Logout">
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}
