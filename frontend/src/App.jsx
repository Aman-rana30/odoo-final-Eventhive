import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import ProtectedRoute from "./routes/ProtectedRoute.jsx"
import Navbar from "./components/Navbar.jsx"

export default function App() {
  return (
    <div className="container py-3">
      {/* // replace inline nav with Navbar that is auth-aware */}
      <Navbar />
      <Routes>
        {/* public auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected routes - require auth first */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
