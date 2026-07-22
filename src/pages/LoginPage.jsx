import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Lock, Mail, User, ArrowRight, Clock, Sparkles, Quote, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const TIME_QUOTES = [
  {
    quote: "Time is Money. Efficiency is Power.",
    author: "Benjamin Franklin",
    tag: "Productivity Rule",
  },
  {
    quote: "Lost time is never found again. Plan every minute with clarity.",
    author: "TimeFlow Philosophy",
    tag: "Daily Wisdom",
  },
  {
    quote: "The key is not in spending time, but in investing it wisely.",
    author: "Stephen Covey",
    tag: "Time Mastery",
  },
  {
    quote: "Mastering your time is mastering your life and achievements.",
    author: "Robin Sharma",
    tag: "Performance",
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Switch mode: "email" | "name"
  const [loginMode, setLoginMode] = React.useState("email")
  const [identifier, setIdentifier] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  // Rotating quotes index
  const [quoteIdx, setQuoteIdx] = React.useState(0)

  // Auto rotate quotes every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % TIME_QUOTES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await login(identifier, password)
    setLoading(false)

    if (res.success) {
      navigate("/")
    } else {
      setError(res.error || "Login failed")
    }
  }

  const activeQuote = TIME_QUOTES[quoteIdx]

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#060810] p-4 sm:p-6 text-white relative overflow-hidden">
      {/* ── Ambient Background Lighting ───────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ── Main Container (Split Screen Layout) ───────────── */}
      <div className="w-full max-w-4xl bg-[#0e1322]/85 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">

        {/* ── Left Side: Quotes & Branding Showcase ──────────── */}
        <div className="md:col-span-6 bg-gradient-to-br from-indigo-950/60 via-[#101428] to-[#0d0f1c] p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 relative">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-base font-black text-white tracking-tight">TF</span>
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  TIME<span className="text-indigo-400">FLOW</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Daily Work Planner
                </p>
              </div>
            </div>
          </div>

          {/* Middle Quotes Showcase */}
          <div className="my-8 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Quote size={12} />
              {activeQuote.tag}
            </div>

            <div className="min-h-[110px] flex flex-col justify-center transition-all duration-500">
              <p className="text-lg md:text-xl font-extrabold text-slate-100 leading-snug tracking-tight italic">
                "{activeQuote.quote}"
              </p>
              <p className="text-xs font-bold text-indigo-400 mt-3 flex items-center gap-2">
                <span className="w-4 h-[1.5px] bg-indigo-500" />
                {activeQuote.author}
              </p>
            </div>

            {/* Rotating indicators */}
            <div className="flex items-center gap-2 mt-6">
              {TIME_QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuoteIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    quoteIdx === idx ? "w-7 bg-indigo-500" : "w-1.5 bg-slate-700 hover:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Highlights */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Realtime Task Log</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-indigo-400" />
              <span>Project Masters</span>
            </div>
          </div>
        </div>

        {/* ── Right Side: Login Form ─────────────────────────── */}
        <div className="md:col-span-6 p-8 md:p-10 flex flex-col justify-center">

          <div className="mb-6">
            <h3 className="text-2xl font-black text-white tracking-tight">Sign In</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Access your workspace using Email ID or Name
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2 animate-shake">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Mode Switcher Toggle (Email vs Name) ── */}
          <div className="mb-5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setLoginMode("email")
                setError("")
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === "email"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mail size={13} />
              Email ID
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode("name")
                setError("")
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === "name"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User size={13} />
              User Name
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {loginMode === "email" ? "Email Address *" : "Full Name / Username *"}
              </label>
              <div className="relative">
                {loginMode === "email" ? (
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                ) : (
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
                <input
                  type={loginMode === "email" ? "email" : "text"}
                  placeholder={
                    loginMode === "email" ? "e.g. admin@timeflow.com" : "e.g. Abhishek Admin"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* ── Copyright Footer ────────────────────────────────── */}
      <div className="mt-8 text-center text-xs text-slate-500 font-semibold tracking-wider relative z-10 select-none">
        &copy; 2026 Abhishek All rights reserved.
      </div>
    </div>
  )
}
