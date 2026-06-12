'use client'
import { useEffect, useState } from 'react'
import { adminApi, type AdminUser } from '@/lib/api'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminApi.users.list().then(r => setUsers(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 2 }}>Users</h1>
        <p style={{ color: '#6b6b64', fontSize: 13 }}>{users.filter(u => u.role === 'customer').length} customers</p>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
        style={{ width: '100%', maxWidth: 360, padding: '10px 14px', fontSize: 14, border: '1px solid #e8e0d0', borderRadius: 10, marginBottom: 20, outline: 'none', backgroundColor: 'white' }} />

      {loading ? <div style={{ color: '#6b6b64' }}>Loading…</div> : (
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e8e0d0' }}>
                {['User', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b6b64', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 14, color: '#1a1a18' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b6b64' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b6b64' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, backgroundColor: u.role === 'admin' ? '#fdf5e6' : '#f5f0e8', color: u.role === 'admin' ? '#854f0b' : '#6b6b64', padding: '3px 8px', borderRadius: 100, fontWeight: 500 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#a8a89e' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b6b64', fontSize: 14 }}>No users found</div>}
        </div>
      )}
    </div>
  )
}
