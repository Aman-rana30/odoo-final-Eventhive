import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyTickets from './pages/MyTickets';
import CreateEvent from './pages/CreateEvent';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CheckIn from './pages/CheckIn';
import PrivateRoute from './components/PrivateRoute';
import './styles/globals.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />

              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

              <Route path="/tickets" element={
                <PrivateRoute>
                  <MyTickets />
                </PrivateRoute>
              } />

              {/* Organizer Routes */}
              <Route path="/organizer/dashboard" element={
                <PrivateRoute roles={['organizer', 'admin']}>
                  <OrganizerDashboard />
                </PrivateRoute>
              } />

              <Route path="/organizer/create-event" element={
                <PrivateRoute roles={['organizer', 'admin']}>
                  <CreateEvent />
                </PrivateRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />

              {/* Utility Routes */}
              <Route path="/checkin" element={
                <PrivateRoute>
                  <CheckIn />
                </PrivateRoute>
              } />
            </Routes>
          </Layout>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4F46E5',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
