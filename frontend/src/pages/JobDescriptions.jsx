import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Plus, Briefcase, Trash2, ChevronRight, ArrowLeft } from 'lucide-react'

const JobDescriptions = () => {
  const navigate = useNavigate()
  const [jobDescriptions, setJobDescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    experienceLevel: 'MID',
    location: '',
    employmentType: 'Full-time',
  })

  useEffect(() => {
    fetchJobDescriptions()
  }, [])

  const fetchJobDescriptions = async () => {
    try {
      const response = await api.get('/job-descriptions')
      setJobDescriptions(response.data)
    } catch (error) {
      console.error('Failed to fetch JDs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/job-descriptions', form)
      setForm({
        title: '',
        company: '',
        description: '',
        experienceLevel: 'MID',
        location: '',
        employmentType: 'Full-time',
      })
      setShowForm(false)
      fetchJobDescriptions()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job description')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this job description?')) return
    try {
      await api.delete(`/job-descriptions/${id}`)
      fetchJobDescriptions()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Descriptions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Job Description
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Create Job Description</h2>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Senior Java Developer"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Paste the full job description here..."
                rows={6}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                  <option value="ARCHITECT">Architect</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Remote / City"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Job Description'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : jobDescriptions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No job descriptions yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create a job description to start interviews.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobDescriptions.map((jd) => (
            <div
              key={jd.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="font-medium text-gray-900">{jd.title}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {jd.company} · {jd.experienceLevel} · {jd.location || 'Remote'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/interview/new', { state: { jobDescriptionId: jd.id } })}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Start Interview
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
                <button
                  onClick={() => handleDelete(jd.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobDescriptions
