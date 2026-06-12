'use client'
import { useEffect, useState } from 'react'
import { partnerApi, type Partner } from '../../../lib/api'

export default function Settings() {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [form, setForm] = useState<Partial<Partner>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    partnerApi.me().then(r => { setPartner(r.data); setForm(r.data) })
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false)
    await partnerApi.updateMe(form)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!partner) return <div style={{ color: '#6b6b64', paddingTop: 40 }}>Loading…</div>

  const fi: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 14, border: '1.5px solid #e8e0d0', borderRadius: 10, outline: 'none', color: '#1a1a18', backgroundColor: '#faf9f7' }
  const lb: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 6 }

  return (
    <div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#1a1a18', margin: '0 0 4px' }}>Settings</h2>
      <p style={{ color: '#6b6b64', margin: '0 0 28px', fontSize: 14 }}>Manage your partner profile and payout details</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Profile */}
        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e8e0d0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#3b6d11', margin: '0 0 16px' }}>Business Profile</p>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={lb}>Business Name</label><input style={fi} value={form.businessName || ''} onChange={set('businessName')} /></div>
            <div><label style={lb}>Owner Name</label><input style={fi} value={form.ownerName || ''} onChange={set('ownerName')} /></div>
            <div><label style={lb}>Phone</label><input style={fi} value={form.phone || ''} onChange={set('phone')} /></div>
            <div><label style={lb}>Description</label><textarea style={{ ...fi, resize: 'vertical', fontFamily: 'inherit' }} rows={3} value={form.description || ''} onChange={set('description')} /></div>
            <div><label style={lb}>City</label><input style={fi} value={form.city || ''} onChange={set('city')} /></div>
            <div><label style={lb}>GST Number</label><input style={fi} value={form.gstNumber || ''} onChange={set('gstNumber')} /></div>
            <button type="submit" disabled={saving} style={{ padding: '10px', backgroundColor: '#3b6d11', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Saving…' : saved ? '✅ Saved!' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Payout */}
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e8e0d0', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#3b6d11', margin: '0 0 16px' }}>Payout Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={lb}>UPI ID</label><input style={fi} value={form.upiId || ''} onChange={set('upiId')} placeholder="yourname@upi" /></div>
            </div>
            <p style={{ fontSize: 12, color: '#a8a89e', marginTop: 12 }}>Payouts are processed every 7 days for delivered orders.</p>
          </div>

          {/* Commission info */}
          <div style={{ backgroundColor: '#eaf3de', borderRadius: 16, padding: '24px', border: '1px solid #c8e6a0' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#3b6d11', margin: '0 0 12px' }}>Your Commission Rate</p>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#27500a' }}>{100 - partner.commissionPct}%</div>
            <p style={{ fontSize: 14, color: '#3b6d11', margin: '4px 0 0' }}>of every sale you make</p>
            <p style={{ fontSize: 12, color: '#6b6b64', marginTop: 8 }}>Verdura retains {partner.commissionPct}% as a platform fee covering payments, delivery coordination, and customer support.</p>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #c8e6a0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#3b6d11' }}>Total earned</span>
                <span style={{ fontWeight: 700, color: '#27500a' }}>₹{partner.totalEarnings.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#3b6d11' }}>Pending payout</span>
                <span style={{ fontWeight: 700, color: '#27500a' }}>₹{partner.pendingPayout.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
