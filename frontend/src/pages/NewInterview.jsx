import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, Briefcase, ChevronRight, Plus, ChevronDown, Search, X } from 'lucide-react'
import { JOB_ROLES, JOB_CATEGORIES, searchRoles } from '../data/jobRoles'
import { motion } from 'framer-motion'
import { GlassCard, WhiteButton, GlassInput, GlassBadge, BackgroundVideo } from '../components/ui/glass'

const NewInterview = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [jobDescriptions, setJobDescriptions] = useState([])
  const [resumes, setResumes] = useState([])
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    jobDescriptionId: location.state?.jobDescriptionId || '',
    resumeId: '',
    mode: 'TEXT',
    totalQuestions: 10,
    durationMinutes: 30,
    notes: ''
  })

  // Job role dropdown state
  const [roleSearch, setRoleSearch] = useState('')
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const dropdownRef = useRef(null)

  const [resumeText, setResumeText] = useState('')
  const [uploadingResume, setUploadingResume] = useState(false)

  useEffect(() => {
    fetchJobDescriptions()
    fetchResumes()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchJobDescriptions = async () => {
    try {
      const response = await api.get('/job-descriptions')
      setJobDescriptions(response.data)
    } catch (error) {
      console.error('Failed to fetch JDs:', error)
    }
  }

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes')
      setResumes(response.data)
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    }
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setRoleSearch(role.title)
    setShowRoleDropdown(false)
    setForm({
      ...form,
      title: `Interview for ${role.title}`,
    })
  }

  const handleCreateJDFromRole = async () => {
    if (!selectedRole) return null
    try {
      const response = await api.post('/job-descriptions', {
        title: selectedRole.title,
        company: 'Self',
        description: selectedRole.description,
        experienceLevel: 'MID',
        location: '',
        employmentType: 'Full-time',
      })
      setJobDescriptions(prev => [...prev, response.data])
      setForm(prev => ({ ...prev, jobDescriptionId: response.data.id }))
      return response.data.id
    } catch (err) {
      console.error('Failed to create JD:', err)
      return null
    }
  }

  const handleResumeTextSubmit = async () => {
    if (!resumeText.trim()) return
    setUploadingResume(true)
    try {
      const response = await api.post('/resumes/parse-text', { text: resumeText })
      setForm({ ...form, resumeId: response.data.id })
      setStep(3)
    } catch (error) {
      console.error('Failed to parse resume:', error)
    } finally {
      setUploadingResume(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title) return
    setLoading(true)
    setError('')
    try {
      let jdId = form.jobDescriptionId

      // If a role was selected but no JD chosen, create one automatically
      if (!jdId && selectedRole) {
        jdId = await handleCreateJDFromRole()
        if (!jdId) {
          setError('Failed to create job description. Please try again.')
          setLoading(false)
          return
        }
      }

      if (!jdId) {
        setError('Please select or create a job description.')
        setLoading(false)
        return
      }

      const response = await api.post('/interviews/start', {
        ...form,
        jobDescriptionId: jdId,
      })
      navigate(`/interview/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = roleSearch ? searchRoles(roleSearch) : JOB_ROLES
  const groupedRoles = activeCategory
    ? filteredRoles.filter(r => r.category === activeCategory)
    : filteredRoles

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-ink-500 hover:text-ink-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-ink-900 mb-2">Create New Interview</h1>
      <p className="text-sm text-ink-500 mb-6">Set up your AI-powered mock interview</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)' }}>
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
              style={{ background: step >= s ? '#6366f1' : 'rgba(255,255,255,.06)', color: step >= s ? '#fff' : 'rgba(255,255,255,.4)' }}>
              {s}
            </div>
            <span className="ml-2 text-sm font-medium" style={{ color: step >= s ? '#818cf8' : 'rgba(255,255,255,.3)' }}>
              {s === 1 ? 'Job Role' : s === 2 ? 'Resume' : 'Details'}
            </span>
            {s < 3 && <ChevronRight className="h-4 w-4 mx-3" style={{ color: 'rgba(255,255,255,.15)' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Job Role Selection */}
      {step === 1 && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#fff' }}>
            <Briefcase className="h-5 w-5 mr-2" style={{ color: '#818cf8' }} />
            Select Job Role
          </h2>

          {/* Search / Dropdown */}
          <div className="relative mb-6" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,.3)' }} />
              <GlassInput
                type="text"
                value={roleSearch}
                onChange={(e) => { setRoleSearch(e.target.value); setShowRoleDropdown(true); setActiveCategory(null); if (!e.target.value) setSelectedRole(null) }}
                onFocus={() => setShowRoleDropdown(true)}
                placeholder="Search job roles... (e.g., Frontend, Java, Data Scientist)"
                className="pl-10 pr-10"
              />
              {roleSearch && (
                <button onClick={() => { setRoleSearch(''); setSelectedRole(null); setShowRoleDropdown(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,.3)' }}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showRoleDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-ink-200 max-h-80 overflow-hidden">
                {/* Category tabs */}
                <div className="flex gap-1 p-2 border-b border-ink-100 overflow-x-auto">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      !activeCategory ? 'bg-primary-100 text-primary-700' : 'text-ink-500 hover:bg-ink-50'
                    }`}
                  >
                    All
                  </button>
                  {JOB_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        activeCategory === cat ? 'bg-primary-100 text-primary-700' : 'text-ink-500 hover:bg-ink-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Role list */}
                <div className="max-h-60 overflow-y-auto">
                  {groupedRoles.length === 0 ? (
                    <div className="p-4 text-center text-ink-400 text-sm">No roles found</div>
                  ) : (
                    groupedRoles.map(role => (
                      <button
                        key={role.title}
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-ink-50 last:border-0 ${
                          selectedRole?.title === role.title ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="font-medium text-ink-900 text-sm">{role.title}</div>
                        <div className="text-xs text-ink-500 mt-0.5">
                          {role.skills.slice(0, 4).join(' · ')}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected role preview */}
          {selectedRole && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-primary-900">{selectedRole.title}</h3>
                <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">{selectedRole.category}</span>
              </div>
              <p className="text-sm text-primary-800 mb-2">{selectedRole.description}</p>
              <div className="flex flex-wrap gap-1">
                {selectedRole.skills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-white text-primary-700 rounded text-xs border border-primary-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Existing JDs */}
          {jobDescriptions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-ink-700 mb-2">Or select existing Job Description:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {jobDescriptions.map((jd) => (
                  <label
                    key={jd.id}
                    className={`block p-3 border rounded-xl cursor-pointer transition-colors ${
                      form.jobDescriptionId === jd.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-ink-200 hover:border-ink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jobDescription"
                      value={jd.id}
                      checked={form.jobDescriptionId === jd.id}
                      onChange={(e) => setForm({ ...form, jobDescriptionId: e.target.value })}
                      className="sr-only"
                    />
                    <div className="font-medium text-sm text-ink-900">{jd.title}</div>
                    <div className="text-xs text-ink-500">{jd.company}</div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <Link
              to="/job-descriptions"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Create custom Job Description
            </Link>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedRole && !form.jobDescriptionId}
              className="px-4 py-2 bg-gradient-brand text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Resume */}
      {step === 2 && (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Resume (Optional)</h2>

          {resumes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-ink-700 mb-2">Your Resumes</h3>
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <label
                    key={resume.id}
                    className={`block p-3 border rounded-xl cursor-pointer ${
                      form.resumeId === resume.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-ink-200 hover:border-ink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resume"
                      value={resume.id}
                      checked={form.resumeId === resume.id}
                      onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-sm text-ink-900">{resume.fileName}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        resume.status === 'PARSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {resume.status}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-ink-100 pt-4">
            <h3 className="text-sm font-medium text-ink-700 mb-2">Or paste resume text</h3>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-32 p-3 border border-ink-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={handleResumeTextSubmit}
              disabled={!resumeText.trim() || uploadingResume}
              className="mt-2 px-3 py-1.5 text-sm bg-ink-100 text-ink-700 rounded-lg hover:bg-ink-200 disabled:opacity-50"
            >
              {uploadingResume ? 'Parsing...' : 'Parse & Use'}
            </button>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-ink-600 hover:text-ink-900 text-sm">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-gradient-brand text-white rounded-lg hover:opacity-90 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Interview Details */}
      {step === 3 && (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Interview Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Interview Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Senior Developer Interview"
                className="w-full p-2.5 border border-ink-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Mode</label>
                <select
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  className="w-full p-2.5 border border-ink-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="TEXT">Text</option>
                  <option value="VOICE">Voice</option>
                  <option value="VIDEO">Video</option>
                  <option value="CODING">Coding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                  min="10"
                  max="120"
                  className="w-full p-2.5 border border-ink-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Number of Questions</label>
              <input
                type="range"
                min="5"
                max="20"
                value={form.totalQuestions}
                onChange={(e) => setForm({ ...form, totalQuestions: parseInt(e.target.value) })}
                className="w-full accent-primary-600"
              />
              <div className="text-center text-sm font-medium text-ink-700">{form.totalQuestions} questions</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any specific areas to focus on..."
                className="w-full h-20 p-2.5 border border-ink-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-ink-600 hover:text-ink-900 text-sm">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title || loading}
              className="px-6 py-2.5 bg-gradient-brand text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center text-sm font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Start Interview'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewInterview
