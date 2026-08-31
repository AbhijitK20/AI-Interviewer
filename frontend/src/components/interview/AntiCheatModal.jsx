import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Monitor, Eye, Copy, Mic, Wifi, X } from 'lucide-react'

const AntiCheatModal = ({ onAccept, onCancel }) => {
  const [checks, setChecks] = useState({
    clipboard: false,
    screenShare: false,
    focus: false,
    fullscreen: false,
  })
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    // Monitor clipboard events
    const handleCopy = () => setChecks(prev => ({ ...prev, clipboard: true }))
    const handlePaste = () => setChecks(prev => ({ ...prev, clipboard: true }))
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    // Monitor screen sharing
    const checkScreenShare = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          setChecks(prev => ({ ...prev, screenShare: false }))
        }
      } catch (e) {}
    }
    checkScreenShare()

    // Monitor focus
    const handleBlur = () => setChecks(prev => ({ ...prev, focus: true }))
    const handleFocus = () => setChecks(prev => ({ ...prev, focus: false }))
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-center mb-3">
            <Shield className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-center">Interview Integrity Notice</h2>
          <p className="text-sm text-white/80 text-center mt-1">
            AI-Powered Proctoring Active
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Warning: Cheating Detection Active</p>
                <p className="text-amber-700 text-xs mt-1">
                  This interview uses AI-powered proctoring. Any suspicious activity will be flagged and may result in interview termination.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <h3 className="font-semibold text-ink-900 text-sm">During this interview, the following is monitored:</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-ink-50 rounded-lg">
                <Monitor className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-ink-700">Tab switching and window focus changes</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-ink-50 rounded-lg">
                <Copy className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-ink-700">Clipboard copy/paste activity</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-ink-50 rounded-lg">
                <Eye className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-ink-700">Face detection and gaze tracking</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-ink-50 rounded-lg">
                <Mic className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-ink-700">Audio and speech analysis</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-ink-50 rounded-lg">
                <Wifi className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-ink-700">Network and connectivity monitoring</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-800 text-xs font-medium">
              <strong>Prohibited during interview:</strong> AI assistants (ChatGPT, Claude, etc.), 
              screen sharing, external monitors, additional browsers, phone usage, 
              copy-paste from external sources, notes or reference materials.
            </p>
          </div>

          {/* System Check Status */}
          <div className="mb-4">
            <h3 className="font-semibold text-ink-900 text-sm mb-2">Pre-Interview System Check:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                !checks.clipboard ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <Copy className="w-3.5 h-3.5" />
                {checks.clipboard ? 'Clipboard active' : 'Clipboard clear'}
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                !checks.screenShare ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <Monitor className="w-3.5 h-3.5" />
                {checks.screenShare ? 'Screen share detected' : 'No screen share'}
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                !checks.focus ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <Eye className="w-3.5 h-3.5" />
                {checks.focus ? 'Window unfocused' : 'Window focused'}
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg text-xs bg-emerald-50 text-emerald-700">
                <Shield className="w-3.5 h-3.5" />
                Proctoring active
              </div>
            </div>
          </div>

          {/* Acknowledge */}
          <label className="flex items-start gap-3 p-3 border border-ink-200 rounded-xl cursor-pointer hover:bg-ink-50 transition-colors mb-4">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-ink-700">
              I understand and agree to the interview integrity rules. 
              I will not use any prohibited tools or aids during this interview.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-ink-200 text-ink-700 rounded-xl hover:bg-ink-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!acknowledged}
              className="flex-1 px-4 py-2.5 bg-gradient-brand text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm font-medium"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AntiCheatModal
