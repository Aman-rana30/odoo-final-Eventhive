"use client"

import { useState, useEffect } from "react"
import { api } from "../api/client.js"

export default function VolunteerScanner() {
  const [bookingId, setBookingId] = useState("")
  const [eventId, setEventId] = useState("")
  const [msg, setMsg] = useState("")
  const [stats, setStats] = useState({ totalBookings: 0, checkedIn: 0, rate: 0 })

  useEffect(() => {
    if (!eventId) return
    let es
    try {
      es = new EventSource(`${api.defaults.baseURL}/events/${eventId}/checkin/stream`, { withCredentials: false })
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data)
          if (payload.type === "stats") setStats(payload.data)
        } catch {}
      }
    } catch {}
    return () => {
      es && es.close()
    }
  }, [eventId])

  async function scan() {
    try {
      const res = await api.post(
        "/checkin/scan",
        { bookingId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access") || ""}` } },
      )
      setMsg("Checked in!")
      // Also fetch stats if no SSE
      if (eventId) {
        const s = await api.get(`/events/${eventId}/checkin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access") || ""}` },
        })
        setStats(s.data)
      }
    } catch (e) {
      setMsg(e.response?.data?.error || e.message)
    }
  }

  return (
    <div>
      <h3>Check-in Scanner</h3>
      <div className="mb-3">
        <label className="form-label">Event ID (for live stats)</label>
        <input
          className="form-control"
          placeholder="Enter Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
      </div>
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-bold">Total Bookings</div>
              {stats.totalBookings}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-bold">Checked In</div>
              {stats.checkedIn}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-bold">Rate</div>
              {stats.rate}%
            </div>
          </div>
        </div>
      </div>
      <div className="input-group">
        <input
          className="form-control"
          placeholder="Enter booking ID (scan payload)"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />
        <button className="btn btn-primary" onClick={scan}>
          Scan
        </button>
      </div>
      {msg && <div className="alert alert-info mt-3">{msg}</div>}
    </div>
  )
}
