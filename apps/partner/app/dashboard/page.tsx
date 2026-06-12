'use client'
import { useEffect, useState } from 'react'
import { partnerApi, type Dashboard, type Partner } from '../../lib/api'

export default function DashboardOverview() {
  const [dash, setDash] = useState<Dashboard | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([partnerApi.dashboard(), partnerApi.me()])
      .then(([d, m]) => { setDash(d.data); setPartner(m.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#6b6b64', paddingTop: 40, textAlign: 'center' }}>Loading dashboard…</div>

  return (
    <div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#1a1a18', margin: '0 0 4px' }}>
        Welcome back, {partner?.ownerName?.split(' ')[0]} 👋
      </h2>
      <p style={{ color: '#6b6b64', marginTop: 0, marginBottom: 28 }}>{partner?.businessName} · {partner?.city}</p>

      {partner?.status === 'pending' && (
        <div style={{ backgroundColor: '#fdf5e6', border: '1.5px solid #f5c518', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
          <strong>⏳ Application under review</strong>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#854f0b' }}>
            Our team typically approves partners within 24 hours. You'll receive an email once approved and can start listing products.
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon="🌿" label="Plants Listed" value={dash?.listings.plants ?? 0} />
        <StatCard icon="🌱" label="Seeds Listed" value={dash?.listings.seeds ?? 0} />
        <StatCard icon="🪴" label="Supplies Listed" value={dash?.listings.supplies ?? 0} />
        <StatCard icon="💰" label="Pending Payout" value={`₹${(dash?.earnings as any)?.pendingPayout?.toFixed(0) ?? 0}`} green />
      </div>

      {/* Commission info */}
      <div style={{ backgroundColor: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 24, border: '1px solid #e8e0d0' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#1a1a18' }}>💼 How earnings work</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <EarningBox label="Your commission" value={`${100 - (partner?.commissionPct ?? 15)}%`} desc="of every sale goes to you" color="#eaf3de" textColor="#27500a" />
          <EarningBox label="Verdura platform fee" value={`${partner?.commissionPct ?? 15}%`} desc="for marketplace, payments & delivery support" color="#f5f0e8" textColor="#6b6b64" />
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ backgroundColor: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #e8e0d0' }}>
        <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#1a1a18' }}>📦 Recent Orders</p>
        {(!dash?.recentOrders?.length) ? (
          <p style={{ color: '#a8a89e', fontSize: 14 }}>No orders yet. Once you're approved and list products, orders will appear here.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8e0d0', color: '#a8a89e' }}>
                {['Order #', 'Product', 'Qty', 'Your Earning', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', paddingBottom: 10, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dash.recentOrders.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f5f0e8' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600, color: '#3b6d11' }}>#{item.order?.orderNumber?.slice(-6)}</td>
                  <td style={{ padding: '12px 8px 12px 0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</td>
                  <td style={{ padding: '12px 8px 12px 0' }}>×{item.quantity}</td>
                  <td style={{ padding: '12px 8px 12px 0', color: '#27500a', fontWeight: 600 }}>₹{item.partnerEarning?.toFixed(0)}</td>
                  <td style={{ padding: '12px 8px 12px 0' }}><StatusBadge status={item.order?.status} /></td>
                  <td style={{ padding: '12px 0', color: '#a8a89e' }}>{new Date(item.order?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, green }: { icon: string; label: string; value: string | number; green?: boolean }) {
  return (
    <div style={{ backgroundColor: green ? '#eaf3de' : 'white', borderRadius: 16, padding: '20px', border: `1px solid ${green ? '#c8e6a0' : '#e8e0d0'}` }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: green ? '#27500a' : '#1a1a18' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b6b64', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function EarningBox({ label, value, desc, color, textColor }: any) {
  return (
    <div style={{ flex: 1, backgroundColor: color, borderRadius: 12, padding: '16px' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: textColor }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: textColor, marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#6b6b64', marginTop: 2 }}>{desc}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pending: ['#fdf5e6', '#854f0b'],
    confirmed: ['#eaf3de', '#27500a'],
    processing: ['#eaf3de', '#27500a'],
    shipped: ['#e8f0fe', '#1a56db'],
    delivered: ['#eaf3de', '#27500a'],
    cancelled: ['#fde8e8', '#8b0000'],
  }
  const [bg, color] = map[status] || ['#f5f0e8', '#6b6b64']
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 100, backgroundColor: bg, color }}>
      {status}
    </span>
  )
}
