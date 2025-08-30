import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Protected pages
import Dashboard from './pages/Dashboard.jsx';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import EventAnalytics from './pages/organizer/EventAnalytics';
import ManageTickets from './pages/organizer/ManageTickets';
import EventBookings from './pages/organizer/EventBookings';

// Volunteer pages
import CheckinScanner from './pages/volunteer/CheckinScanner';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/bookings/:id" element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          } />
          <Route path="/checkout/:eventId" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/checkout/success/:bookingId" element={
            <ProtectedRoute>
              <CheckoutSuccess />
            </ProtectedRoute>
          } />

          {/* Organizer routes */}
          <Route path="/organizer" element={
            <ProtectedRoute roles={['EventManager', 'Admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/create" element={
            <ProtectedRoute roles={['EventManager', 'Admin']}>
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/:id/edit" element={
            <ProtectedRoute roles={['EventManager', 'Admin']}>
              <EditEvent />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/:id/analytics" element={
            <ProtectedRoute roles={['EventManager', 'Admin']}>
              <EventAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/:id/tickets" element={
            <ProtectedRoute roles={['EventManager', 'Admin']}>
              <ManageTickets />
            </ProtectedRoute>
          } />
          <Route path="/organizer/events/:id/bookings" element={
            <ProtectedRoute roles={['EventManager', 'Admin']}>
              <EventBookings />
            </ProtectedRoute>
          } />

          {/* Volunteer routes */}
          <Route path="/checkin" element={
            <ProtectedRoute roles={['Volunteer', 'EventManager', 'Admin']}>
              <CheckinScanner />
            </ProtectedRoute>
          } />
          <Route path="/checkin/:eventId" element={
            <ProtectedRoute roles={['Volunteer', 'EventManager', 'Admin']}>
              <CheckinScanner />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['Admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;