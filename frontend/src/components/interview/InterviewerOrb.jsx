import { motion } from 'framer-motion'
import { Headphones, Loader2, Mic2, Pause, Radio } from 'lucide-react'

const stateCopy = {
  idle: { label: 'Ready when you are', icon: Headphones },
  loading: { label: 'Preparing your question', icon: Loader2 },
  speaking: { label: 'AI Interviewer is speaking', icon: Radio },
  paused: { label: 'Voice paused', icon: Pause },
  listening: { label: 'Listening to your answer', icon: Mic2 },
}

const InterviewerOrb = ({ state = 'idle', name = 'AI Interviewer', message }) => {
  const copy = stateCopy[state] || stateCopy.idle
  const StatusIcon = copy.icon
  const isSpeaking = state === 'speaking'
  const isListening = state === 'listening'

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.12] bg-[linear-gradient(145deg,rgba(24,22,20,.84),rgba(5,12,14,.92))] px-6 pb-5 pt-6 shadow-[0_2px_10px_rgba(0,0,0,.44),inset_0_0_0_3px_rgba(255,255,255,.035)] backdrop-blur-[14px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(99,102,241,.18),transparent_40%)]" />

      <div className="relative flex min-h-[270px] flex-col items-center justify-center">
        <motion.div
          className="absolute h-64 w-64 rounded-full bg-indigo-500/[0.06] blur-3xl"
          animate={{ scale: isSpeaking || isListening ? [1, 1.18, 1] : [1, 1.06, 1] }}
          transition={{ duration: isSpeaking ? 1.8 : 3.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-indigo-300/[0.16]"
            style={{ width: 136 + ring * 42, height: 136 + ring * 42 }}
            animate={{
              scale: isSpeaking ? [0.86, 1.12, 0.86] : [0.94, 1.03, 0.94],
              opacity: isSpeaking ? [0.18, 0.55, 0.18] : [0.12, 0.25, 0.12],
            }}
            transition={{ duration: isSpeaking ? 1.25 + ring * 0.18 : 3 + ring * 0.4, delay: ring * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        <motion.div
          className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border border-white/[0.24] bg-[radial-gradient(circle_at_35%_28%,#c7d2fe_0%,#818cf8_22%,#4f46e5_54%,#17134f_100%)] shadow-[0_0_45px_rgba(99,102,241,.42),inset_10px_10px_24px_rgba(255,255,255,.28),inset_-14px_-16px_28px_rgba(5,8,35,.62)]"
          animate={{
            scale: isSpeaking ? [1, 1.08, 0.98, 1.06, 1] : isListening ? [1, 1.04, 1] : [1, 1.025, 1],
            rotate: state === 'loading' ? 360 : 0,
          }}
          transition={{ scale: { duration: isSpeaking ? 1.1 : 2.8, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 1.4, repeat: Infinity, ease: 'linear' } }}
        >
          <div className="h-12 w-12 rounded-full bg-white/[0.08] shadow-[0_0_24px_rgba(255,255,255,.18)]" />
          <motion.div
            className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,.7)]"
            animate={{ x: [-18, 20, -10, 12, -18], y: [10, -8, -15, 12, 10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="relative z-10 mt-7 text-center">
          <p className="text-sm font-semibold text-white">{name}</p>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-white/50">
            <StatusIcon className={`h-3.5 w-3.5 ${state === 'loading' ? 'animate-spin' : ''}`} />
            <span>{copy.label}</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="relative border-t border-white/[0.07] pt-4">
          <p className="text-sm leading-relaxed text-white/70">{message}</p>
        </div>
      )}
    </div>
  )
}

export default InterviewerOrb
