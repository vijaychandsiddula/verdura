'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['indoor','outdoor','succulent','tropical','herb','flowering','fern','air_purifying','bonsai']

export default function NewPlantPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', scientificName: '', slug: '', description: '', price: '', comparePrice: '', stock: '0',
    thumbnailUrl: '', images: [] as string[],
    categories: [] as string[], difficulty: 'beginner', tags: '',
    isBestseller: false, isNewArrival: false,
    careWatering: '', careSunlight: '', careHumidity: '', careTemperature: '',
    wateringIntervalDays: '7', fertiliserIntervalDays: '14', pruningIntervalDays: '', repottingIntervalMonths: '',
    careGuide: [{ title: '', icon: '💧', body: '' }],
  })

  const f = (field: string, val: unknown) => setForm(p => ({ ...p, [field]: val }))

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const res = await adminApi.upload(file)
      f('thumbnailUrl', res.data.url)
      f('images', [res.data.url])
      toast.success('Image uploaded')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const toggleCat = (c: string) => f('categories', form.categories.includes(c) ? form.categories.filter(x => x !== c) : [...form.categories, c])

  const addGuideSection = () => f('careGuide', [...form.careGuide, { title: '', icon: '🌿', body: '' }])
  const updateGuide = (i: number, field: string, val: string) => f('careGuide', form.careGuide.map((g, idx) => idx === i ? { ...g, [field]: val } : g))
  const removeGuide = (i: number) => f('careGuide', form.careGuide.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.price || form.categories.length === 0) {
      toast.error('Fill in required fields (name, slug, price, category)'); return
    }
    setSaving(true)
    try {
      await adminApi.plants.create({
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        wateringIntervalDays: Number(form.wateringIntervalDays),
        fertiliserIntervalDays: Number(form.fertiliserIntervalDays),
        pruningIntervalDays: form.pruningIntervalDays ? Number(form.pruningIntervalDays) : undefined,
        repottingIntervalMonths: form.repottingIntervalMonths ? Number(form.repottingIntervalMonths) : undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        careGuide: form.careGuide.filter(g => g.title).map((g, i) => ({ ...g, order: i + 1 })),
      })
      toast.success('Plant created!')
      router.push('/dashboard/plants')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid #e8e0d0', borderRadius: 10, outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }
  const sec = (title: string) => <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18', marginBottom: 14, marginTop: 28, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>{title}</h3>

  return (
    <div style={{ padding: 40, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a18', marginBottom: 2 }}>Add new plant</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.back()} style={{ padding: '9px 18px', borderRadius: 100, border: '1px solid #e8e0d0', background: 'white', fontSize: 13, cursor: 'pointer', color: '#6b6b64' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '9px 22px', borderRadius: 100, backgroundColor: '#3b6d11', color: 'white', border: 'none', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save plant'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 28 }}>
        {/* Basic info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Name *</label><input value={form.name} onChange={e => { f('name', e.target.value); f('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Scientific name</label><input value={form.scientificName} onChange={e => f('scientificName', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Slug * (URL-safe)</label><input value={form.slug} onChange={e => f('slug', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Difficulty</label>
            <select value={form.difficulty} onChange={e => f('difficulty', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option>
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Price (₹) *</label><input type="number" value={form.price} onChange={e => f('price', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Compare price (₹)</label><input type="number" value={form.comparePrice} onChange={e => f('comparePrice', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Stock</label><input type="number" value={form.stock} onChange={e => f('stock', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Tags (comma-separated)</label><input value={form.tags} onChange={e => f('tags', e.target.value)} placeholder="low-maintenance, air-purifier" style={inp} /></div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Description</label>
          <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3}
            style={{ ...inp, resize: 'vertical' as const }} />
        </div>

        {/* Categories */}
        {sec('Categories *')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => toggleCat(c)} type="button"
              style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', backgroundColor: form.categories.includes(c) ? '#3b6d11' : 'white', color: form.categories.includes(c) ? 'white' : '#6b6b64', border: form.categories.includes(c) ? '1px solid #3b6d11' : '1px solid #e8e0d0' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Flags */}
        {sec('Flags')}
        <div style={{ display: 'flex', gap: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.isBestseller} onChange={e => f('isBestseller', e.target.checked)} /> Bestseller
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.isNewArrival} onChange={e => f('isNewArrival', e.target.checked)} /> New arrival
          </label>
        </div>

        {/* Image */}
        {sec('Thumbnail image')}
        <input type="file" accept="image/*" onChange={uploadImage} style={{ marginBottom: 10 }} />
        {uploading && <span style={{ fontSize: 13, color: '#6b6b64' }}>Uploading…</span>}
        {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, display: 'block', marginTop: 8 }} />}

        {/* Care info */}
        {sec('Care details')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Watering schedule</label><input value={form.careWatering} onChange={e => f('careWatering', e.target.value)} placeholder="Every 7 days" style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Sunlight</label><input value={form.careSunlight} onChange={e => f('careSunlight', e.target.value)} placeholder="Bright indirect" style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Humidity</label><input value={form.careHumidity} onChange={e => f('careHumidity', e.target.value)} placeholder="40–60%" style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Temperature</label><input value={form.careTemperature} onChange={e => f('careTemperature', e.target.value)} placeholder="18–30°C" style={inp} /></div>
        </div>

        {/* Reminder intervals */}
        {sec('Reminder intervals')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Water (days) *</label><input type="number" value={form.wateringIntervalDays} onChange={e => f('wateringIntervalDays', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Fertilise (days) *</label><input type="number" value={form.fertiliserIntervalDays} onChange={e => f('fertiliserIntervalDays', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Prune (days)</label><input type="number" value={form.pruningIntervalDays} onChange={e => f('pruningIntervalDays', e.target.value)} style={inp} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Repot (months)</label><input type="number" value={form.repottingIntervalMonths} onChange={e => f('repottingIntervalMonths', e.target.value)} style={inp} /></div>
        </div>

        {/* Care guide */}
        {sec('Care guide sections')}
        {form.careGuide.map((g, i) => (
          <div key={i} style={{ backgroundColor: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 10, border: '1px solid #e8e0d0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Icon</label><input value={g.icon} onChange={e => updateGuide(i, 'icon', e.target.value)} style={{ ...inp, textAlign: 'center', fontSize: 20, padding: '6px' }} /></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Section title</label><input value={g.title} onChange={e => updateGuide(i, 'title', e.target.value)} placeholder="Watering" style={inp} /></div>
              <button onClick={() => removeGuide(i)} style={{ marginBottom: 0, padding: '9px 12px', fontSize: 12, color: '#e24b4a', background: 'none', border: '1px solid #e24b4a', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-end' }}>✕</button>
            </div>
            <textarea value={g.body} onChange={e => updateGuide(i, 'body', e.target.value)} rows={3} placeholder="Detailed care instructions…"
              style={{ ...inp, resize: 'vertical' as const }} />
          </div>
        ))}
        <button onClick={addGuideSection} style={{ fontSize: 13, color: '#3b6d11', background: 'none', border: '1px dashed #c0dd97', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
          + Add section
        </button>
      </div>
    </div>
  )
}
