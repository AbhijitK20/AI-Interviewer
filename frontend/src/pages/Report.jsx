import { GlassCard, BackgroundVideo } from "../components/ui/glass"
import { useState, useEffect, lazy, Suspense, Component } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  ArrowLeft,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  FileDown,
  Sparkles,
} from 'lucide-react'
const PDFReportGenerator = lazy(() =>
  import('../components/report/PDFReportGenerator').catch(() => ({
    default: () => (
      <button
        onClick={() => window.print()}
        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-sm shadow-primary-500/20 transition-all"
      >
        <FileDown className="w-4 h-4 mr-2" />
        <span>Download PDF Report</span>
      </button>
    ),
  }))
)
import { useAuth } from '../context/AuthContext'

class PDFErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err) {
    console.error('PDFReportGenerator failed:', err)
  }
  render() {
    if (this.state.hasError) {
      return (
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-sm shadow-primary-500/20 transition-all"
        >
          <FileDown className="w-4 h-4 mr-2" />
          <span>Download PDF Report</span>
        </button>
      )
    }
    return this.props.children
  }
}

// Clean any string from lingering JSON quotes/brackets/backslashes
const cleanString = (str) => {
  if (typeof str !== 'string') return String(str || '')
  let s = str.trim()
  let prev = ''
  while (s !== prev) {
    prev = s
    s = s.replace(/^[[\]"'\\]+/, '').replace(/[[\]"'\\]+$/, '').trim()
  }
  s = s.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  return s
}

// Deep unwrap and parse arrays, handling any level of stringified JSON, escaped quotes, or bracket leftovers
const safeParseArray = (data) => {
  if (!data) return []

  let items = []
  if (Array.isArray(data)) {
    items = data
  } else if (typeof data === 'string') {
    let current = data.trim()
    for (let i = 0; i < 5; i++) {
      try {
        const parsed = JSON.parse(current)
        if (Array.isArray(parsed)) {
          items = parsed
          break
        }
        if (parsed && typeof parsed === 'object') {
          items = Object.values(parsed)
          break
        }
        if (typeof parsed === 'string') {
          current = parsed
          continue
        }
      } catch {
        break
      }
    }
    if (items.length === 0) {
      items = current.split(/\r?\n|","|",\s*"|,\s*/)
    }
  }

  const result = []
  const processItem = (item) => {
    if (!item) return
    if (Array.isArray(item)) {
      item.forEach(processItem)
      return
    }
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (trimmed === '[]' || trimmed === '""' || trimmed === "''" || !trimmed) return
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            parsed.forEach(processItem)
            return
          }
        } catch {
          // ignore parsing error
        }
      }
      const cleaned = cleanString(trimmed)
      if (cleaned && cleaned !== '[]' && cleaned !== '""') {
        result.push(cleaned)
      }
    } else {
      result.push(String(item))
    }
  }

  items.forEach(processItem)
  return Array.from(new Set(result))
}

const cleanRecommendations = (text) => {
  if (!text || typeof text !== 'string') return ''
  let cleaned = text
    .replace(/\[\s*\]/g, '')
    .replace(/\\"/g, '')
    .replace(/[[\]"]/g, '')
    .replace(/,\s*,+/g, ',')
    .replace(/,\s*$/, '')
    .replace(/:\s*,+/g, ': ')
    .trim()
  if (cleaned.endsWith(':')) {
    cleaned += ' continued growth and practice'
  }
  return cleaned
}

// Parse chart data (array of objects) with fallback defaults
const safeParseChartData = (data, defaultData = []) => {
  if (!data) return defaultData
  if (Array.isArray(data) && data.length > 0) return data

  if (typeof data === 'string') {
    let current = data
    for (let i = 0; i < 5; i++) {
      try {
        const parsed = JSON.parse(current)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const key0 = Object.keys(parsed)[0] || ''
          const labelKey = key0.toLowerCase().includes('skill') ? 'skill' : 'category'
          return Object.entries(parsed).map(([k, v]) => ({ [labelKey]: k, score: Number(v) || 0 }))
        }
        if (typeof parsed === 'string') {
          current = parsed
          continue
        }
        break
      } catch {
        break
      }
    }
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.entries(data).map(([k, v]) => ({ category: k, score: Number(v) || 0 }))
  }

  return defaultData
}

const Report = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReport()
  }, [id])

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const [reportRes, interviewRes] = await Promise.all([
        api.get(`/reports/${id}`),
        api.get(`/interviews/${id}`).catch(() => ({ data: null })),
      ])
      setReport(reportRes.data)
      setInterview(interviewRes.data)
    } catch (err) {
      console.error('Failed to fetch report:', err)
      setError('Unable to load the report. Please ensure the interview is completed.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-ink-500 font-medium">Loading interview report...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-card border border-ink-100">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink-900 mb-2">Report Not Available</h2>
          <p className="text-ink-500 mb-6">{error || 'Report could not be found for this interview.'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-gradient-brand text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const defaultRadar = [
    { skill: 'Technical Depth', score: report.overallScore || 75 },
    { skill: 'Problem Solving', score: Math.min(100, (report.overallScore || 75) + 5) },
    { skill: 'Communication', score: Math.max(0, (report.overallScore || 75) - 5) },
    { skill: 'System Design', score: report.overallScore || 70 },
    { skill: 'Code Quality', score: report.overallScore || 80 },
  ]

  const defaultCategories = [
    { category: 'Technical', score: report.overallScore || 75 },
    { category: 'Communication', score: Math.max(50, (report.overallScore || 75) - 10) },
    { category: 'Problem Solving', score: Math.min(95, (report.overallScore || 75) + 5) },
  ]

  const radarData = safeParseChartData(report.skillRadarData, defaultRadar)
  const categoryScores = safeParseChartData(report.categoryScores, defaultCategories)
  const strengths = safeParseArray(report.strengths)
  const weaknesses = safeParseArray(report.weaknesses)
  const questionBreakdown = (() => {
    const raw = report.questionBreakdown
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    try { return JSON.parse(raw) } catch { return [] }
  })()

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-primary-50 text-primary-700 border-primary-200'
    const g = grade.toUpperCase()
    if (g.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (g.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (g.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }

  return (
    <div className="relative min-h-screen pb-12">
      <BackgroundVideo />
      <div className="relative z-10 max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </Link>
        <PDFErrorBoundary>
          <Suspense fallback={<div className="h-10 w-48 animate-pulse rounded-xl" style={{ background: 'var(--border)' }} />}>
            <PDFReportGenerator report={report} interview={interview} candidate={user} />
          </Suspense>
        </PDFErrorBoundary>
      </div>

      {/* Main Overview Banner */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold badge-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assessment Summary</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-ink)' }}>
              {interview?.title || 'Technical Interview Assessment'}
            </h1>
            <p className="text-sm" style={{ color: 'oklch(100% 0 0 / 0.5)' }}>
              {interview?.jobDescriptionTitle || 'Candidate'} •{' '}
              {interview?.companyName ? `${interview.companyName} • ` : ''}
              Completed on{' '}
              {report.createdAt
                ? new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Recent'}
            </p>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto p-4 rounded-2xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid var(--border)' }}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1.5 text-primary-600">
                <Award className="h-7 w-7" />
                <span className="text-3xl md:text-4xl font-extrabold">{report.overallScore ?? 0}</span>
                <span className="text-xs text-ink-400 font-normal">/100</span>
              </div>
              <span className="text-xs font-medium text-ink-500 uppercase tracking-wider block mt-1">
                Overall Score
              </span>
            </div>
            <div className="h-10 w-[1px] bg-ink-200" />
            <div className="text-center">
              <span
                className={`inline-block px-3.5 py-1 rounded-xl text-lg font-bold border ${getGradeColor(
                  report.overallGrade
                )}`}
              >
                {report.overallGrade || 'N/A'}
              </span>
              <span className="text-xs font-medium text-ink-500 uppercase tracking-wider block mt-1">
                Grade
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Skill Competency Radar</h2>
            <span className="text-xs" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>Proficiency Breakdown</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(30% 0.008 40)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'oklch(72% 0.006 40)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="oklch(35% 0.006 40)" />
                <Radar name="Proficiency" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Scores */}
        <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Category Performance</h2>
            <span className="text-xs" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>Scores by Domain</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.008 40)" />
                <XAxis dataKey="category" tick={{ fill: 'oklch(72% 0.006 40)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'oklch(72% 0.006 40)', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--color-ink)' }} />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-xl" style={{ background: 'oklch(50% 0.14 155 / 0.15)' }}>
              <TrendingUp className="h-5 w-5" style={{ color: 'oklch(75% 0.14 155)' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Key Strengths</h2>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.map((item, index) => (
                <li key={index} className="flex items-start text-sm" style={{ color: 'oklch(100% 0 0 / 0.7)' }}>
                  <CheckCircle2 className="h-4 w-4 mr-2.5 mt-0.5 flex-shrink-0" style={{ color: 'oklch(75% 0.14 155)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic" style={{ color: 'oklch(100% 0 0 / 0.35)' }}>No specific strengths recorded.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-xl" style={{ background: 'oklch(55% 0.15 85 / 0.15)' }}>
              <AlertCircle className="h-5 w-5" style={{ color: 'oklch(80% 0.15 85)' }} />
            </div>
            <h2 className="text-lg font-bold text-ink-900">Areas for Improvement</h2>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {weaknesses.map((item, index) => (
                <li key={index} className="flex items-start text-sm text-ink-700">
                  <span className="h-2 w-2 rounded-full bg-amber-400 mr-3 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic" style={{ color: 'oklch(100% 0 0 / 0.35)' }}>No major weakness areas identified.</p>
          )}
        </div>
      </div>

      {/* Summary and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Summary */}
        <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-xl" style={{ background: 'oklch(65% 0.15 265 / 0.15)' }}>
              <BookOpen className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Executive Summary</h2>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'oklch(100% 0 0 / 0.7)' }}>
            {report.summary || 'The candidate has completed the evaluation process.'}
          </p>
        </div>

        {/* Recommendation Level & Guidance */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-xl badge-primary">
                <Award className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Recommendations</h2>
            </div>
            <p className="text-sm leading-relaxed mb-4 whitespace-pre-line" style={{ color: 'oklch(100% 0 0 / 0.7)' }}>
              {cleanRecommendations(report.recommendations) || 'Continue practicing hands-on problem solving.'}
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>
              Hiring Recommendation
            </span>
            <span className="badge badge-primary">
              {report.recommendationLevel || 'RECOMMENDED'}
            </span>
          </div>
        </div>
      </div>

      {/* Question Review Section */}
      {questionBreakdown.length > 0 && (
        <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 rounded-xl badge-primary">
              <BookOpen className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Question Review</h2>
          </div>

          <div className="space-y-6">
            {questionBreakdown.map((q, index) => (
              <div key={index} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {/* Question Header */}
                <div className="px-5 py-3" style={{ background: 'oklch(100% 0 0 / 0.03)', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Question {index + 1}</p>
                    {q.score != null && (
                      <span className={`badge ${
                        q.score >= 70 ? 'badge-success' :
                        q.score >= 40 ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {q.score}/100
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'oklch(100% 0 0 / 0.8)' }}>{q.question}</p>
                </div>

                {/* Answer & Feedback */}
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>Your Answer</p>
                    <p className="text-sm card" style={{ color: 'oklch(100% 0 0 / 0.7)' }}>{q.answer || 'No answer provided'}</p>
                  </div>

                  {q.feedback && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>Review</p>
                      <p className="text-sm" style={{ color: 'oklch(100% 0 0 / 0.7)' }}>{q.feedback}</p>
                    </div>
                  )}

                  {q.expectedAnswer && (
                    <details className="group">
                      <summary className="text-xs font-semibold cursor-pointer hover:opacity-80" style={{ color: 'oklch(75% 0.14 155)' }}>
                        View Expected Answer
                      </summary>
                      <p className="mt-2 text-sm card" style={{ color: 'oklch(100% 0 0 / 0.6)' }}>
                      </p>
                    </details>
                  )}

                  {q.sampleResponse && (
                    <details className="group">
                      <summary className="text-xs font-semibold cursor-pointer hover:opacity-80" style={{ color: 'var(--color-accent)' }}>
                        View Sample Response
                      </summary>
                      <p className="mt-2 text-sm card" style={{ color: 'oklch(100% 0 0 / 0.6)' }}>
                        {q.sampleResponse}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Report
