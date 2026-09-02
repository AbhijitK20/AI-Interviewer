import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Shield, Brain, Mic, BarChart3, CheckCircle2, ChevronRight, Video, FileText, Users, Zap } from 'lucide-react'

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
          <a href="#roles" className="text-sm text-white/70 hover:text-white transition-colors">Job Roles</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Start Free
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
              AI-Powered Interview Preparation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Ace Your Next
            <br />
            <span className="text-white/60">Interview with AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg text-white/60 max-w-xl leading-relaxed mb-10"
          >
            Practice with an AI interviewer that asks real questions, evaluates your
            answers, and gives you detailed feedback — all before the actual interview.
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
              Start Practicing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="group flex items-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/10 hover:bg-white/15 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </div>
              See How It Works
            </Link>
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
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
              <div className="text-center p-4">
                <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-white/60">AI Interview Simulation</p>
              </div>
            </div>
            <button className="w-full py-2.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-lg border border-white/10 hover:bg-white/15 transition-all">
              Try Demo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '20+', label: 'Job Roles' },
            { value: '3,400+', label: 'Interview Questions' },
            { value: '95%', label: 'User Satisfaction' },
            { value: '24/7', label: 'Available Anytime' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            Three simple steps to boost your interview confidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: FileText, title: 'Choose Your Role', desc: 'Select from 20+ job roles — Frontend, Backend, DevOps, Data Science, and more.' },
            { step: '02', icon: Mic, title: 'Practice Interview', desc: 'Answer AI-generated questions via text or voice. Get real-time feedback on your responses.' },
            { step: '03', icon: BarChart3, title: 'Get Detailed Report', desc: 'Receive a comprehensive evaluation with scores, strengths, weaknesses, and sample answers.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
            >
              <span className="absolute top-4 right-4 text-4xl font-bold text-white/10">{item.step}</span>
              <item.icon className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            Built with AI to give you the most realistic interview experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'AI-Powered Evaluation', desc: 'Multi-agent scoring: technical accuracy, communication clarity, and behavioral fit.' },
            { icon: Mic, title: 'Voice & Text Input', desc: 'Practice speaking your answers or typing — just like a real interview.' },
            { icon: Video, title: 'Digital Avatar', desc: 'Interactive AI interviewer with animated responses and lip sync.' },
            { icon: Shield, title: 'Interview Proctoring', desc: 'Face detection, gaze tracking, and integrity monitoring for realistic practice.' },
            { icon: BarChart3, title: 'Performance Reports', desc: 'Detailed analytics with radar charts, category scores, and improvement tips.' },
            { icon: Users, title: '20+ Job Roles', desc: 'Pre-built question banks for Frontend, Backend, DevOps, Data Science, and more.' },
            { icon: FileText, title: 'Resume Analysis', desc: 'Upload your resume for personalized questions based on your experience.' },
            { icon: Zap, title: 'Instant Feedback', desc: 'Get AI feedback on each answer before moving to the next question.' },
            { icon: CheckCircle2, title: 'Sample Answers', desc: 'Learn from expert-crafted sample responses for every question.' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
            >
              <feature.icon className="w-7 h-7 text-indigo-400 mb-3" />
              <h3 className="text-base font-semibold mb-1.5">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Job Roles */}
      <div id="roles" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Covering Every Role</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            Specialized questions for 20+ engineering and tech roles.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Frontend Developer', 'Backend Developer', 'Full Stack', 'Java Developer',
            'Python Developer', 'AI/ML Engineer', 'DevOps Engineer', 'Data Engineer',
            'Data Scientist', 'Data Analyst', 'Cloud Architect', 'Mobile Developer',
            'QA Engineer', 'System Design', 'Cybersecurity', 'Product Manager',
            'UI/UX Designer', 'SRE', 'Blockchain', 'Game Developer'
          ].map((role) => (
            <span
              key={role}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-default"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to ace your next interview?</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Start practicing with AI-powered feedback today. Free to get started.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
          >
            Start Practicing Free
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
