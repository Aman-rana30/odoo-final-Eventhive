"use client"
import { useAuth } from "../context/AuthContext"

export default function OrganizerDashboard() {
  const { user } = useAuth()
  return (
    <div className="container py-4">
      <h3>Organizer Dashboard</h3>
      <p className="text-muted">Welcome {user?.name}. Create and manage events. (Stub UI)</p>
      <div className="alert alert-info">
        For brevity, core booking flow is implemented. I can extend organizer CRUD next.
      </div>
    </div>
  )
}
