'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) router.replace('/dashboard') }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await login(email, password); router.replace('/dashboard') }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f0e8' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px' }}>🌿</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a18' }}>Verdura Admin</h1>
          <p style={{ fontSize: 13, color: '#6b6b64', marginTop: 4 }}>Admin access only</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: 20, padding: 28, border: '1px solid #e8e0d0' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5, color: '#1a1a18' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1.5px solid #e8e0d0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5, color: '#1a1a18' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1.5px solid #e8e0d0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: '#3b6d11', color: 'white', padding: '12px', borderRadius: 100, border: 'none', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#a8a89e', marginTop: 16 }}>Demo: admin@verdura.in / admin123</p>
        </div>
      </div>
    </div>
  )
}
