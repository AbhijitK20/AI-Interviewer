import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ShaderBackground from '../components/ui/effects/ShaderBackground'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--surface-0)' }}>
      <ShaderBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [.16,1,.3,1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass rounded-3xl p-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px oklch(65% 0.15 265 / 0.3)' }}>
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>Welcome back</h2>
            <p className="mt-1" style={{ color: 'oklch(100% 0 0 / 0.5)' }}>Sign in to continue your interview prep</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl"
              style={{ background: 'oklch(55% 0.18 25 / 0.1)', border: '1px solid oklch(55% 0.18 25 / 0.2)' }}
            >
              <p className="text-sm" style={{ color: 'oklch(75% 0.18 25)' }}>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'oklch(100% 0 0 / 0.6)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(100% 0 0 / 0.25)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'oklch(100% 0 0 / 0.6)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(100% 0 0 / 0.25)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--color-ink)' }}>
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
