import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Home, FileText, BarChart3, Briefcase } from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinkClass = (path) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
      location.pathname === path
        ? 'border-primary-500 text-ink-900'
        : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700'
    }`

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="bg-white shadow-sm border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">AI Interviewer</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={navLinkClass('/')}>
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <Link to="/job-descriptions" className={navLinkClass('/job-descriptions')}>
                  <Briefcase className="h-4 w-4 mr-1" />
                  Job Descriptions
                </Link>
                <Link to="/resumes" className={navLinkClass('/resumes')}>
                  <FileText className="h-4 w-4 mr-1" />
                  Resumes
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-ink-600 mr-4">{user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-ink-500 hover:text-ink-700 hover:bg-ink-50 focus:outline-none"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
