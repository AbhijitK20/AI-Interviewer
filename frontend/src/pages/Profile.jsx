import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { GlassCard, GlassInput, GlassBadge, BackgroundVideo } from '../components/ui/glass'
import {
  User, Shield, Bell, Eye, Palette, Info, ChevronRight, ArrowLeft,
  Camera, Mail, Phone, Briefcase, Lock, Key, Smartphone, AlertTriangle,
  Trash2, LogOut, Moon, Sun, Monitor, CheckCircle2
} from 'lucide-react'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
  })

  const [notifications, setNotifications] = useState({
    emailResults: true,
    newQuestions: true,
    weeklyReport: false,
    marketing: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showScore: true,
    shareHistory: false,
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    lastPasswordChange: '2026-08-15',
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About', icon: Info },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/profile', profile)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundVideo />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,.5)' }}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-white font-bold text-2xl">{user?.fullName?.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>{user?.fullName}</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <GlassCard className="p-2">
              <nav className="space-y-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: activeTab === id ? '#fff' : 'rgba(255,255,255,.5)',
                      background: activeTab === id ? 'rgba(99,102,241,.15)' : 'transparent',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </GlassCard>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl flex items-center gap-2"
                style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)' }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: '#4ade80' }} />
                <p className="text-sm" style={{ color: '#4ade80' }}>{success}</p>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-6" style={{ color: '#fff' }}>Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Full Name</label>
                      <GlassInput value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Email</label>
                      <GlassInput value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Phone</label>
                      <GlassInput value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 890" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Job Title</label>
                      <GlassInput value={profile.jobTitle} onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })} placeholder="Software Engineer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Company</label>
                    <GlassInput value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} placeholder="Company name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Bio</label>
                    <GlassInput as="textarea" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." style={{ resize: 'none' }} />
                  </div>
                  <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-6" style={{ color: '#fff' }}>Security</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5" style={{ color: 'rgba(255,255,255,.5)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#fff' }}>Password</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>Last changed {security.lastPasswordChange}</p>
                      </div>
                    </div>
                    <button className="btn-secondary text-xs px-3 py-1.5">Change</button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5" style={{ color: 'rgba(255,255,255,.5)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#fff' }}>Two-Factor Authentication</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>{security.twoFactor ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                    <button onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ background: security.twoFactor ? '#6366f1' : 'rgba(255,255,255,.1)' }}>
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                        style={{ transform: security.twoFactor ? 'translateX(20px)' : 'translateX(0)' }} />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'oklch(55% 0.18 25 / 0.08)', border: '1px solid oklch(55% 0.18 25 / 0.15)' }}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5" style={{ color: '#f87171' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#f87171' }}>Danger Zone</p>
                        <p className="text-xs" style={{ color: 'rgba(248,113,113,.6)' }}>Delete your account and all data permanently.</p>
                      </div>
                    </div>
                    <button className="mt-3 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(248,113,113,.1)', color: '#f87171', border: '1px solid rgba(248,113,113,.2)' }}>
                      Delete Account
                    </button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-6" style={{ color: '#fff' }}>Notifications</h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailResults', label: 'Email interview results', desc: 'Receive score reports via email' },
                    { key: 'newQuestions', label: 'New question alerts', desc: 'Get notified when new questions are added' },
                    { key: 'weeklyReport', label: 'Weekly progress report', desc: 'Summary of your weekly activity' },
                    { key: 'marketing', label: 'Product updates', desc: 'New features and tips' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#fff' }}>{label}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>{desc}</p>
                      </div>
                      <button onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{ background: notifications[key] ? '#6366f1' : 'rgba(255,255,255,.1)' }}>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                          style={{ transform: notifications[key] ? 'translateX(20px)' : 'translateX(0)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-6" style={{ color: '#fff' }}>Privacy</h2>
                <div className="space-y-4">
                  {[
                    { key: 'profileVisible', label: 'Profile visibility', desc: 'Allow others to see your profile' },
                    { key: 'showScore', label: 'Show scores publicly', desc: 'Display your interview scores on your profile' },
                    { key: 'shareHistory', label: 'Share interview history', desc: 'Allow others to see your past interviews' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#fff' }}>{label}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>{desc}</p>
                      </div>
                      <button onClick={() => setPrivacy({ ...privacy, [key]: !privacy[key] })}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{ background: privacy[key] ? '#6366f1' : 'rgba(255,255,255,.1)' }}>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                          style={{ transform: privacy[key] ? 'translateX(20px)' : 'translateX(0)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-6" style={{ color: '#fff' }}>Appearance</h2>
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map(({ id, label, icon: Icon }) => (
                      <button key={id} className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                        style={{ background: id === 'dark' ? 'rgba(99,102,241,.15)' : 'oklch(100% 0 0 / 0.03)', border: `1px solid ${id === 'dark' ? 'rgba(99,102,241,.3)' : 'oklch(100% 0 0 / 0.06)'}` }}>
                        <Icon className="h-5 w-5" style={{ color: id === 'dark' ? '#818cf8' : 'rgba(255,255,255,.5)' }} />
                        <span className="text-xs font-medium" style={{ color: '#fff' }}>{label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>Accent Color</p>
                    <div className="flex gap-3 mt-2">
                      {['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'].map(color => (
                        <button key={color} className="w-8 h-8 rounded-full border-2 transition-all"
                          style={{ background: color, borderColor: color === '#6366f1' ? '#fff' : 'transparent' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-6" style={{ color: '#fff' }}>About AI Interviewer</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                    <p className="text-sm font-medium" style={{ color: '#fff' }}>Version</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>2.0.0</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                    <p className="text-sm font-medium" style={{ color: '#fff' }}>Built with</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>React + Spring Boot + Python AI Service</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                    <p className="text-sm font-medium" style={{ color: '#fff' }}>AI Models</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>Gemini 3.5 Flash Lite, Edge-TTS, Deepgram</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                    <p className="text-sm font-medium" style={{ color: '#fff' }}>Question Bank</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>3,400+ questions across 20 job roles</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'oklch(100% 0 0 / 0.03)', border: '1px solid oklch(100% 0 0 / 0.06)' }}>
                    <p className="text-sm font-medium" style={{ color: '#fff' }}>GitHub</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>github.com/AbhijitK20/AI-Interviewer</p>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
