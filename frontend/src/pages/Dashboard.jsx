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
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-emerald-400" />
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-amber-400" />
      case 'CANCELLED': return <XCircle className="h-5 w-5 text-red-400" />
      default: return <Clock className="h-5 w-5 text-white/30" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border border-red-500/20'
      default: return 'bg-white/5 text-white/40 border border-white/10'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-white"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold text-white">
            Dashboard
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-white/50 mt-1">
            Track your interview progress
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Link to="/interview/new" className="btn-primary inline-flex items-center gap-2">
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
          <motion.div key={stat.label} variants={item} className="card glass-hover">
            <stat.icon className="h-5 w-5 text-white/40 mb-3" />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Interview List */}
      {interviews.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 card">
          <Clock className="mx-auto h-10 w-10 text-white/20 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No interviews yet</h3>
          <p className="text-white/40 mb-6">Create your first interview to get started</p>
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
                className="block card glass-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                      {interview.title}
                    </h3>
                    <p className="text-sm text-white/40 mt-0.5 truncate">
                      {interview.companyName} — {interview.jobDescriptionTitle}
                    </p>
                  </div>
                  {getStatusIcon(interview.status)}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className={`badge ${getStatusColor(interview.status)}`}>
                    {interview.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-white/30 font-medium">
                    {interview.currentQuestionIndex}/{interview.totalQuestions}
                  </span>
                </div>

                {interview.totalQuestions > 0 && (
                  <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        interview.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${(interview.currentQuestionIndex / interview.totalQuestions) * 100}%` }}
                    />
                  </div>
                )}

                <p className="mt-3 text-xs text-white/30">
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
