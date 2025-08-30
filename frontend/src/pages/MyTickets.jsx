import { useQuery } from "@tanstack/react-query"
import api from "../api/axios"

export default function MyTickets() {
  const { data } = useQuery({ queryKey: ["mine"], queryFn: async () => (await api.get("/api/bookings/mine")).data })
  return (
    <div className="container py-4">
      <h3>My Tickets</h3>
      <div className="list-group">
        {data?.bookings?.map((b) => (
          <a
            key={b._id}
            href={b.pdfUrl}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <div>
              <div className="fw-semibold">Booking {b.bookingId}</div>
              <div className="text-muted">Total ₹{b.total}</div>
            </div>
            <span className="badge rounded-pill text-bg-primary">Download PDF</span>
          </a>
        ))}
      </div>
    </div>
  )
}
