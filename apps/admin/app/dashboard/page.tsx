'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, type Stats } from '@/lib/api'

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8e0d0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#a8a89e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: '#6b6b64' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.stats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40, color: '#6b6b64' }}>Loading…</div>
  if (!stats) return <div style={{ padding: 40, color: '#6b6b64' }}>Failed to load stats</div>

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: '#6b6b64', fontSize: 14 }}>Overview of your store</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Total revenue" value={'₹ ' + stats.totalRevenue.toLocaleString('en-IN')} sub={'₹ ' + stats.monthRevenue.toLocaleString('en-IN') + ' this month'} color="#3b6d11" />
        <StatCard label="Total orders" value={String(stats.totalOrders)} sub={stats.monthOrders + ' this month'} color="#1a1a18" />
        <StatCard label="Customers" value={String(stats.totalUsers)} color="#4040a0" />
        <StatCard label="Active plants" value={String(stats.totalPlants)} color="#854f0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8e0d0' }}>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/dashboard/plants/new" style={{ display: 'block', backgroundColor: '#3b6d11', color: 'white', padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>+ Add new plant</Link>
            <Link href="/dashboard/supplies" style={{ display: 'block', backgroundColor: '#f5f0e8', color: '#1a1a18', padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 500, textAlign: 'center', border: '1px solid #e8e0d0' }}>Manage supplies</Link>
            <Link href="/dashboard/orders" style={{ display: 'block', backgroundColor: '#f5f0e8', color: '#1a1a18', padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 500, textAlign: 'center', border: '1px solid #e8e0d0' }}>View all orders</Link>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8e0d0' }}>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>System status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'API server', status: 'Online', ok: true },
              { label: 'Database', status: 'Connected', ok: true },
              { label: 'Push notifications', status: 'Active', ok: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6b6b64' }}>{s.label}</span>
                <span style={{ fontSize: 12, backgroundColor: s.ok ? '#eaf3de' : '#fde8e8', color: s.ok ? '#27500a' : '#8b0000', padding: '3px 10px', borderRadius: 100, fontWeight: 500 }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
