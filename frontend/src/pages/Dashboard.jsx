import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Plus, Clock, CheckCircle, XCircle, TrendingUp, BarChart3, Users } from 'lucide-react'
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
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-amber-500" />
      case 'CANCELLED': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-ink-300" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'CANCELLED': return 'bg-red-50 text-red-700 border border-red-200'
      default: return 'bg-ink-50 text-ink-500 border border-ink-200'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-ink-900"
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-ink-500 mt-1"
          >
            Track your interview progress and results
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/interview/new"
            className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Interview
          </Link>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Interviews', value: stats.total, icon: BarChart3, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="bg-white rounded-2xl p-5 border border-ink-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className="h-5 w-5 text-ink-600" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-ink-900">{stat.value}</p>
            <p className="text-sm text-ink-500">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Interview List */}
      {interviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl border border-ink-100 shadow-sm"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-ink-50 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-ink-300" />
          </div>
          <h3 className="text-lg font-semibold text-ink-900">No interviews yet</h3>
          <p className="text-ink-500 mt-1">Get started by creating your first interview</p>
          <Link
            to="/interview/new"
            className="inline-flex items-center mt-6 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Interview
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {interviews.map((interview) => (
            <motion.div key={interview.id} variants={item}>
              <Link
                to={interview.status === 'COMPLETED' ? `/report/${interview.id}` : `/interview/${interview.id}`}
                className="block bg-white rounded-2xl border border-ink-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-ink-900 truncate group-hover:text-primary-600 transition-colors">
                      {interview.title}
                    </h3>
                    <p className="text-sm text-ink-500 mt-0.5 truncate">
                      {interview.companyName} — {interview.jobDescriptionTitle}
                    </p>
                  </div>
                  {getStatusIcon(interview.status)}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(interview.status)}`}>
                    {interview.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-ink-400 font-medium">
                    {interview.currentQuestionIndex}/{interview.totalQuestions}
                  </span>
                </div>

                {/* Progress bar */}
                {interview.totalQuestions > 0 && (
                  <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        interview.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${(interview.currentQuestionIndex / interview.totalQuestions) * 100}%` }}
                    />
                  </div>
                )}

                <p className="mt-3 text-xs text-ink-400">
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
