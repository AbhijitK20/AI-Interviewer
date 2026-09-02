import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Home, FileText, Briefcase, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/job-descriptions', label: 'Job Descriptions', icon: Briefcase },
    { path: '/resumes', label: 'Resumes', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-primary-50/30">
      {/* Glass Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-white/90 border-b border-ink-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-lg font-bold text-ink-900">
                  Interviewer
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden sm:flex sm:items-center sm:space-x-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === path
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-ink-500 hover:text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-1.5" />
                  {label}
                  {location.pathname === path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-50 rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-50/80 border border-ink-100">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0)}</span>
                </div>
                <span className="text-sm text-ink-600 font-medium">{user?.fullName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden p-2 rounded-xl text-ink-500 hover:bg-ink-50"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden border-t border-ink-100"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === path
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-ink-500 hover:bg-ink-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Page content with animation */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Layout
