"use client"

import { useEffect, useState } from "react"
import { api } from "../api/client.js"
import { Link } from "react-router-dom"

export default function Home() {
  const [events, setEvents] = useState([])
  const [q, setQ] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  async function load() {
    const res = await api.get("/events", { params: { q, category, page, limit: 9 } })
    setEvents(res.data.data)
    setTotal(res.data.total)
  }

  useEffect(() => {
    load()
  }, [q, category, page])

  const pages = Math.ceil(total / 9)

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Search events" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option>Music</option>
          <option>Tech</option>
          <option>Sports</option>
          <option>Theatre</option>
          <option>Food</option>
          <option>Business</option>
        </select>
      </div>
      <div className="row g-3">
        {events.map((e) => (
          <div className="col-12 col-md-6 col-lg-4" key={e._id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{e.title}</h5>
                <p className="card-text">{e.description}</p>
                <Link className="btn btn-primary" to={`/e/${e.slug}`}>
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <nav className="mt-3">
          <ul className="pagination">
            {Array.from({ length: pages }).map((_, i) => (
              <li className={`page-item ${page === i + 1 ? "active" : ""}`} key={i}>
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
