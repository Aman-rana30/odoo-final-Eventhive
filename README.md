# EventHive — MERN (JS only)

Production-ready event management and ticketing platform.
- Frontend: React + Vite + Bootstrap (mobile-first)
- Backend: Node.js + Express (MVC with services/repositories), MongoDB + Mongoose
- Auth: JWT (access + refresh), RBAC (Admin, EventManager, Volunteer, Attendee)
- Payments: Razorpay (primary), Stripe-ready toggle stub
- Tickets: PDF + QR, Email, WhatsApp links
- Notifications: Reminders T-24h and T-1h (cron)
- Check-in: QR scanner + anti-duplicate
- Analytics & Exports: organizer KPIs, CSV/XLSX

## Prerequisites
- Node 18+
- MongoDB (local or cloud)
- Razorpay test keys
- SMTP credentials (dev can use Mailtrap/ethereal)
- (Optional) WhatsApp Cloud API token and phone ID

## Structure
eventhive/
├── backend/                 # Express API (MVC + service/repo)
│   └── src/
│       ├── config/          # db, env, logger, payment, mail, whatsapp
│       ├── models/
│       ├── repositories/
│       ├── services/
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/
│       ├── utils/           # qr, pdf, csv, excel, dates, promo
│       ├── jobs/            # cron tasks
│       ├── webhooks/
│       ├── app.js
│       └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/                # React + Vite + Bootstrap
│   ├── src/
│   │   ├── api/             # axios client, query hooks
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/         # or store/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── styles/          # bootstrap overrides + plain CSS
│   │   ├── utils/
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
└── README.md

## Environment
- Copy backend/.env.example to backend/.env and set:
  - PORT, MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL, BASE_URL
- Copy frontend/.env.example to frontend/.env and set:
  - VITE_API_BASE_URL (default http://localhost:4000)

## Install & Run (VS Code, two commands per app after npm install)
- Backend:
  - cd backend && npm install
  - npm run dev
- Frontend:
  - cd frontend && npm install
  - npm run dev

## Scripts
- Backend
  - npm run dev — nodemon + ts-node not used (JS only); starts Express on PORT
  - npm run seed — seeds users, events, ticket types, coupons
  - npm test — runs unit/integration tests (Jest)
- Frontend
  - npm run dev — Vite dev server
  - npm run build — Vite build
  - npm run preview — Vite preview

## .env.example
See backend/.env.example (copy to backend/.env). Frontend uses VITE_API_BASE_URL set in frontend/.env (optional).

## Seeding
- Creates admin, organizer, volunteer, attendee users
- 6 example events + ticket types
- Coupons: early bird, percent, fixed, group/BOGO

Run:
  cd backend && npm run seed

## Postman
Import backend/postman/eventhive.postman_collection.json

## Tests
- Unit: pricing (coupons), inventory, refunds
- Integration: auth and basic flow

Run:
  cd backend && npm test

## Production
- Backend: npm run start (PORT, MONGO_URI, JWT_*, RAZORPAY_*, SMTP_* must be set)
- Frontend: npm run build → serve behind CDN/proxy; set CORS on backend to allow FRONTEND_URL

## Acceptance Criteria Mapping
- Responsive UI: Bootstrap grid in all pages
- Create/publish events, ticket windows & inventory: Organizer dashboard + APIs
- Search/filters/pagination + sort: Home page + /api/events
- Razorpay test payment: end-to-end flow with order create + signature verify + booking store
- Ticket PDF + QR: auto-generated and emailed + WhatsApp link; re-download in My Tickets
- Reminders: node-cron, logs in dev
- Check-in: QR scanner (webcam) + duplicate prevention + live stats
- Coupons: percent, fixed, early bird, group/BOGO in pricing engine
- Organizer analytics: revenue/tickets/check-in, CSV/XLSX exports
- Refund policy: thresholds + Razorpay refunds + stock rollback
- RBAC: enforced via middleware + UI
- Clean modular code: MVC + services/repos, Joi/Yup validation, helmet/cors/rate limit/sanitization

## Accessibility & Performance
- Keyboard navigation, ARIA labels on forms/controls, focus states
- Image optimization via sizes, lazy loading; pagination on heavy lists
- Lighthouse tips: preconnect API, minify build, cache static assets

If you get stuck or want changes to stack/providers, tell me and I’ll adjust quickly.
