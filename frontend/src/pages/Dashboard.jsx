import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react'

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My Interviews</h1>
          <p className="text-sm text-ink-500 mt-1">Track your interview progress and results</p>
        </div>
        <Link
          to="/interview/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-brand hover:opacity-90 transition-opacity shadow-card"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-ink-100">
          <Clock className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-sm font-semibold text-ink-900">No interviews yet</h3>
          <p className="mt-1 text-sm text-ink-500">Get started by creating a new interview.</p>
          <div className="mt-6">
            <Link
              to="/interview/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-brand hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Interview
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <Link
              key={interview.id}
              to={interview.status === 'COMPLETED' ? `/report/${interview.id}` : `/interview/${interview.id}`}
              className="block bg-white rounded-2xl shadow-card border border-ink-100 hover:shadow-card-hover hover:border-primary-200 transition-all p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 truncate">
                    {interview.title}
                  </h3>
                  <p className="text-sm text-ink-500 mt-1">
                    {interview.companyName} - {interview.jobDescriptionTitle}
                  </p>
                </div>
                {getStatusIcon(interview.status)}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                  {interview.status}
                </span>
                <span className="text-sm text-ink-500">
                  {interview.currentQuestionIndex}/{interview.totalQuestions} questions
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-400">
                Created {new Date(interview.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
