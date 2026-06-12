'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/plants', label: 'Plants', icon: '🌿' },
  { href: '/dashboard/supplies', label: 'Supplies', icon: '🪴' },
  { href: '/dashboard/orders', label: 'Orders', icon: '📦' },
  { href: '/dashboard/users', label: 'Users', icon: '👥' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside style={{ width: 220, minHeight: '100vh', backgroundColor: '#1a1a18', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌿</div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Verdura</div>
            <div style={{ color: '#6b6b64', fontSize: 11 }}>Admin</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {NAV.map(n => {
          const active = pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
          return (
            <Link key={n.href} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', backgroundColor: active ? 'rgba(59,109,17,0.3)' : 'transparent', color: active ? '#8ec63f' : '#a8a89e', fontWeight: active ? 500 : 400, fontSize: 13 }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
            </Link>
          )
        })}
      </nav>

      {user && (
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, color: '#6b6b64', marginBottom: 2 }}>{user.name}</div>
          <div style={{ fontSize: 11, color: '#3d3d3a', marginBottom: 10 }}>{user.email}</div>
          <button onClick={logout} style={{ fontSize: 12, color: '#6b6b64', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Sign out →
          </button>
        </div>
      )}
    </aside>
  )
}
