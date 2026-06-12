'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace(next)
  }, [user, router, next])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      router.replace(next)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: 14, border: '1.5px solid #e8e0d0',
    borderRadius: 12, backgroundColor: 'white', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 5% 40px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>🌿</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1a1a18', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: '#6b6b64' }}>Sign in to your Verdura account</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#3b6d11', color: 'white', padding: '13px', borderRadius: 100, border: 'none', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6b6b64' }}>
            No account?{' '}
            <Link href={`/register${next !== '/' ? `?next=${next}` : ''}`} style={{ color: '#3b6d11', fontWeight: 500, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </div>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#a8a89e' }}>
          Demo: admin@verdura.in / admin123
        </p>
      </div>
    </div>
  )
}
