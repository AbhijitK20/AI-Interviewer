import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Plus, FileText, Upload, Trash2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard, WhiteButton, GlassInput, BackgroundVideo } from '../components/ui/glass'

const Resumes = () => {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchResumes() }, [])

  const fetchResumes = async () => {
    try { const r = await api.get('/resumes'); setResumes(r.data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault(); setUploading(true); setError(''); setSuccess('')
    try {
      const fd = new FormData(); fd.append('file', e.target.files[0])
      await api.post('/resumes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess('Resume uploaded!'); fetchResumes(); setShowForm(false)
    } catch (err) { setError(err.response?.data?.message || 'Upload failed') } finally { setUploading(false) }
  }

  const handlePasteSubmit = async () => {
    if (!resumeText.trim()) return; setUploading(true); setError(''); setSuccess('')
    try { await api.post('/resumes/parse-text', { text: resumeText }); setSuccess('Resume parsed!'); fetchResumes(); setShowForm(false); setResumeText('') }
    catch (err) { setError(err.response?.data?.message || 'Parse failed') } finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try { await api.delete(`/resumes/${id}`); fetchResumes() } catch (e) { console.error(e) }
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundVideo />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,.5)' }}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#fff', fontFamily: '"Reference Display", serif', fontWeight: 500 }}>Resumes</h1>
            <p className="mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>Upload or paste your resume</p>
          </div>
          <WhiteButton onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Resume
          </WhiteButton>
        </div>

        {success && <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)' }}><p className="text-sm" style={{ color: '#4ade80' }}>{success}</p></div>}

        {showForm && (
          <GlassCard className="mb-6 p-6">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setPasteMode(false)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: !pasteMode ? 'rgba(255,255,255,.08)' : 'transparent', color: !pasteMode ? '#fff' : 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.12)' }}>
                <Upload className="w-4 h-4 inline mr-2" /> Upload File
              </button>
              <button onClick={() => setPasteMode(true)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: pasteMode ? 'rgba(255,255,255,.08)' : 'transparent', color: pasteMode ? '#fff' : 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.12)' }}>
                <FileText className="w-4 h-4 inline mr-2" /> Paste Text
              </button>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)' }}><p className="text-sm" style={{ color: '#f87171' }}>{error}</p></div>}
            {!pasteMode ? (
              <form onSubmit={handleFileUpload}>
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="w-full text-sm" style={{ color: 'rgba(255,255,255,.5)' }} />
              </form>
            ) : (
              <div>
                <GlassInput as="textarea" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume content..." rows={8} style={{ resize: 'none' }} className="mb-3" />
                <WhiteButton onClick={handlePasteSubmit} disabled={uploading || !resumeText.trim()} className="px-5 py-2.5 text-sm">
                  {uploading ? 'Processing...' : 'Parse Resume'}
                </WhiteButton>
              </div>
            )}
          </GlassCard>
        )}

        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#fff' }} /></div>
        ) : resumes.length === 0 ? (
          <GlassCard className="text-center py-12">
            <FileText className="mx-auto h-10 w-10 mb-4" style={{ color: 'rgba(255,255,255,.15)' }} />
            <h3 className="text-sm font-medium" style={{ color: '#fff' }}>No resumes yet</h3>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>Upload a resume to get personalized questions.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume, i) => (
              <motion.div key={resume.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <GlassCard className="flex items-center justify-between p-5">
                  <div className="flex-1">
                    <div className="flex items-center"><FileText className="h-5 w-5 mr-2" style={{ color: '#818cf8' }} /><h3 className="font-medium" style={{ color: '#fff' }}>{resume.name || resume.fileName}</h3></div>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>{resume.skills ? `${resume.skills.split(',').length} skills detected` : 'Uploaded'}</p>
                  </div>
                  <button onClick={() => handleDelete(resume.id)} className="p-2 hover:opacity-80" style={{ color: 'rgba(255,255,255,.3)' }}><Trash2 className="h-4 w-4" /></button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Resumes
