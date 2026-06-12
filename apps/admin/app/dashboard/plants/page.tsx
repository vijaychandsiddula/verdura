'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, type Plant } from '@/lib/api'
import toast from 'react-hot-toast'

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminApi.plants.list().then(r => setPlants(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Deactivate ' + name + '?')) return
    try { await adminApi.plants.delete(id); setPlants(p => p.map(x => x.id === id ? { ...x, isActive: false } : x)); toast.success('Deactivated') }
    catch { toast.error('Failed') }
  }

  const handleRestore = async (id: string, name: string) => {
    try { await adminApi.plants.update(id, { isActive: true }); setPlants(p => p.map(x => x.id === id ? { ...x, isActive: true } : x)); toast.success(name + ' restored') }
    catch { toast.error('Failed') }
  }

  const filtered = plants.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.scientificName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 2 }}>Plants</h1>
          <p style={{ color: '#6b6b64', fontSize: 13 }}>{plants.filter(p => p.isActive).length} active · {plants.length} total</p>
        </div>
        <Link href="/dashboard/plants/new" style={{ backgroundColor: '#3b6d11', color: 'white', padding: '10px 20px', borderRadius: 100, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
          + Add plant
        </Link>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plants…"
        style={{ width: '100%', maxWidth: 360, padding: '10px 14px', fontSize: 14, border: '1px solid #e8e0d0', borderRadius: 10, marginBottom: 20, outline: 'none', backgroundColor: 'white' }} />

      {loading ? <div style={{ color: '#6b6b64' }}>Loading…</div> : (
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e8e0d0' }}>
                {['Plant', 'Price', 'Stock', 'Difficulty', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b6b64', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: '#1a1a18' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#a8a89e', fontStyle: 'italic' }}>{p.scientificName}</div>
                    {p.isBestseller && <span style={{ fontSize: 10, backgroundColor: '#eaf3de', color: '#27500a', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>Bestseller</span>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: '#3b6d11' }}>₹ {p.price}</span>
                    {p.comparePrice && <span style={{ fontSize: 12, color: '#a8a89e', textDecoration: 'line-through', marginLeft: 6 }}>₹ {p.comparePrice}</span>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14 }}>
                    <span style={{ color: p.stock > 10 ? '#3b6d11' : p.stock > 0 ? '#854f0b' : '#e24b4a', fontWeight: 500 }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12 }}>
                    <span style={{ backgroundColor: p.difficulty === 'beginner' ? '#eaf3de' : p.difficulty === 'intermediate' ? '#fdf5e6' : '#fde8e8', color: p.difficulty === 'beginner' ? '#27500a' : p.difficulty === 'intermediate' ? '#854f0b' : '#8b0000', padding: '3px 8px', borderRadius: 100 }}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, backgroundColor: p.isActive ? '#eaf3de' : '#fde8e8', color: p.isActive ? '#27500a' : '#8b0000', padding: '3px 8px', borderRadius: 100 }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={'/dashboard/plants/' + p.id} style={{ fontSize: 12, color: '#3b6d11', fontWeight: 500, textDecoration: 'none', padding: '5px 10px', border: '1px solid #c0dd97', borderRadius: 6 }}>Edit</Link>
                      {p.isActive
                        ? <button onClick={() => handleDelete(p.id, p.name)} style={{ fontSize: 12, color: '#e24b4a', background: 'none', border: '1px solid #e24b4a', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>Deactivate</button>
                        : <button onClick={() => handleRestore(p.id, p.name)} style={{ fontSize: 12, color: '#3b6d11', background: 'none', border: '1px solid #c0dd97', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>Restore</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b6b64', fontSize: 14 }}>No plants found</div>}
        </div>
      )}
    </div>
  )
}
