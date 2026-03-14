import { useState } from 'react'
import { C, F } from '../lib/constants'
import { analytics } from '../lib/analytics'

// The form is identical for mobile and desktop — extracted so it's not duplicated
const LoginForm = ({ mode, setMode, name, setName, email, setEmail, password, setPassword, error, message, loading, onSubmit }) => (
  <>
    {/* Mode toggle */}
    <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3, marginBottom: 24 }}>
      {['login', 'signup'].map((m) => (
        <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: mode === m ? C.white : 'transparent', fontFamily: F.body, fontSize: 12, fontWeight: 600, color: mode === m ? C.text : C.textMuted, transition: 'all 0.15s', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
          {m === 'login' ? 'Log in' : 'Sign up'}
        </button>
      ))}
    </div>

    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      {mode === 'signup' && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>First name</p>
          <input type="text" name="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rachita" style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: 'none' }} />
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Email</p>
        <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: 'none' }} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Password</p>
        <input type="password" name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: 'none' }} />
      </div>

      {error && (
        <div style={{ background: C.errorMuted, borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: `1px solid ${C.error}33` }}>
          <p style={{ fontFamily: F.body, fontSize: 12, color: C.error }}>{error}</p>
        </div>
      )}
      {message && (
        <div style={{ background: C.successMuted, borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: `1px solid ${C.success}33` }}>
          <p style={{ fontFamily: F.body, fontSize: 12, color: C.success }}>{message}</p>
        </div>
      )}

      <button type="submit" className="press" disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.white, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Just a moment…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
    </form>
  </>
)

const AuthScreen = ({ onSignIn, onSignUp, isDesktop }) => {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleModeChange = (m) => { setMode(m); setError(null); setMessage(null); }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await onSignIn(email, password)
      if (error) setError(error.message)
      else analytics.track('signed_in')
    } else {
      const { error } = await onSignUp(email, password, name.trim())
      if (error) {
        setError(error.message)
      } else {
        analytics.track('sign_up_completed')
        setMessage('Check your email for a confirmation link, then come back to log in.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  const formProps = { mode, setMode: handleModeChange, name, setName, email, setEmail, password, setPassword, error, message, loading, onSubmit: handleSubmit }

  if (isDesktop) {
    // ── Desktop: split-screen layout ─────────────────────────────────────────
    return (
      <div style={{ flex: 1, display: 'flex', height: '100%' }}>

        {/* Left panel — brand hero */}
        <div style={{ flex: '0 0 55%', background: `linear-gradient(160deg, #3D2B1F 0%, #6B3A2E 60%, #8B4A3A 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px 60px 80px' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 42, marginBottom: 4 }}>🌙</p>
            <h1 style={{ fontFamily: F.heading, fontSize: 44, fontWeight: 300, fontStyle: 'italic', color: '#F7F3EE', marginBottom: 12 }}>Lunar</h1>
            <p style={{ fontFamily: F.body, fontSize: 16, color: '#F7F3EEaa', lineHeight: 1.6 }}>Track your period cycles, understand your body, and get answers from an AI that feels like it actually knows you.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { emoji: '🩸', title: 'Cycle tracking', desc: 'Log period days and get predictions based on your real history' },
              { emoji: '🤖', title: 'AI that knows you', desc: 'Ask Lunar anything — it has access to your cycle, logs, and lab reports' },
              { emoji: '🧪', title: 'Lab report analysis', desc: 'Upload blood reports and Lunar extracts every marker automatically' },
            ].map((f) => (
              <div key={f.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{f.emoji}</span>
                <div>
                  <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: '#F7F3EE', marginBottom: 3 }}>{f.title}</p>
                  <p style={{ fontFamily: F.body, fontSize: 12, color: '#F7F3EE88', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — login form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', background: C.white }}>
          <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
            <h2 style={{ fontFamily: F.heading, fontSize: 26, fontWeight: 300, color: C.text, marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginBottom: 28 }}>
              {mode === 'login' ? 'Log in to your Lunar account' : 'Start tracking your health with Lunar'}
            </p>
            <LoginForm {...formProps} />
          </div>
        </div>

      </div>
    )
  }

  // ── Mobile: original layout ───────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: 36, marginBottom: 8 }}>🌙</p>
        <h1 style={{ fontFamily: F.heading, fontSize: 32, fontWeight: 300, fontStyle: 'italic', color: C.text }}>Lunar</h1>
        <p style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 4 }}>Your personal health companion</p>
      </div>
      <LoginForm {...formProps} />
    </div>
  )
}

export default AuthScreen
