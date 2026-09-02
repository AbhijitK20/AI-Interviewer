import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Send, SkipForward, MessageSquare, Mic, Code, ChevronRight, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import VoiceRecorder from '../components/interview/VoiceRecorder'
import VoicePlayer from '../components/interview/VoicePlayer'
import CodingEnvironment from '../components/interview/CodingEnvironment'
import BodyLanguageAnalyzer from '../components/interview/BodyLanguageAnalyzer'
import ProctoringMonitor from '../components/interview/ProctoringMonitor'
import SpeechEmotionAnalyzer from '../components/interview/SpeechEmotionAnalyzer'
import DigitalAvatar from '../components/interview/DigitalAvatar'
import AntiCheatModal from '../components/interview/AntiCheatModal'
import { motion } from 'framer-motion'
import { GlassCard, WhiteButton, GlassBadge, BackgroundVideo } from '../components/ui/glass'

const Interview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [inputMode, setInputMode] = useState('text') // text, voice, coding
  const [showAvatar, setShowAvatar] = useState(true)
  const [showBodyLanguage, setShowBodyLanguage] = useState(true)
  const [showProctoring, setShowProctoring] = useState(true)
  const [avatarEmotion, setAvatarEmotion] = useState('neutral')
  const [avatarSpeaking, setAvatarSpeaking] = useState(false)
  const [audioStream, setAudioStream] = useState(null)
  const [bodyAnalysis, setBodyAnalysis] = useState(null)
  const [showAntiCheat, setShowAntiCheat] = useState(false)
  const [antiCheatAccepted, setAntiCheatAccepted] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const audioStreamRef = useRef(null)

  useEffect(() => {
    fetchInterview()
    // Pre-warm ai-service (wakes up Render free tier in background)
    const aiUrl = import.meta.env.VITE_AI_SERVICE_URL || 'https://ai-interviewer-ai-service-qpxr.onrender.com'
    fetch(`${aiUrl}/ai/voices`).catch(() => {})
    // Anti-cheat modal disabled for testing
    setAntiCheatAccepted(true)
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [id])

  const fetchInterview = async () => {
    try {
      const response = await api.get(`/interviews/${id}`)
      setInterview(response.data)

      if (response.data.status === 'SCHEDULED') {
        await api.post(`/interviews/${id}/begin`)
      }

      const questionResponse = await api.get(`/interviews/${id}/next-question`)
      setCurrentQuestion(questionResponse.data)
    } catch (error) {
      console.error('Failed to fetch interview:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTranscript = (transcript, isFinal) => {
    if (isFinal) {
      setAnswer(prev => prev + ' ' + transcript)
    }
  }

  const handleRecordingChange = async (recording) => {
    if (recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStreamRef.current = stream
        setAudioStream(stream)
      } catch (err) {
        console.error('Error getting audio stream:', err)
      }
    } else if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
      setAudioStream(null)
    }
  }

  const handleEmotionChange = (data) => {
    if (data?.emotion) {
      setAvatarEmotion(data.emotion)
    }
  }

  const handleCodingSubmit = (result) => {
    setAnswer(JSON.stringify(result))
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return

    setSubmitting(true)
    try {
      const response = await api.post(`/interviews/${id}/answer`, {
        sessionId: currentQuestion.id,
        answer: answer,
      })

      const evalData = response.data?.evaluation
      if (evalData) {
        setFeedback({
          score: evalData.score,
          grade: evalData.grade,
          feedback: evalData.feedback,
          strengths: evalData.strengths,
          weaknesses: evalData.weaknesses,
          sampleResponse: evalData.sampleResponse,
          communicationScore: evalData.communicationScore,
          technicalDepth: evalData.technicalDepth,
        })
      } else {
        setFeedback({ score: 0, grade: '-', feedback: 'Answer submitted.' })
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = async () => {
    setFeedback(null)
    setAnswer('')

    if (interview.currentQuestionIndex + 1 >= interview.totalQuestions) {
      setSubmitting(true)
      try {
        await api.post(`/interviews/${id}/end`)
      } catch (e) {
        console.error('Failed to end interview:', e)
      }
      navigate(`/report/${id}`)
    } else {
      const res = await api.get(`/interviews/${id}/next-question`)
      setCurrentQuestion(res.data)
      setInterview({ ...interview, currentQuestionIndex: interview.currentQuestionIndex + 1 })
    }
  }

  const handleEndInterview = async () => {
    try {
      await api.post(`/interviews/${id}/end`)
      navigate(`/report/${id}`)
    } catch (error) {
      console.error('Failed to end interview:', error)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <BackgroundVideo />
        <div className="relative z-10 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#fff' }} />
        </div>
      </div>
    )
  }

  if (!interview || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'oklch(100% 0 0 / 0.4)' }}>Interview not found or completed.</p>
      </div>
    )
  }

  const isCodingQuestion = currentQuestion.questionType === 'CODING'

  return (
    <div className="relative min-h-screen">
      <BackgroundVideo />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Anti-Cheat Modal */}
      {showAntiCheat && (
        <AntiCheatModal
          onAccept={() => { setAntiCheatAccepted(true); setShowAntiCheat(false) }}
          onCancel={() => navigate('/')}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Interview Area */}
        <div className="xl:col-span-2">
          {/* Header */}
          <GlassCard className="mb-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold" style={{ color: '#fff' }}>{interview.title}</h1>
              <GlassBadge variant="primary">Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}</GlassBadge>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.05)' }}>
              <div className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${((interview.currentQuestionIndex + 1) / interview.totalQuestions) * 100}%`, background: '#6366f1' }} />
            </div>
          </GlassCard>

          {/* Digital Avatar */}
          {showAvatar && (
            <div className="mb-6">
              <DigitalAvatar isSpeaking={avatarSpeaking} emotion={avatarEmotion} name="AI Interviewer" message={currentQuestion.questionText} />
            </div>
          )}

          {/* Question Card */}
          <GlassCard className="mb-6 p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#6366f1' }}>
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: '#818cf8' }}>AI Interviewer</p>
                <p style={{ color: '#fff' }}>{currentQuestion.questionText}</p>
                <div className="mt-2 flex space-x-2">
                  <GlassBadge variant="primary">{currentQuestion.questionType}</GlassBadge>
                  <GlassBadge variant="warning">{currentQuestion.difficulty}</GlassBadge>
                </div>
                <div className="mt-4"><VoicePlayer text={currentQuestion.questionText} autoPlay={false} onSpeakingChange={setAvatarSpeaking} /></div>
              </div>
            </div>
          </GlassCard>

          {/* Follow-up Question */}
          {currentQuestion.aiFollowUp && (
            <GlassCard className="mb-6 p-5" style={{ background: 'linear-gradient(145deg, rgba(251,191,36,.08), rgba(245,158,11,.05))', borderColor: 'rgba(251,191,36,.2)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: '#fbbf24' }}>Follow-up Question</p>
              <p style={{ color: 'rgba(255,220,150,.9)' }}>{currentQuestion.aiFollowUp}</p>
            </GlassCard>
          )}

          {/* Input Mode Selector */}
          <GlassCard className="mb-6 p-4">
            <div className="flex space-x-2">
              {[
                { mode: 'text', icon: MessageSquare, label: 'Text' },
                { mode: 'voice', icon: Mic, label: 'Voice' },
                ...(isCodingQuestion ? [{ mode: 'coding', icon: Code, label: 'Code' }] : []),
              ].map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setInputMode(mode)} className="flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: inputMode === mode ? '#6366f1' : 'rgba(255,255,255,.06)', color: inputMode === mode ? '#fff' : 'rgba(255,255,255,.5)', border: `1px solid ${inputMode === mode ? '#6366f1' : 'rgba(255,255,255,.08)'}` }}>
                  <Icon className="w-4 h-4 mr-2" />{label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Answer Input */}
          {inputMode === 'coding' && isCodingQuestion ? (
            <GlassCard className="mb-6 p-0 overflow-hidden h-96">
              <CodingEnvironment problem={{ id: currentQuestion.id, title: currentQuestion.questionText, description: currentQuestion.questionText }} onSubmit={handleCodingSubmit} />
            </GlassCard>
          ) : (
            <GlassCard className="mb-6 p-6">
              {inputMode === 'voice' ? (
                <VoiceRecorder onTranscript={handleTranscript} onRecordingChange={handleRecordingChange} disabled={submitting} />
              ) : (
                <>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,.6)' }}>Your Answer</label>
                  <GlassInput as="textarea" rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." style={{ resize: 'none' }} />
                </>
              )}

              {feedback ? (
                <GlassCard className="mt-4 p-5" style={{ background: 'linear-gradient(145deg, rgba(24,22,20,.6), rgba(10,15,18,.7))' }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Feedback</h3>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.7)' }}>{feedback.feedback}</p>
                    {feedback.strengths && <div><p className="text-xs font-semibold mb-1" style={{ color: '#4ade80' }}>Strengths</p><p className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>{feedback.strengths}</p></div>}
                    {feedback.weaknesses && <div><p className="text-xs font-semibold mb-1" style={{ color: '#fbbf24' }}>Areas to Improve</p><p className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>{feedback.weaknesses}</p></div>}
                  </div>
                  {feedback.sampleResponse && (
                    <details className="mb-4"><summary className="text-xs font-semibold cursor-pointer hover:opacity-80" style={{ color: '#818cf8' }}>Sample Response</summary>
                      <p className="mt-2 text-sm leading-relaxed p-3 rounded-xl" style={{ color: 'rgba(255,255,255,.6)', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>{feedback.sampleResponse}</p>
                    </details>
                  )}
                  <WhiteButton onClick={handleContinue} disabled={submitting} className="w-full py-2.5 text-sm mt-2">
                    {submitting ? 'Generating...' : interview.currentQuestionIndex + 1 >= interview.totalQuestions ? 'View Report' : 'Continue to Next Question'}
                  </WhiteButton>
                </GlassCard>
              ) : (
                <div className="mt-4 flex justify-between">
                  <button onClick={handleEndInterview} className="px-4 py-2 text-sm font-medium rounded-xl" style={{ color: 'rgba(255,255,255,.5)' }}>
                    <SkipForward className="h-4 w-4 mr-2 inline" />End Interview
                  </button>
                  <WhiteButton onClick={handleSubmitAnswer} disabled={submitting || !answer.trim()} className="px-5 py-2.5 text-sm">
                    <Send className="h-4 w-4 mr-2 inline" />{submitting ? 'Submitting...' : 'Submit Answer'}
                  </WhiteButton>
                </div>
              )}
            </GlassCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SpeechEmotionAnalyzer audioStream={audioStream} onEmotionChange={handleEmotionChange} enabled={inputMode === 'voice'} />
          {showBodyLanguage && <BodyLanguageAnalyzer enabled={true} onAnalysisUpdate={setBodyAnalysis} />}
          {showProctoring && <ProctoringMonitor onViolation={async (v) => { if (v.type === 'interview_end') { try { await api.post(`/interviews/${id}/end`) } catch (e) {} alert('Interview terminated.'); navigate('/') } }} enabled={showProctoring} />}
          <GlassCard className="p-4">
            <h3 className="font-medium mb-3" style={{ color: '#fff' }}>Analysis Panels</h3>
            <div className="space-y-2">
              {[
                { label: 'Digital Avatar', checked: showAvatar, onChange: setShowAvatar },
                { label: 'Body Language', checked: showBodyLanguage, onChange: setShowBodyLanguage },
                { label: 'Proctoring', checked: showProctoring, onChange: setShowProctoring },
              ].map(({ label, checked, onChange }) => (
                <label key={label} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded" style={{ accentColor: '#6366f1' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>{label}</span>
                </label>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Interview
