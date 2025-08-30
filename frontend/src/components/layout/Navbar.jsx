import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, User, LogOut, Settings, ShoppingCart, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NavLinkItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'border-blue-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`
    }
  >
    {children}
  </NavLink>
);

const MobileNavLinkItem = ({ to, children, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `block pl-3 pr-4 py-3 rounded-md text-base font-medium transition-colors ${
                isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`
        }
    >
        {children}
    </NavLink>
);


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const totalCartItems = getTotalItems();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);


  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Main Nav */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center space-x-2" onClick={closeAllMenus}>
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gradient">EventHive</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <NavLinkItem to="/">Home</NavLinkItem>
                <NavLinkItem to="/events">Events</NavLinkItem>
              </div>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                {(hasRole('EventManager') || hasRole('Admin')) && (
                   <Link
                    to="/organizer/events/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Create Event
                  </Link>
                )}
              </div>

              {isAuthenticated ? (
                <>
                  {/* Cart Icon */}
                  <button
                    onClick={() => navigate('/checkout')}
                    className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {totalCartItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-subtle">
                        {totalCartItems}
                      </span>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-transparent group-hover:ring-blue-500 transition-all">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          <Link to="/dashboard" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                              <BarChart3 className="h-4 w-4 mr-3 text-gray-500" /> Dashboard
                          </Link>
                          <Link to="/my-bookings" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                              <Ticket className="h-4 w-4 mr-3 text-gray-500" /> My Bookings
                          </Link>
                          {(hasRole('EventManager') || hasRole('Admin')) && (
                              <Link to="/organizer" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                                  <Settings className="h-4 w-4 mr-3 text-gray-500" /> Organizer Panel
                              </Link>
                          )}
                           {hasRole('Admin') && (
                              <Link to="/admin" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                                  <User className="h-4 w-4 mr-3 text-gray-500" /> Admin Panel
                              </Link>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <LogOut className="h-4 w-4 mr-3" /> Logout
                          </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Login</Link>
                  <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="sm:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        <div className={`fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} sm:hidden`}>
            <div className="absolute inset-0 bg-black/30" onClick={closeAllMenus}></div>
            <div className="relative w-full max-w-xs ml-auto h-full bg-white shadow-xl py-4 pb-12 flex flex-col overflow-y-auto">
                <div className="px-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                    <button type="button" className="-mr-2 p-2 inline-flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100" onClick={closeAllMenus}>
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="mt-6 px-2 space-y-2">
                    <MobileNavLinkItem to="/" onClick={closeAllMenus}>Home</MobileNavLinkItem>
                    <MobileNavLinkItem to="/events" onClick={closeAllMenus}>Events</MobileNavLinkItem>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 px-2 space-y-2">
                    {isAuthenticated ? (
                         <>
                            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Account</p>
                            <MobileNavLinkItem to="/dashboard" onClick={closeAllMenus}>Dashboard</MobileNavLinkItem>
                            <MobileNavLinkItem to="/my-bookings" onClick={closeAllMenus}>My Bookings</MobileNavLinkItem>
                            {(hasRole('EventManager') || hasRole('Admin')) && (
                                <MobileNavLinkItem to="/organizer" onClick={closeAllMenus}>Organizer Panel</MobileNavLinkItem>
                            )}
                             {hasRole('Admin') && (
                                <MobileNavLinkItem to="/admin" onClick={closeAllMenus}>Admin Panel</MobileNavLinkItem>
                            )}
                             <button onClick={handleLogout} className="block w-full text-left pl-3 pr-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-800">
                                Logout
                            </button>
                         </>
                    ) : (
                        <>
                           <MobileNavLinkItem to="/login" onClick={closeAllMenus}>Login</MobileNavLinkItem>
                           <MobileNavLinkItem to="/register" onClick={closeAllMenus}>Sign Up</MobileNavLinkItem>
                        </>
                    )}
                </div>

            </div>
        </div>


      </nav>
      {isProfileOpen && <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />}
    </>
  );
};

export default Navbar;