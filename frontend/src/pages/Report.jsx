import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ArrowLeft, Download, Award, TrendingUp, AlertCircle } from 'lucide-react'

const Report = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [id])

  const fetchReport = async () => {
    try {
      const [reportRes, interviewRes] = await Promise.all([
        api.get(`/reports/${id}`),
        api.get(`/interviews/${id}`),
      ])
      setReport(reportRes.data)
      setInterview(interviewRes.data)
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Report not found.</p>
        <Link to="/" className="text-primary-600 hover:text-primary-500 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const radarData = report.skillRadarData ? JSON.parse(report.skillRadarData) : []
  const categoryScores = report.categoryScores ? JSON.parse(report.categoryScores) : []
  const strengths = report.strengths ? JSON.parse(report.strengths) : []
  const weaknesses = report.weaknesses ? JSON.parse(report.weaknesses) : []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Report</h1>
            <p className="text-gray-500 mt-1">{interview?.title}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <Award className="h-8 w-8 text-primary-600" />
              <span className="text-4xl font-bold text-primary-600">{report.overallScore}</span>
            </div>
            <span className="text-sm text-gray-500">Overall Score</span>
            <div className="mt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                Grade: {report.overallGrade}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Category Scores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            Strengths
          </h2>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            Areas for Improvement
          </h2>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-700">{report.summary}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h2>
        <p className="text-gray-700">{report.recommendations}</p>
        <div className="mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Recommendation Level: {report.recommendationLevel}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Report
