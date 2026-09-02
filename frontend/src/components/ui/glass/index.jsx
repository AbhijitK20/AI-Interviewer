import { motion } from 'framer-motion'

// Glass Card - matches Vantage demo card style
export const GlassCard = ({ children, className = '', hover = true, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [.22,1,.36,1] }}
    className={`relative ${className}`}
    style={{
      border: '1px solid rgba(255,255,255,.13)',
      borderRadius: 'clamp(12px, 1.52vh, 18px)',
      background: 'linear-gradient(145deg, rgba(24,22,20,.80), rgba(5,12,14,.86))',
      boxShadow: '0 2px 10px rgba(0,0,0,.44), 0 0 0 3px rgba(255,255,255,.035) inset, 0 0 0 1px rgba(0,0,0,.9)',
      backdropFilter: 'blur(14px) saturate(108%)',
      transition: hover ? 'all 0.3s cubic-bezier(.16,1,.3,1)' : 'none',
    }}
    whileHover={hover ? { y: -2, boxShadow: '0 4px 20px rgba(0,0,0,.5), 0 0 0 3px rgba(255,255,255,.05) inset' } : {}}
    {...props}
  >
    {children}
  </motion.div>
)

// Glass Panel - for larger sections
export const GlassPanel = ({ children, className = '', ...props }) => (
  <div
    className={className}
    style={{
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: '16px',
      background: 'linear-gradient(145deg, rgba(24,22,20,.6), rgba(10,15,18,.7))',
      backdropFilter: 'blur(18px) saturate(110%)',
      boxShadow: '0 4px 24px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)',
    }}
    {...props}
  >
    {children}
  </div>
)

// White CTA Button - matches Vantage primary CTA
export const WhiteButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ filter: 'brightness(1.08)', y: -1 }}
    whileTap={{ scale: 0.98 }}
    className={`relative overflow-hidden ${className}`}
    style={{
      background: '#fff',
      color: '#111',
      fontWeight: 450,
      letterSpacing: '-.3px',
      borderRadius: '7px',
      boxShadow: '0 1px 5px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.72)',
      transition: 'filter 140ms',
    }}
    {...props}
  >
    {children}
  </motion.button>
)

// Glass Button - for secondary actions
export const GlassButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ filter: 'brightness(1.08)' }}
    whileTap={{ scale: 0.98 }}
    className={className}
    style={{
      background: 'linear-gradient(145deg, rgba(26,34,36,.86), rgba(16,29,33,.9))',
      border: '1px solid rgba(255,255,255,.21)',
      borderRadius: '12px',
      backdropFilter: 'blur(14px)',
      fontWeight: 430,
      color: '#fff',
      transition: 'filter 140ms',
    }}
    {...props}
  >
    {children}
  </motion.button>
)

// Glass Input - supports as="textarea" prop
export const GlassInput = ({ className = '', as, ...props }) => {
  const Component = as === 'textarea' ? 'textarea' : 'input'
  return (
    <Component
      className={className}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(24,22,20,.8)',
        border: '1px solid rgba(255,255,255,.13)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 400,
        backdropFilter: 'blur(14px)',
        transition: 'all 0.2s',
        outline: 'none',
        resize: as === 'textarea' ? 'none' : undefined,
      }}
      onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,.5)'}
      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,.13)'}
      {...props}
    />
  )
}

// Glass Badge
export const GlassBadge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: { bg: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', border: 'rgba(255,255,255,.12)' },
    success: { bg: 'rgba(34,197,94,.12)', color: '#4ade80', border: 'rgba(34,197,94,.2)' },
    warning: { bg: 'rgba(251,191,36,.12)', color: '#fbbf24', border: 'rgba(251,191,36,.2)' },
    danger: { bg: 'rgba(239,68,68,.12)', color: '#f87171', border: 'rgba(239,68,68,.2)' },
    primary: { bg: 'rgba(99,102,241,.12)', color: '#818cf8', border: 'rgba(99,102,241,.2)' },
  }

  return (
    <span
      className={className}
      style={{
        ...variants[variant],
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        border: `1px solid ${variants[variant].border}`,
      }}
    >
      {children}
    </span>
  )
}

// Background Video - matches Vantage
export const BackgroundVideo = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: -3, overflow: 'hidden' }}>
    <video
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center',
        pointerEvents: 'none', userSelect: 'none',
      }}
      autoPlay muted loop playsInline disablePictureInPicture aria-hidden="true"
    >
      <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" type="video/mp4" />
    </video>
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,.03), transparent 24%, transparent 82%, rgba(0,0,0,.05)), radial-gradient(ellipse at 44% 54%, transparent 30%, rgba(0,0,0,.055) 100%)',
        pointerEvents: 'none',
      }}
    />
  </div>
)

// Entrance animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [.22,1,.36,1] } },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
