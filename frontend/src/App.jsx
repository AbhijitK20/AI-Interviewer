import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="interview/new" element={<NewInterview />} />
            <Route path="interview/:id" element={<Interview />} />
            <Route path="report/:id" element={<Report />} />
            <Route path="job-descriptions" element={<JobDescriptions />} />
            <Route path="resumes" element={<Resumes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
