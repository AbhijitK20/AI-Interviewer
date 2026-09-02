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
    <div style={{ position: 'fixed', inset: 0, background: 'transparent', isolation: 'isolate' }}>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [.16,1,.3,1] }}
          className="sticky top-0 z-50"
          style={{ background: 'rgba(10,10,10,.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.05)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: '#fff' }}>Interviewer</span>
                </Link>
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-1">
                {navLinks.map(({ path, label, icon: Icon }) => (
                  <Link key={path} to={path}
                    className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: location.pathname === path ? '#fff' : 'rgba(255,255,255,.5)', background: location.pathname === path ? 'rgba(255,255,255,.06)' : 'transparent' }}>
                    <Icon className="h-4 w-4 inline mr-1.5" />{label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
                    <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,.7)' }}>{user?.fullName}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200" style={{ color: 'rgba(255,255,255,.4)' }}>
                  <LogOut className="h-4 w-4" />
                </button>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 rounded-xl" style={{ color: 'rgba(255,255,255,.5)' }}>
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="sm:hidden overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
                <div className="px-4 py-3 space-y-1">
                  {navLinks.map(({ path, label, icon: Icon }) => (
                    <Link key={path} to={path} onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ color: location.pathname === path ? '#fff' : 'rgba(255,255,255,.5)', background: location.pathname === path ? 'rgba(255,255,255,.06)' : 'transparent' }}>
                      <Icon className="h-4 w-4 mr-2" />{label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: [.16,1,.3,1] }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default Layout
