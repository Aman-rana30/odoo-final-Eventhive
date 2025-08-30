"use client"
import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
      <div className="container">
        <Link className="navbar-brand brand fw-bold text-primary" to="/">
          EventHive
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/browse">
                Browse
              </NavLink>
            </li>
            {user?.roles?.includes("EventManager") && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/organizer">
                  Organizer
                </NavLink>
              </li>
            )}
            {user?.roles?.includes("Volunteer") && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/scanner">
                  Scanner
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/my">
                    My Tickets
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-secondary ms-2" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
