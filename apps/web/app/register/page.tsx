'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace(next)
  }, [user, router, next])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(name, email, password, phone || undefined)
      toast.success('Account created!')
      router.replace(next)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
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
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1a1a18', marginBottom: 8 }}>Start growing</h1>
          <p style={{ fontSize: 14, color: '#6b6b64' }}>Create your free Verdura account</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', display: 'block', marginBottom: 6 }}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Aryan Sharma" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', display: 'block', marginBottom: 6 }}>
                Phone <span style={{ color: '#a8a89e', fontWeight: 400 }}>(optional)</span>
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#3b6d11', color: 'white', padding: '13px', borderRadius: 100, border: 'none', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6b6b64' }}>
            Already have an account?{' '}
            <Link href={`/login${next !== '/' ? `?next=${next}` : ''}`} style={{ color: '#3b6d11', fontWeight: 500, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
