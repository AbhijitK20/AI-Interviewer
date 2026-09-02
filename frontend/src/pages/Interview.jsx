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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--color-ink)' }}></div>
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
    <div className="max-w-7xl mx-auto">
      {/* Anti-Cheat Modal */}
      {showAntiCheat && (
        <AntiCheatModal
          onAccept={() => {
            setAntiCheatAccepted(true)
            setShowAntiCheat(false)
          }}
          onCancel={() => navigate('/')}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Interview Area */}
        <div className="xl:col-span-2">
          {/* Header */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>{interview.title}</h1>
              <span className="badge badge-primary">
                Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'oklch(100% 0 0 / 0.05)' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${((interview.currentQuestionIndex + 1) / interview.totalQuestions) * 100}%`,
                  background: 'var(--color-accent)',
                }}
              ></div>
            </div>
          </div>

          {/* Digital Avatar */}
          {showAvatar && (
            <div className="mb-6">
              <DigitalAvatar
                isSpeaking={avatarSpeaking}
                emotion={avatarEmotion}
                name="AI Interviewer"
                message={currentQuestion.questionText}
              />
            </div>
          )}

          {/* Question Card */}
          <div className="card mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--color-accent)' }}>
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-accent)' }}>AI Interviewer</p>
                <p style={{ color: 'var(--color-ink)' }}>{currentQuestion.questionText}</p>
                <div className="mt-2 flex space-x-2">
                  <span className="badge badge-primary">
                    {currentQuestion.questionType}
                  </span>
                  <span className="badge badge-warning">
                    {currentQuestion.difficulty}
                  </span>
                </div>

                {/* Voice Player for Question */}
                <div className="mt-4">
                  <VoicePlayer
                    text={currentQuestion.questionText}
                    autoPlay={false}
                    onSpeakingChange={setAvatarSpeaking}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Question */}
          {currentQuestion.aiFollowUp && (
            <div className="card mb-6" style={{ background: 'oklch(55% 0.15 85 / 0.1)', borderColor: 'oklch(55% 0.15 85 / 0.2)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'oklch(80% 0.15 85)' }}>Follow-up Question</p>
              <p style={{ color: 'oklch(90% 0.12 85)' }}>{currentQuestion.aiFollowUp}</p>
            </div>
          )}

          {/* Input Mode Selector */}
          <div className="card mb-6">
            <div className="flex space-x-2">
              {[
                { mode: 'text', icon: MessageSquare, label: 'Text' },
                { mode: 'voice', icon: Mic, label: 'Voice' },
                ...(isCodingQuestion ? [{ mode: 'coding', icon: Code, label: 'Code' }] : []),
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: inputMode === mode ? 'var(--color-accent)' : 'oklch(100% 0 0 / 0.05)',
                    color: inputMode === mode ? 'white' : 'oklch(100% 0 0 / 0.5)',
                    border: `1px solid ${inputMode === mode ? 'var(--color-accent)' : 'oklch(100% 0 0 / 0.08)'}`,
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Answer Input */}
          {inputMode === 'coding' && isCodingQuestion ? (
            <div className="card overflow-hidden mb-6 h-96">
              <CodingEnvironment
                problem={{
                  id: currentQuestion.id,
                  title: currentQuestion.questionText,
                  description: currentQuestion.questionText,
                }}
                onSubmit={handleCodingSubmit}
              />
            </div>
          ) : (
            <div className="card mb-6">
              {inputMode === 'voice' ? (
                <VoiceRecorder
                  onTranscript={handleTranscript}
                  onRecordingChange={handleRecordingChange}
                  disabled={submitting}
                />
              ) : (
                <>
                  <label htmlFor="answer" className="block text-sm font-medium mb-2" style={{ color: 'oklch(100% 0 0 / 0.6)' }}>
                    Your Answer
                  </label>
                  <textarea
                    id="answer"
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="input resize-none"
                    placeholder="Type your answer here..."
                  />
                </>
              )}

              {feedback ? (
                /* Quick Feedback Panel */
                <div className="mt-4 card" style={{ background: 'oklch(100% 0 0 / 0.03)' }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-ink)' }}>Feedback</h3>

                  <div className="space-y-3 mb-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'oklch(100% 0 0 / 0.7)' }}>{feedback.feedback}</p>

                    {feedback.strengths && (
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'oklch(75% 0.14 155)' }}>Strengths</p>
                        <p className="text-sm" style={{ color: 'oklch(100% 0 0 / 0.5)' }}>{feedback.strengths}</p>
                      </div>
                    )}

                    {feedback.weaknesses && (
                      <div>
                        <p className="text-xs font-semibold text-amber-600 mb-1">Areas to Improve</p>
                        <p className="text-sm text-ink-600">{feedback.weaknesses}</p>
                      </div>
                    )}
                  </div>

                  {feedback.sampleResponse && (
                    <details className="mb-4">
                      <summary className="text-xs font-semibold cursor-pointer hover:opacity-80" style={{ color: 'var(--color-accent)' }}>
                        Sample Response
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed card" style={{ color: 'oklch(100% 0 0 / 0.6)' }}>
                        {feedback.sampleResponse}
                      </p>
                    </details>
                  )}

                  <button
                    onClick={handleContinue}
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/20 border-t-black" />
                        Generating Report...
                      </>
                    ) : interview.currentQuestionIndex + 1 >= interview.totalQuestions ? (
                      <>View Report<ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>Continue to Next Question<ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex justify-between">
                  <button onClick={handleEndInterview} className="btn-ghost">
                    <SkipForward className="h-4 w-4 mr-2" />
                    End Interview
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                    className="btn-primary"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Analysis Panels */}
        <div className="space-y-6">
          {/* Speech Emotion Analyzer */}
          <SpeechEmotionAnalyzer
            audioStream={audioStream}
            onEmotionChange={handleEmotionChange}
            enabled={inputMode === 'voice'}
          />

          {/* Body Language Analyzer */}
          {showBodyLanguage && (
            <BodyLanguageAnalyzer
              enabled={true}
              onAnalysisUpdate={setBodyAnalysis}
            />
          )}

          {/* Proctoring Monitor */}
          {showProctoring && (
            <ProctoringMonitor
              onViolation={async (v) => {
                console.log('Violation:', v)
                if (v.type === 'interview_end') {
                  try {
                    await api.post(`/interviews/${id}/end`)
                  } catch (e) {
                    console.error('Failed to end interview:', e)
                  }
                  alert('Interview terminated: Too many violations detected.')
                  navigate('/')
                }
              }}
              enabled={showProctoring}
            />
          )}

          {/* Toggle Panels */}
          <div className="card">
            <h3 className="font-medium mb-3" style={{ color: 'var(--color-ink)' }}>Analysis Panels</h3>
            <div className="space-y-2">
              {[
                { label: 'Digital Avatar', checked: showAvatar, onChange: setShowAvatar },
                { label: 'Body Language', checked: showBodyLanguage, onChange: setShowBodyLanguage },
                { label: 'Proctoring', checked: showProctoring, onChange: setShowProctoring },
              ].map(({ label, checked, onChange }) => (
                <label key={label} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="rounded"
                    style={{ borderColor: 'var(--border)', accentColor: 'var(--color-accent)' }}
                  />
                  <span className="text-sm" style={{ color: 'oklch(100% 0 0 / 0.6)' }}>{label}</span>
                </label>
              ))}
            </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default Interview
