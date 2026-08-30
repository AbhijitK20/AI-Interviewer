import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Plus, FileText, Upload, Trash2, ArrowLeft } from 'lucide-react'

const Resumes = () => {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes')
      setResumes(response.data)
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('file', e.target.files[0])
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Resume uploaded successfully!')
      fetchResumes()
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const handlePasteSubmit = async () => {
    if (!resumeText.trim()) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.post('/resumes/parse-text', { text: resumeText })
      setSuccess('Resume parsed successfully!')
      setResumeText('')
      fetchResumes()
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse resume')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await api.delete(`/resumes/${id}`)
      fetchResumes()
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
        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resume
        </button>
      </div>

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Add Resume</h2>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setPasteMode(false)}
              className={`flex-1 p-4 border rounded-lg text-center transition-colors ${
                !pasteMode ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">Upload File</span>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT</p>
            </button>
            <button
              onClick={() => setPasteMode(true)}
              className={`flex-1 p-4 border rounded-lg text-center transition-colors ${
                pasteMode ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">Paste Text</span>
              <p className="text-xs text-gray-500 mt-1">Copy-paste resume content</p>
            </button>
          </div>

          {!pasteMode ? (
            <div>
              <label className="block">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Note: For PDF/DOC files, only text extraction is attempted. For best results, paste text directly.
              </p>
            </div>
          ) : (
            <div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={10}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handlePasteSubmit}
                disabled={!resumeText.trim() || uploading}
                className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {uploading ? 'Parsing...' : 'Parse Resume'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add your resume to personalize interviews.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{resume.fileName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Added {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  resume.status === 'PARSED'
                    ? 'bg-green-100 text-green-700'
                    : resume.status === 'FAILED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {resume.status}
                </span>
                <button
                  onClick={() => handleDelete(resume.id)}
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

export default Resumes
