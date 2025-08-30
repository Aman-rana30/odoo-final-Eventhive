import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiCalendar, 
  FiTag, 
  FiSettings,
  FiLogOut,
  FiPlus
} from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsProfileDropdownOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenus}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gradient">EventMitra</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/events" 
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Explore Events
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'organizer' && (
                  <Link 
                    to="/organizer/create-event"
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Event</span>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>{user?.firstName}</span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeMenus}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/tickets"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeMenus}
                      >
                        <FiTag className="w-4 h-4" />
                        <span>My Tickets</span>
                      </Link>

                      {user?.role === 'organizer' && (
                        <Link
                          to="/organizer/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenus}
                        >
                          <FiCalendar className="w-4 h-4" />
                          <span>My Events</span>
                        </Link>
                      )}

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeMenus}
                        >
                          <FiSettings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeMenus}
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 hover:text-indigo-600"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/events" 
                className="text-gray-600 hover:text-indigo-600"
                onClick={closeMenus}
              >
                Explore Events
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-600 hover:text-indigo-600"
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/tickets" 
                    className="text-gray-600 hover:text-indigo-600"
                    onClick={closeMenus}
                  >
                    My Tickets
                  </Link>
                  {user?.role === 'organizer' && (
                    <>
                      <Link 
                        to="/organizer/dashboard" 
                        className="text-gray-600 hover:text-indigo-600"
                        onClick={closeMenus}
                      >
                        My Events
                      </Link>
                      <Link 
                        to="/organizer/create-event" 
                        className="text-gray-600 hover:text-indigo-600"
                        onClick={closeMenus}
                      >
                        Create Event
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-indigo-600"
                    onClick={closeMenus}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary inline-block text-center"
                    onClick={closeMenus}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;