import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Home, Briefcase, FileText, Menu, X } from 'lucide-react'
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
    <div className="min-h-screen relative" style={{ background: 'var(--surface-0)' }}>
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 20% 50%, oklch(20% 0.02 265 / 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, oklch(18% 0.015 30 / 0.08) 0%, transparent 50%)',
        zIndex: 0
      }} />

      {/* Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [.16,1,.3,1] }}
        className="sticky top-0 z-50 glass-light"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>
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
                  className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color: location.pathname === path ? 'var(--color-ink)' : 'oklch(100% 0 0 / 0.5)',
                    background: location.pathname === path ? 'oklch(100% 0 0 / 0.06)' : 'transparent',
                  }}
                >
                  <Icon className="h-4 w-4 inline mr-1.5" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'oklch(100% 0 0 / 0.04)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
                  <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium" style={{ color: 'oklch(100% 0 0 / 0.7)' }}>{user?.fullName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ color: 'oklch(100% 0 0 / 0.4)' }}
              >
                <LogOut className="h-4 w-4" />
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden p-2 rounded-xl"
                style={{ color: 'oklch(100% 0 0 / 0.5)' }}
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
              className="sm:hidden overflow-hidden"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: location.pathname === path ? 'var(--color-ink)' : 'oklch(100% 0 0 / 0.5)',
                      background: location.pathname === path ? 'oklch(100% 0 0 / 0.06)' : 'transparent',
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [.16,1,.3,1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Layout
