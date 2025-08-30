import { Link } from "react-router-dom"

export default function EventCard({ ev }) {
  return (
    <div className="card h-100 shadow-sm">
      <div
        className="ratio ratio-16x9 bg-light"
        style={{ backgroundImage: `url(${ev.coverImageUrl || "/event-cover.png"})`, backgroundSize: "cover" }}
      />
      <div className="card-body">
        <span className="badge text-bg-primary">{ev.category || "Event"}</span>
        <h5 className="card-title mt-2">{ev.title}</h5>
        <p className="card-text text-muted">{new Date(ev.startAt).toLocaleString()}</p>
        <Link to={`/event/${ev.slug}`} className="btn btn-primary w-100">
          View
        </Link>
      </div>
    </div>
  )
}
