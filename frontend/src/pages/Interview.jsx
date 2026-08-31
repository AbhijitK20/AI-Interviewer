import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Send, SkipForward, MessageSquare, Mic, Code } from 'lucide-react'
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

  const audioStreamRef = useRef(null)

  useEffect(() => {
    fetchInterview()
    // Show anti-cheat modal on first load
    if (!antiCheatAccepted) {
      setShowAntiCheat(true)
    }
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
      await api.post(`/interviews/${id}/answer`, {
        sessionId: currentQuestion.id,
        answer: answer,
      })

      setAnswer('')

      if (interview.currentQuestionIndex + 1 >= interview.totalQuestions) {
        await api.post(`/interviews/${id}/end`)
        navigate(`/report/${id}`)
      } else {
        const questionResponse = await api.get(`/interviews/${id}/next-question`)
        setCurrentQuestion(questionResponse.data)
        setInterview({ ...interview, currentQuestionIndex: interview.currentQuestionIndex + 1 })
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setSubmitting(false)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!interview || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Interview not found or completed.</p>
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
          <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-ink-900">{interview.title}</h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
              </span>
            </div>
            <div className="w-full bg-ink-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-gradient-brand"
                style={{ width: `${((interview.currentQuestionIndex + 1) / interview.totalQuestions) * 100}%` }}
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
          <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary-600 mb-1">AI Interviewer</p>
                <p className="text-ink-900">{currentQuestion.questionText}</p>
                <div className="mt-2 flex space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {currentQuestion.questionType}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
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
            <div className="bg-yellow-50 rounded-lg shadow p-6 mb-6 border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-1">Follow-up Question</p>
              <p className="text-yellow-900">{currentQuestion.aiFollowUp}</p>
            </div>
          )}

          {/* Input Mode Selector */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setInputMode('text')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Text
              </button>
              <button
                onClick={() => setInputMode('voice')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'voice'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice
              </button>
              {isCodingQuestion && (
                <button
                  onClick={() => setInputMode('coding')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'coding'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </button>
              )}
            </div>
          </div>

          {/* Answer Input */}
          {inputMode === 'coding' && isCodingQuestion ? (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6 h-96">
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
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              {inputMode === 'voice' ? (
                <VoiceRecorder
                  onTranscript={handleTranscript}
                  onRecordingChange={handleRecordingChange}
                  disabled={submitting}
                />
              ) : (
                <>
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    id="answer"
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Type your answer here..."
                  />
                </>
              )}

              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleEndInterview}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  End Interview
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answer.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
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
              onViolation={(v) => {
                console.log('Violation:', v)
                if (v.type === 'interview_end') {
                  // End interview after 3 repeated violations
                  alert('Interview terminated: Too many violations detected.')
                  navigate('/')
                }
              }}
              enabled={showProctoring}
            />
          )}

          {/* Toggle Panels */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-900 mb-3">Analysis Panels</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showAvatar}
                  onChange={(e) => setShowAvatar(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Digital Avatar</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showBodyLanguage}
                  onChange={(e) => setShowBodyLanguage(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Body Language</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showProctoring}
                  onChange={(e) => setShowProctoring(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Proctoring</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interview
