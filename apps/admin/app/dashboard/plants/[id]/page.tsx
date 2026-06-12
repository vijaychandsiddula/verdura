'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminApi, type Plant } from '@/lib/api'
import toast from 'react-hot-toast'

export default function EditPlantPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<Partial<Plant>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminApi.plants.list().then(r => {
      const p = r.data.find(x => x.id === id)
      if (p) { setPlant(p); setForm(p) }
      else toast.error('Plant not found')
    }).finally(() => setLoading(false))
  }, [id])

  const f = (field: string, val: unknown) => setForm(p => ({ ...p, [field]: val }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await adminApi.upload(file)
      const url = res.data.url
      // Set as thumbnail and add to images array (avoid duplicates)
      setForm(prev => ({
        ...prev,
        thumbnailUrl: url,
        images: [url, ...((prev.images || []).filter(u => u !== prev.thumbnailUrl))],
      }))
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed — check backend logs') }
    finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const allowed = ['name','slug','scientificName','description','price','comparePrice','stock','thumbnailUrl','images','categories','difficulty','tags','isBestseller','isNewArrival','isActive','careWatering','careSunlight','careHumidity','careTemperature','wateringIntervalDays','fertiliserIntervalDays','pruningIntervalDays','repottingIntervalMonths']
      const patch: Record<string, unknown> = {}
      for (const k of allowed) if ((form as Record<string, unknown>)[k] !== undefined) patch[k] = (form as Record<string, unknown>)[k]
      await adminApi.plants.update(id, patch)
      toast.success('Plant updated!')
      router.push('/dashboard/plants')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to save') }
    finally { setSaving(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid #e8e0d0', borderRadius: 10, outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: '#6b6b64' }

  if (loading) return <div style={{ padding: 40, color: '#6b6b64' }}>Loading…</div>
  if (!plant) return <div style={{ padding: 40, color: '#6b6b64' }}>Plant not found</div>

  return (
    <div style={{ padding: 40, maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a18', margin: 0 }}>Edit: {plant.name}</h1>
          <p style={{ color: '#a8a89e', fontSize: 13, margin: '4px 0 0' }}>ID: {id}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.back()} style={{ padding: '9px 18px', borderRadius: 100, border: '1px solid #e8e0d0', background: 'white', fontSize: 13, cursor: 'pointer', color: '#6b6b64' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '9px 22px', borderRadius: 100, backgroundColor: '#3b6d11', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Image upload ──────────────────────────────────────────────── */}
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', margin: '0 0 16px' }}>📷 Product Image</p>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {/* Thumbnail preview */}
            <div style={{ flexShrink: 0 }}>
              {form.thumbnailUrl ? (
                <img src={form.thumbnailUrl} alt="thumbnail"
                  style={{ width: 120, height: 120, borderRadius: 14, objectFit: 'cover', border: '1px solid #e8e0d0', display: 'block' }} />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: 14, backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🌿</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              {/* Hidden file input */}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ padding: '9px 18px', backgroundColor: uploading ? '#a8a89e' : '#3b6d11', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
                {uploading ? '⏳ Uploading…' : '📤 Upload image'}
              </button>
              <p style={{ fontSize: 12, color: '#a8a89e', margin: '0 0 12px' }}>PNG, JPG or WEBP — up to 5 MB. Will become the thumbnail.</p>
              <label style={lbl}>Or paste image URL directly</label>
              <input style={inp} value={form.thumbnailUrl || ''}
                onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value, images: [e.target.value, ...((p.images || []).slice(1))] }))}
                placeholder="https://images.example.com/plant.jpg" />
            </div>
          </div>
          {/* Extra images list */}
          {(form.images || []).length > 1 && (
            <div style={{ marginTop: 14 }}>
              <label style={lbl}>All images ({(form.images || []).length})</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {(form.images || []).map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt={`img-${i}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: i === 0 ? '2px solid #3b6d11' : '1px solid #e8e0d0' }} />
                    {i === 0 && <div style={{ position: 'absolute', bottom: 2, left: 2, background: '#3b6d11', color: 'white', fontSize: 9, borderRadius: 4, padding: '1px 4px' }}>Main</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Basic info ───────────────────────────────────────────────── */}
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', margin: '0 0 16px' }}>📝 Basic Info</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={lbl}>Name</label><input value={form.name || ''} onChange={e => {
              const name = e.target.value
              f('name', name)
              // Auto-update slug only if it still matches the old auto-generated pattern
              const autoSlug = (form.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
              if (!form.slug || (form.slug as string) === autoSlug) {
                f('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
              }
            }} style={inp} /></div>
            <div>
              <label style={lbl}>URL slug <span style={{ fontWeight: 400, color: '#a8a89e' }}>(used in page URL)</span></label>
              <input value={(form as any).slug || ''} onChange={e => f('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} style={{ ...inp, fontFamily: 'monospace', fontSize: 13 }} placeholder="e.g. snake-plant" />
              <p style={{ fontSize: 11, color: '#a8a89e', margin: '4px 0 0' }}>⚠️ Changing the slug breaks existing links to this plant.</p>
            </div>
            <div><label style={lbl}>Scientific name</label><input value={form.scientificName || ''} onChange={e => f('scientificName', e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Price (₹)</label><input type="number" value={form.price || ''} onChange={e => f('price', Number(e.target.value))} style={inp} /></div>
            <div><label style={lbl}>Compare price (₹)</label><input type="number" value={form.comparePrice || ''} onChange={e => f('comparePrice', Number(e.target.value) || undefined)} style={inp} /></div>
            <div><label style={lbl}>Stock</label><input type="number" value={form.stock ?? ''} onChange={e => f('stock', Number(e.target.value))} style={inp} /></div>
            <div><label style={lbl}>Difficulty</label>
              <select value={form.difficulty || 'beginner'} onChange={e => f('difficulty', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Description</label>
            <textarea value={form.description || ''} onChange={e => f('description', e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Tags (comma separated)</label>
            <input value={(form.tags || []).join(', ')} onChange={e => f('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} style={inp} placeholder="indoor, low-light, pet-safe" />
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            {(['isBestseller', 'isNewArrival', 'isActive'] as const).map(k => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <input type="checkbox" checked={!!form[k]} onChange={e => f(k, e.target.checked)} />
                {k === 'isBestseller' ? '⭐ Bestseller' : k === 'isNewArrival' ? '🆕 New arrival' : '✅ Active'}
              </label>
            ))}
          </div>
        </div>

        {/* ── Care info ────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', margin: '0 0 16px' }}>🌿 Care Info</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={lbl}>Watering</label><input value={form.careWatering || ''} onChange={e => f('careWatering', e.target.value)} style={inp} placeholder="Water twice a week" /></div>
            <div><label style={lbl}>Sunlight</label><input value={form.careSunlight || ''} onChange={e => f('careSunlight', e.target.value)} style={inp} placeholder="Bright indirect light" /></div>
            <div><label style={lbl}>Humidity</label><input value={form.careHumidity || ''} onChange={e => f('careHumidity', e.target.value)} style={inp} placeholder="40–60%" /></div>
            <div><label style={lbl}>Temperature</label><input value={form.careTemperature || ''} onChange={e => f('careTemperature', e.target.value)} style={inp} placeholder="18–28°C" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginTop: 14 }}>
            <div><label style={lbl}>Water (days)</label><input type="number" value={form.wateringIntervalDays || ''} onChange={e => f('wateringIntervalDays', Number(e.target.value))} style={inp} /></div>
            <div><label style={lbl}>Fertilise (days)</label><input type="number" value={form.fertiliserIntervalDays || ''} onChange={e => f('fertiliserIntervalDays', Number(e.target.value))} style={inp} /></div>
            <div><label style={lbl}>Prune (days)</label><input type="number" value={form.pruningIntervalDays || ''} onChange={e => f('pruningIntervalDays', e.target.value ? Number(e.target.value) : undefined)} style={inp} /></div>
            <div><label style={lbl}>Repot (months)</label><input type="number" value={form.repottingIntervalMonths || ''} onChange={e => f('repottingIntervalMonths', e.target.value ? Number(e.target.value) : undefined)} style={inp} /></div>
          </div>
        </div>

        {/* Bottom save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4, paddingBottom: 40 }}>
          <button onClick={() => router.back()} style={{ padding: '10px 22px', borderRadius: 100, border: '1px solid #e8e0d0', background: 'white', fontSize: 14, cursor: 'pointer', color: '#6b6b64' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '10px 28px', borderRadius: 100, backgroundColor: '#3b6d11', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : '💾 Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
