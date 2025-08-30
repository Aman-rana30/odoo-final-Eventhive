import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import Home from "./pages/Home.jsx"
import EventDetails from "./pages/EventDetails.jsx"
import Checkout from "./pages/Checkout.jsx"
import MyTickets from "./pages/MyTickets.jsx"
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx"
import VolunteerScanner from "./pages/VolunteerScanner.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import { CartProvider } from "./context/CartContext.jsx"

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <Navbar />
          <main className="container my-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/e/:slug" element={<EventDetails />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan"
                element={
                  <ProtectedRoute>
                    <VolunteerScanner />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
