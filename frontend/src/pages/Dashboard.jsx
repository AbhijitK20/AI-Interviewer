import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Plus, Clock, CheckCircle, XCircle, TrendingUp, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interviews')
      setInterviews(response.data)
    } catch (error) {
      console.error('Failed to fetch interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: interviews.length,
    completed: interviews.filter(i => i.status === 'COMPLETED').length,
    inProgress: interviews.filter(i => i.status === 'IN_PROGRESS').length,
    avgScore: interviews.filter(i => i.status === 'COMPLETED').length > 0
      ? Math.round(interviews.filter(i => i.status === 'COMPLETED').reduce((acc, i) => acc + (i.overallScore || 75), 0) / interviews.filter(i => i.status === 'COMPLETED').length)
      : 0,
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5" style={{ color: 'oklch(75% 0.14 155)' }} />
      case 'IN_PROGRESS': return <Clock className="h-5 w-5" style={{ color: 'oklch(80% 0.15 85)' }} />
      case 'CANCELLED': return <XCircle className="h-5 w-5" style={{ color: 'oklch(75% 0.18 25)' }} />
      default: return <Clock className="h-5 w-5" style={{ color: 'oklch(100% 0 0 / 0.25)' }} />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'badge-success'
      case 'IN_PROGRESS': return 'badge-warning'
      case 'CANCELLED': return 'badge-danger'
      default: return 'badge-neutral'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [.16,1,.3,1] } },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--color-ink)' }}></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold" style={{ color: 'var(--color-ink)' }}>
            Dashboard
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="mt-1" style={{ color: 'oklch(100% 0 0 / 0.5)' }}>
            Track your interview progress
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Link to="/interview/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Interview
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: BarChart3 },
          { label: 'Completed', value: stats.completed, icon: CheckCircle },
          { label: 'In Progress', value: stats.inProgress, icon: Clock },
          { label: 'Avg Score', value: `${stats.avgScore}%`, icon: TrendingUp },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item} className="card">
            <stat.icon className="h-5 w-5 mb-3" style={{ color: 'oklch(100% 0 0 / 0.35)' }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{stat.value}</p>
            <p className="text-sm" style={{ color: 'oklch(100% 0 0 / 0.45)' }}>{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Interview List */}
      {interviews.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 card">
          <Clock className="mx-auto h-10 w-10 mb-4" style={{ color: 'oklch(100% 0 0 / 0.15)' }} />
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-ink)' }}>No interviews yet</h3>
          <p className="mb-6" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>Create your first interview to get started</p>
          <Link to="/interview/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Interview
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <motion.div key={interview.id} variants={item}>
              <Link
                to={interview.status === 'COMPLETED' ? `/report/${interview.id}` : `/interview/${interview.id}`}
                className="block card group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate transition-colors"
                      style={{ color: 'var(--color-ink)' }}>
                      {interview.title}
                    </h3>
                    <p className="text-sm mt-0.5 truncate" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>
                      {interview.companyName} — {interview.jobDescriptionTitle}
                    </p>
                  </div>
                  {getStatusIcon(interview.status)}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className={`badge ${getStatusBadge(interview.status)}`}>
                    {interview.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'oklch(100% 0 0 / 0.3)' }}>
                    {interview.currentQuestionIndex}/{interview.totalQuestions}
                  </span>
                </div>

                {interview.totalQuestions > 0 && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'oklch(100% 0 0 / 0.05)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(interview.currentQuestionIndex / interview.totalQuestions) * 100}%`,
                        background: interview.status === 'COMPLETED' ? 'oklch(55% 0.14 155)' : 'var(--color-accent)',
                      }}
                    />
                  </div>
                )}

                <p className="mt-3 text-xs" style={{ color: 'oklch(100% 0 0 / 0.25)' }}>
                  {new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default Dashboard
