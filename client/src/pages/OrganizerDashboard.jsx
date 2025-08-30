"use client"

import { useEffect, useState } from "react"
import { api } from "../api/client.js"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

export default function OrganizerDashboard() {
  const [eventId, setEventId] = useState("")
  const [kpis, setKpis] = useState({ revenue: 0, tickets: 0, rate: 0 })
  const [series, setSeries] = useState([])

  useEffect(() => {
    setSeries([
      { day: "Mon", sales: 10 },
      { day: "Tue", sales: 25 },
      { day: "Wed", sales: 40 },
    ])
  }, [])

  async function loadStats() {
    if (!eventId) return
    const s = await api.get(`/events/${eventId}/checkin/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access") || ""}` },
    })
    setKpis((k) => ({ ...k, tickets: s.data.totalBookings, rate: s.data.rate }))
  }

  return (
    <div>
      <h3>Organizer Analytics</h3>

      <div className="mb-3">
        <label className="form-label">Event ID</label>
        <div className="input-group">
          <input
            className="form-control"
            placeholder="Enter Event ID"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          />
          <button className="btn btn-outline-primary" onClick={loadStats}>
            Load Stats
          </button>
          {eventId && (
            <>
              <a
                className="btn btn-outline-secondary"
                href={`/api/events/${eventId}/reports/attendees.csv`}
                target="_blank"
                rel="noreferrer"
              >
                Attendees CSV
              </a>
              <a
                className="btn btn-outline-secondary"
                href={`/api/events/${eventId}/reports/sales.csv`}
                target="_blank"
                rel="noreferrer"
              >
                Sales CSV
              </a>
              <a
                className="btn btn-outline-secondary"
                href={`/api/events/${eventId}/reports/attendees.xlsx`}
                target="_blank"
                rel="noreferrer"
              >
                Attendees XLSX
              </a>
              <a
                className="btn btn-outline-secondary"
                href={`/api/events/${eventId}/reports/sales.xlsx`}
                target="_blank"
                rel="noreferrer"
              >
                Sales XLSX
              </a>
            </>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-bold">Revenue</div>₹{kpis.revenue}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-bold">Tickets Sold</div>
              {kpis.tickets}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-bold">Check-in Rate</div>
              {kpis.rate}%
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <div className="fw-bold mb-2">Sales (Last 7 days)</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={series}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#0d6efd" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
