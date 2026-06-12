'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { partnerApi, setToken, setRefreshToken } from '../../lib/api'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await partnerApi.login(email, password)
      setToken(res.data.tokens.accessToken)
      setRefreshToken(res.data.tokens.refreshToken)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f0e8' }}>
      <div style={{ backgroundColor: 'white', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#1a1a18', margin: 0 }}>Partner Portal</h1>
          <p style={{ color: '#6b6b64', fontSize: 14, marginTop: 6 }}>Sign in to manage your listings & orders</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Email address</label>
            <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@nursery.com" />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <p style={{ color: '#c0392b', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={btn}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b6b64' }}>
          New partner?{' '}
          <Link href="/register" style={{ color: '#3b6d11', fontWeight: 600, textDecoration: 'none' }}>Apply to join →</Link>
        </p>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 14px', fontSize: 15, border: '1.5px solid #e8e0d0', borderRadius: 10, outline: 'none', color: '#1a1a18', backgroundColor: '#faf9f7' }
const btn: React.CSSProperties = { padding: '13px', backgroundColor: '#3b6d11', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }
