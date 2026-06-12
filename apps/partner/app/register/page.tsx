'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { partnerApi, setToken, setRefreshToken } from '../../lib/api'

const TYPES = [
  { value: 'nursery', label: '🌺 Nursery', desc: 'Sell live plants' },
  { value: 'seed_house', label: '🌱 Seed House', desc: 'Sell seed packets' },
  { value: 'supply_store', label: '🪴 Supply Store', desc: 'Pots, soil, tools' },
  { value: 'multi', label: '🏪 Multi-category', desc: 'Plants + seeds + supplies' },
]

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry']

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', businessName: '', ownerName: '', phone: '', type: '', city: '', state: '', pincode: '', gstNumber: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.type) { setError('Please select a partner type'); return }
    setLoading(true); setError('')
    try {
      const res = await partnerApi.register(form as any)
      setToken(res.data.tokens.accessToken)
      setRefreshToken(res.data.tokens.refreshToken)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f0e8', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1a1a18', margin: 0 }}>Join as a Partner</h1>
          <p style={{ color: '#6b6b64', fontSize: 14, marginTop: 8 }}>Sell your plants, seeds & supplies to thousands of home gardeners across India</p>
        </div>

        {/* Partner type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, type: t.value }))}
              style={{ padding: '16px', borderRadius: 14, border: `2px solid ${form.type === t.value ? '#3b6d11' : '#e8e0d0'}`, backgroundColor: form.type === t.value ? '#eaf3de' : 'white', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontSize: 20 }}>{t.label.split(' ')[0]}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a18', marginTop: 4 }}>{t.label.split(' ').slice(1).join(' ')}</div>
              <div style={{ fontSize: 12, color: '#6b6b64', marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="Business Details">
              <Row>
                <Field label="Business Name *" value={form.businessName} onChange={set('businessName')} placeholder="Green Thumb Nursery" required />
                <Field label="Owner Name *" value={form.ownerName} onChange={set('ownerName')} placeholder="Ramesh Kumar" required />
              </Row>
              <Field label="Description" value={form.description} onChange={set('description')} placeholder="Tell customers about your business…" textarea />
            </Section>

            <Section title="Contact & Location">
              <Row>
                <Field label="Phone *" value={form.phone} onChange={set('phone')} placeholder="9876543210" required />
                <Field label="GST Number" value={form.gstNumber} onChange={set('gstNumber')} placeholder="22AAAAA0000A1Z5" />
              </Row>
              <Row>
                <Field label="City *" value={form.city} onChange={set('city')} placeholder="Mumbai" required />
                <div style={{ flex: 1 }}>
                  <label style={lbl}>State *</label>
                  <select value={form.state} onChange={set('state')} required style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ width: 100 }}>
                  <Field label="Pincode *" value={form.pincode} onChange={set('pincode')} placeholder="400001" required maxLength={6} />
                </div>
              </Row>
            </Section>

            <Section title="Account">
              <Field label="Email address *" value={form.email} onChange={set('email')} type="email" placeholder="you@business.com" required />
              <Field label="Password *" value={form.password} onChange={set('password')} type="password" placeholder="Min 8 characters" required />
            </Section>

            {error && <p style={{ color: '#c0392b', fontSize: 13, margin: 0, padding: '10px 14px', backgroundColor: '#fde8e8', borderRadius: 8 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ ...btn, marginTop: 8 }}>
              {loading ? 'Submitting application…' : 'Submit Partner Application →'}
            </button>

            <p style={{ fontSize: 12, color: '#a8a89e', textAlign: 'center', margin: 0 }}>
              Your account will be reviewed within 24 hours. You'll receive an email once approved.
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b6b64' }}>
          Already a partner?{' '}
          <Link href="/login" style={{ color: '#3b6d11', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#3b6d11', margin: '0 0 12px' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 12 }}>{children}</div>
}

function Field({ label, value, onChange, type = 'text', placeholder, required, textarea, maxLength }: any) {
  return (
    <div style={{ flex: 1 }}>
      <label style={lbl}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
            style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            required={required} maxLength={maxLength} style={inp} />}
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 14px', fontSize: 14, border: '1.5px solid #e8e0d0', borderRadius: 10, outline: 'none', color: '#1a1a18', backgroundColor: '#faf9f7' }
const btn: React.CSSProperties = { padding: '14px', backgroundColor: '#3b6d11', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }
