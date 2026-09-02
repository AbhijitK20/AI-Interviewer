import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Plus, Briefcase, Trash2, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard, WhiteButton, GlassInput, GlassBadge, BackgroundVideo } from '../components/ui/glass'

const JobDescriptions = () => {
  const navigate = useNavigate()
  const [jobDescriptions, setJobDescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', company: '', description: '', experienceLevel: 'MID', location: '', employmentType: 'Full-time' })

  useEffect(() => { fetchJobDescriptions() }, [])

  const fetchJobDescriptions = async () => {
    try { const r = await api.get('/job-descriptions'); setJobDescriptions(r.data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await api.post('/job-descriptions', form); setForm({ title: '', company: '', description: '', experienceLevel: 'MID', location: '', employmentType: 'Full-time' }); setShowForm(false); fetchJobDescriptions() }
    catch (err) { setError(err.response?.data?.message || 'Failed to create') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this job description?')) return
    try { await api.delete(`/job-descriptions/${id}`); fetchJobDescriptions() } catch (e) { console.error(e) }
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#000', isolation: 'isolate' }}>
      <BackgroundVideo />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,.5)' }}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#fff', fontFamily: '"Reference Display", serif', fontWeight: 500 }}>Job Descriptions</h1>
            <p className="mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>Manage your job descriptions for interviews</p>
          </div>
          <WhiteButton onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> New Job Description
          </WhiteButton>
        </div>

        {showForm && (
          <GlassCard className="mb-6 p-6">
            <h2 className="text-lg font-medium mb-4" style={{ color: '#fff' }}>Create Job Description</h2>
            {error && <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)' }}><p className="text-sm" style={{ color: '#f87171' }}>{error}</p></div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Job Title *</label><GlassInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Senior Java Developer" /></div>
                <div><label className="block text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Company *</label><GlassInput required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g., Google" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Job Description *</label><GlassInput as="textarea" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Paste the full job description here..." rows={6} style={{ resize: 'none' }} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Experience</label>
                  <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(24,22,20,.8)', border: '1px solid rgba(255,255,255,.13)', color: '#fff', backdropFilter: 'blur(14px)' }}>
                    <option value="JUNIOR">Junior</option><option value="MID">Mid</option><option value="SENIOR">Senior</option><option value="LEAD">Lead</option><option value="ARCHITECT">Architect</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Location</label><GlassInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / City" /></div>
                <div><label className="block text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Type</label>
                  <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(24,22,20,.8)', border: '1px solid rgba(255,255,255,.13)', color: '#fff', backdropFilter: 'blur(14px)' }}>
                    <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium rounded-xl" style={{ color: 'rgba(255,255,255,.5)' }}>Cancel</button>
                <WhiteButton type="submit" disabled={saving} className="px-5 py-2.5 text-sm">{saving ? 'Creating...' : 'Create'}</WhiteButton>
              </div>
            </form>
          </GlassCard>
        )}

        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#fff' }} /></div>
        ) : jobDescriptions.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Briefcase className="mx-auto h-10 w-10 mb-4" style={{ color: 'rgba(255,255,255,.15)' }} />
            <h3 className="text-sm font-medium" style={{ color: '#fff' }}>No job descriptions yet</h3>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>Create one to start interviews.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {jobDescriptions.map((jd, i) => (
              <motion.div key={jd.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <GlassCard className="flex items-center justify-between p-5">
                  <div className="flex-1">
                    <div className="flex items-center"><Briefcase className="h-5 w-5 mr-2" style={{ color: '#818cf8' }} /><h3 className="font-medium" style={{ color: '#fff' }}>{jd.title}</h3></div>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>{jd.company} · {jd.experienceLevel} · {jd.location || 'Remote'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/interview/new', { state: { jobDescriptionId: jd.id } })} className="px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff' }}>
                      Start <ChevronRight className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(jd.id)} className="p-2 hover:opacity-80" style={{ color: 'rgba(255,255,255,.3)' }}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDescriptions
