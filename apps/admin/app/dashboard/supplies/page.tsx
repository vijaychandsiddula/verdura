'use client'
import { useEffect, useRef, useState } from 'react'
import { adminApi, type Supply } from '@/lib/api'
import toast from 'react-hot-toast'

const SUPPLY_CATS = ['pots','soil','fertiliser','tools','accessories']

const emptyForm = { name: '', slug: '', description: '', price: '', comparePrice: '', stock: '0', category: 'pots', badges: '', thumbnailUrl: '' }

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminApi.supplies.list().then(r => setSupplies(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const f = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await adminApi.upload(file)
      setForm(p => ({ ...p, thumbnailUrl: res.data.url }))
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const startEdit = (s: Supply) => {
    setEditId(s.id)
    setForm({ name: s.name, slug: s.slug, description: s.description, price: String(s.price), comparePrice: String(s.comparePrice || ''), stock: String(s.stock), category: s.category, badges: s.badges.join(', '), thumbnailUrl: s.thumbnailUrl })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price required'); return }
    setSaving(true)
    try {
      const data = { ...form, price: Number(form.price), comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined, stock: Number(form.stock), badges: form.badges.split(',').map(b => b.trim()).filter(Boolean), images: form.thumbnailUrl ? [form.thumbnailUrl] : [] }
      if (editId) {
        const res = await adminApi.supplies.update(editId, data)
        setSupplies(s => s.map(x => x.id === editId ? res.data : x))
        toast.success('Supply updated')
      } else {
        const res = await adminApi.supplies.create({ ...data, slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-') })
        setSupplies(s => [res.data, ...s])
        toast.success('Supply created')
      }
      setShowForm(false); setEditId(null); setForm(emptyForm)
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate?')) return
    try { await adminApi.supplies.delete(id); setSupplies(s => s.map(x => x.id === id ? { ...x, isActive: false } : x)); toast.success('Deactivated') }
    catch { toast.error('Failed') }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid #e8e0d0', borderRadius: 10, outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a18' }}>Supplies</h1>
          <p style={{ color: '#6b6b64', fontSize: 13, marginTop: 2 }}>{supplies.filter(s => s.isActive).length} active</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          style={{ backgroundColor: '#3b6d11', color: 'white', padding: '10px 20px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          + Add supply
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{editId ? 'Edit supply' : 'New supply'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Name *</label><input value={form.name} onChange={e => f('name', e.target.value)} style={inp} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Slug</label><input value={form.slug} onChange={e => f('slug', e.target.value)} style={inp} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Category</label>
              <select value={form.category} onChange={e => f('category', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                {SUPPLY_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Price (₹) *</label><input type="number" value={form.price} onChange={e => f('price', e.target.value)} style={inp} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Compare price (₹)</label><input type="number" value={form.comparePrice} onChange={e => f('comparePrice', e.target.value)} style={inp} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Stock</label><input type="number" value={form.stock} onChange={e => f('stock', e.target.value)} style={inp} /></div>
          </div>
          <div style={{ marginTop: 14 }}><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Description</label><textarea value={form.description} onChange={e => f('description', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
          <div style={{ marginTop: 14 }}><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Badges (comma-separated)</label><input value={form.badges} onChange={e => f('badges', e.target.value)} placeholder="6 inch, Drainage hole" style={inp} /></div>
          {/* Image upload */}
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, color: '#6b6b64' }}>📷 Product Image</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {form.thumbnailUrl ? (
                <img src={form.thumbnailUrl} alt="thumb" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid #e8e0d0' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>
              )}
              <div style={{ flex: 1 }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  style={{ padding: '7px 14px', backgroundColor: uploading ? '#a8a89e' : '#3b6d11', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: 6, display: 'block' }}>
                  {uploading ? '⏳ Uploading…' : '📤 Upload image'}
                </button>
                <input value={form.thumbnailUrl} onChange={e => f('thumbnailUrl', e.target.value)} placeholder="Or paste URL…" style={{ ...inp, fontSize: 12 }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ backgroundColor: '#3b6d11', color: 'white', padding: '9px 20px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '9px 18px', borderRadius: 100, border: '1px solid #e8e0d0', background: 'white', fontSize: 13, cursor: 'pointer', color: '#6b6b64' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ color: '#6b6b64' }}>Loading…</div> : (
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e8e0d0' }}>
                {['Supply', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b6b64', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supplies.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < supplies.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: '#1a1a18' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#a8a89e' }}>{s.badges.slice(0, 2).join(' · ')}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b6b64' }}>{s.category}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#3b6d11' }}>₹ {s.price}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: s.stock > 0 ? '#3b6d11' : '#e24b4a', fontWeight: 500 }}>{s.stock}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, backgroundColor: s.isActive ? '#eaf3de' : '#fde8e8', color: s.isActive ? '#27500a' : '#8b0000', padding: '3px 8px', borderRadius: 100 }}>{s.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(s)} style={{ fontSize: 12, color: '#3b6d11', background: 'none', border: '1px solid #c0dd97', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>Edit</button>
                      {s.isActive && <button onClick={() => handleDelete(s.id)} style={{ fontSize: 12, color: '#e24b4a', background: 'none', border: '1px solid #e24b4a', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
