import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Shield, Brain, Mic, BarChart3, CheckCircle2, ChevronRight } from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Video */}
      <video
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        autoPlay muted loop playsInline
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" type="video/mp4" />
      </video>

      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,.03), transparent 24%, transparent 82%, rgba(0,0,0,.05)), radial-gradient(ellipse at 44% 54%, transparent 30%, rgba(0,0,0,.055) 100%)'
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">AI Interviewer</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-6 border border-white/10">
              AI-Powered Interview Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Stop Digging
            <br />
            <span className="text-white/60">Through Dashboards.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg text-white/60 max-w-xl leading-relaxed mb-10"
          >
            Your metrics are scattered across a dozen dashboards.
            Vantage bring them into one clear signal, so every
            decision is backed by data you actually trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              to="/register"
              className="group flex items-center gap-3 px-7 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group flex items-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </div>
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Demo Card */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute right-8 bottom-32 w-64 hidden lg:block"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
              <img
                src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260812_015959_62ae1d8c-21a0-4691-b0ca-9ec991f2fe34.png&w=640&q=80"
                alt="Dashboard preview"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <button className="w-full py-2.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-lg border border-white/10 hover:bg-white/15 transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why AI Interviewer?</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            The modern platform for practicing and improving your interview skills with AI-powered feedback.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'AI-Powered Evaluation', desc: 'Multi-agent evaluation with technical, communication, and behavioral scoring.' },
            { icon: Mic, title: 'Voice & Text Modes', desc: 'Practice with voice or text input, just like a real interview.' },
            { icon: BarChart3, title: 'Detailed Reports', desc: 'Get comprehensive feedback with strengths, weaknesses, and sample answers.' },
            { icon: Shield, title: 'Proctoring Built-in', desc: 'Face detection, gaze tracking, and integrity monitoring.' },
            { icon: CheckCircle2, title: '20+ Job Roles', desc: 'Pre-built question banks for frontend, backend, DevOps, and more.' },
            { icon: Play, title: 'Real-time Avatar', desc: 'Interactive AI interviewer with animated digital avatar.' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
            >
              <feature.icon className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to ace your next interview?</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Start practicing with AI-powered feedback today. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
          >
            Get Started Free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <p className="text-sm text-white/40">2026 AI Interviewer. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-white/40 hover:text-white/70">Privacy</a>
            <a href="#" className="text-sm text-white/40 hover:text-white/70">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
