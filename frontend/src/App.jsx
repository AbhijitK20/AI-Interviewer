import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewInterview from './pages/NewInterview'
import Interview from './pages/Interview'
import Report from './pages/Report'
import JobDescriptions from './pages/JobDescriptions'
import Resumes from './pages/Resumes'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route
        path="/"
        element={
          user ? (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          ) : (
            <Landing />
          )
        }
      >
        {user && (
          <>
            <Route index element={<Dashboard />} />
            <Route path="interview/new" element={<NewInterview />} />
            <Route path="interview/:id" element={<Interview />} />
            <Route path="report/:id" element={<Report />} />
            <Route path="job-descriptions" element={<JobDescriptions />} />
            <Route path="resumes" element={<Resumes />} />
          </>
        )}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global background video - always visible behind all content */}
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden' }}>
          <video
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              filter: 'blur(20px) brightness(0.4)',
              transform: 'scale(1.1)',
              pointerEvents: 'none', userSelect: 'none',
            }}
            autoPlay muted loop playsInline disablePictureInPicture aria-hidden="true"
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" type="video/mp4" />
          </video>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,.3), rgba(0,0,0,.5) 50%, rgba(0,0,0,.7))',
            pointerEvents: 'none',
          }} />
        </div>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
