"use client"

import { useEffect, useState } from "react"
import { api } from "../api/client.js"

export default function MyTickets() {
  const [list, setList] = useState([])

  useEffect(() => {
    api
      .get("/me/bookings", { headers: { Authorization: `Bearer ${localStorage.getItem("access") || ""}` } })
      .then((res) => setList(res.data))
  }, [])

  return (
    <div>
      <h3>My Tickets</h3>
      <div className="list-group">
        {list.map((b) => (
          <div className="list-group-item d-flex justify-content-between align-items-center" key={b._id}>
            <div>
              <div className="fw-bold">{b.bookingId}</div>
              <small>
                Status: {b.status} • Total ₹{b.total}
              </small>
            </div>
            <div className="btn-group">
              {b.pdfUrl && (
                <a className="btn btn-outline-secondary" href={b.pdfUrl} target="_blank" rel="noreferrer">
                  PDF
                </a>
              )}
              <button
                className="btn btn-outline-secondary"
                onClick={async () => {
                  await api.post(
                    `/bookings/${b.bookingId}/email`,
                    {},
                    { headers: { Authorization: `Bearer ${localStorage.getItem("access") || ""}` } },
                  )
                  alert("Email sent (if configured)")
                }}
              >
                Email
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
