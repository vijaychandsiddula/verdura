'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { partnerApi, setToken, setRefreshToken, type Partner } from '../../lib/api'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/listings', label: 'My Listings', icon: '🌿' },
  { href: '/dashboard/orders', label: 'Orders', icon: '📦' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [partner, setPartner] = useState<Partner | null>(null)

  useEffect(() => {
    partnerApi.me()
      .then(r => setPartner(r.data))
      .catch(() => router.push('/login'))
  }, [])

  const logout = () => {
    setToken(null); setRefreshToken(null)
    router.push('/login')
  }

  const statusColor = partner?.status === 'approved' ? '#27500a' : partner?.status === 'suspended' ? '#8b0000' : '#854f0b'
  const statusBg    = partner?.status === 'approved' ? '#eaf3de' : partner?.status === 'suspended' ? '#fde8e8' : '#fdf5e6'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      {/* Sidebar */}
      <div style={{ width: 240, backgroundColor: '#1a2e0d', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 22, fontFamily: 'Georgia, serif', color: 'white', fontWeight: 700 }}>🌿 Verdura</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>Partner Portal</div>
        </div>

        {/* Partner info */}
        {partner && (
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 2 }}>{partner.businessName}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{partner.city}, {partner.state}</div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 100, backgroundColor: statusBg, color: statusColor }}>
              {partner.status === 'pending' ? '⏳ Pending approval' : partner.status === 'approved' ? '✅ Approved' : '🚫 Suspended'}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', backgroundColor: pathname === n.href ? 'rgba(255,255,255,0.12)' : 'transparent', color: pathname === n.href ? 'white' : 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: pathname === n.href ? 600 : 400, transition: 'all 0.15s' }}>
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0 12px 12px' }}>
          <button onClick={logout}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
            🚪 Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {children}
      </div>
    </div>
  )
}
