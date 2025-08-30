import { useEvents } from "../api/hooks"

export default function Home() {
  const { data, isLoading } = useEvents({ limit: 6 })
  return (
    <main>
      <h1 className="h4 mb-3">Upcoming Events</h1>
      {isLoading && <p>Loading...</p>}
      <div className="row g-3">
        {data?.data?.map((e) => (
          <div className="col-12 col-md-6 col-lg-4" key={e._id}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6">{e.title}</h2>
                <p className="text-muted mb-0">{new Date(e.startAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
