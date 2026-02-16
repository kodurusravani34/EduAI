import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Navbar – top navigation bar used on public and authenticated pages.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Public nav links
  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/login', label: 'Login' },
    { to: '/signup', label: 'Sign Up' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo ONLY */}
          <Link to={user ? '/dashboard' : '/'}>
            <img
              src="/logo.png"
              alt="EduAI Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive('/login')
                      ? 'text-[#4A6FA5] bg-[#EEF3FB]'
                      : 'text-gray-600 hover:text-[#4A6FA5] hover:bg-[#EEF3FB]'
                  }`}
                >
                  Login
                </Link>

                {/* Sign Up (Primary CTA) */}
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-[#4A6FA5] text-white text-sm font-medium rounded-lg
                  hover:bg-[#3F5F92] hover:shadow-md hover:-translate-y-[1px]
                  transition-all duration-200"
                  >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Hi,{' '}
                  <span className="font-semibold text-gray-800">
                    {user.name}
                  </span>
                </span>

                <button
                  onClick={async () => {
                    try {
                      await logout();
                    } catch {}
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          {!user ? (
            publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-[#EEF3FB] text-[#4A6FA5]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))
          ) : (
            <>
              <span className="block px-3 py-2 text-sm text-gray-500">
                Hi,{' '}
                <span className="font-semibold text-gray-800">
                  {user.name}
                </span>
              </span>

              <button
                onClick={async () => {
                  try {
                    await logout();
                  } catch {}
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
