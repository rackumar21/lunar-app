import { useState } from 'react'
import { C, F } from '../lib/constants'
import { analytics } from '../lib/analytics'

const AuthScreen = ({ onSignIn, onSignUp }) => {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: 36, marginBottom: 8 }}>🌙</p>
        <h1 style={{ fontFamily: F.heading, fontSize: 32, fontWeight: 300, fontStyle: 'italic', color: C.text }}>Lunar</h1>
        <p style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 4 }}>Your personal health companion</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3, marginBottom: 24 }}>
        {['login', 'signup'].map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(null); setMessage(null); }} style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: mode === m ? C.white : 'transparent', fontFamily: F.body, fontSize: 12, fontWeight: 600, color: mode === m ? C.text : C.textMuted, transition: 'all 0.15s', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
            {m === 'login' ? 'Log in' : 'Sign up'}
          </button>
        ))}
      </div>

      {/* Fields */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ marginBottom: 0 }}>
      {mode === 'signup' && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>First name</p>
          <input
            type="text"
            name="name"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rachita"
            style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: 'none' }}
          />
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Email</p>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: 'none' }}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Password</p>
        <input
          type="password"
          name="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6+ characters"
          style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: 'none' }}
        />
      </div>

      {/* Error / success message */}
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

      {/* Submit */}
      <button
        type="submit"
        className="press"
        disabled={loading}
        style={{ width: '100%', padding: '15px', borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.white, opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Just a moment…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
      </form>
    </div>
  )
}

export default AuthScreen
