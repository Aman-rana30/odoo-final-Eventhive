"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "../api/axios"
import EventCard from "../components/EventCard"

export default function Browse() {
  const [q, setQ] = useState("")
  const { data } = useQuery({
    queryKey: ["browse", q],
    queryFn: async () => (await api.get("/api/events", { params: { q, limit: 20 } })).data,
  })
  return (
    <div className="container py-4">
      <div className="input-group mb-4">
        <input
          className="form-control"
          placeholder="Search events..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn-outline-secondary" onClick={() => null}>
          Search
        </button>
      </div>
      <div className="row g-4">
        {data?.events?.map((ev) => (
          <div className="col-sm-6 col-lg-3" key={ev._id}>
            <EventCard ev={ev} />
          </div>
        ))}
      </div>
    </div>
  )
}
