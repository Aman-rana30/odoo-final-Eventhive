export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-balance">EventHive scaffold</h1>
      <p className="text-muted-foreground">
        Two folders: backend (Express MVC) and frontend (Vite React). After npm install, start each side with one
        command.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Backend</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>cd backend</li>
          <li>npm run dev</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Tip: copy backend/.env.example to backend/.env and set MONGO_URI and JWT secrets.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Frontend</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>cd frontend</li>
          <li>npm run dev</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Tip: copy frontend/.env.example to frontend/.env and set VITE_API_BASE_URL (default http://localhost:4000).
        </p>
      </section>

      <section className="space-y-1">
        <h3 className="text-sm font-medium">Structure overview</h3>
        <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">
          {`eventhive/
  backend/
    src/
      config/ (db, env, logger, payment, mail, whatsapp)
      models/
      repositories/
      services/
      controllers/
      routes/
      middlewares/
      utils/ (qr, pdf, csv, excel, dates, promo)
      jobs/
      webhooks/
      app.js
      server.js
    package.json
    .env.example
  frontend/
    src/
      api/ (axios client, query hooks)
      components/
      pages/
      context/ (or store/)
      hooks/
      routes/
      styles/ (bootstrap overrides + plain CSS)
      utils/
      main.jsx
      App.jsx
    index.html
    package.json
  README.md`}
        </pre>
      </section>
    </main>
  )
}
