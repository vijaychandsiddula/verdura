'use client'
import { useEffect, useState } from 'react'
import { partnerApi } from '../../../lib/api'

type Tab = 'plants' | 'seeds' | 'supplies'

export default function Listings() {
  const [tab, setTab] = useState<Tab>('plants')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const api = partnerApi[tab]
      const res = await api.list()
      setItems(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { setShowForm(false); load() }, [tab])

  const toggleActive = async (item: any) => {
    await partnerApi[tab].update(item.id, { isActive: !item.isActive, stock: item.isActive ? 0 : item.stock || 10 })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Deactivate this listing?')) return
    await partnerApi[tab].remove(id)
    load()
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
    backgroundColor: active ? '#3b6d11' : 'white', color: active ? 'white' : '#6b6b64',
    outline: active ? 'none' : '1px solid #e8e0d0',
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#1a1a18', margin: 0 }}>My Listings</h2>
          <p style={{ color: '#6b6b64', margin: '4px 0 0', fontSize: 14 }}>Manage your products on Verdura</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', backgroundColor: '#3b6d11', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          + Add listing
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['plants', 'seeds', 'supplies'] as Tab[]).map(t => (
          <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
            {t === 'plants' ? '🌿 Plants' : t === 'seeds' ? '🌱 Seeds' : '🪴 Supplies'}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && <AddForm tab={tab} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}

      {/* Items */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a89e' }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#6b6b64', fontSize: 16 }}>No {tab} listed yet</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: 12, padding: '10px 20px', backgroundColor: '#3b6d11', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
            Add your first listing
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} style={{ backgroundColor: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #e8e0d0', display: 'flex', alignItems: 'center', gap: 16, opacity: item.isActive ? 1 : 0.6 }}>
              <img src={item.thumbnailUrl} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', backgroundColor: '#f5f0e8' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#1a1a18', fontSize: 15 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#a8a89e', marginTop: 2 }}>{item.scientificName || item.category}</div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 8 }}>
                <div style={{ fontWeight: 700, color: '#3b6d11', fontSize: 16 }}>₹{item.price}</div>
                <div style={{ fontSize: 12, color: '#a8a89e' }}>Stock: {item.stock}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, backgroundColor: item.isActive ? '#eaf3de' : '#f5f0e8', color: item.isActive ? '#27500a' : '#a8a89e' }}>
                {item.isActive ? 'Live' : 'Inactive'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleActive(item)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e8e0d0', backgroundColor: 'white', fontSize: 12, cursor: 'pointer', color: '#1a1a18' }}>
                  {item.isActive ? 'Pause' : 'Activate'}
                </button>
                <button onClick={() => remove(item.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #fde8e8', backgroundColor: '#fde8e8', fontSize: 12, cursor: 'pointer', color: '#8b0000' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddForm({ tab, onSave, onCancel }: { tab: Tab; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<Record<string, any>>({ price: '', stock: '', name: '', scientificName: '', slug: '', description: '', thumbnailUrl: '', categories: [], category: 'pots', difficulty: 'beginner', tags: '', germinationDays: '', sowingDepth: '', sowingMethod: '', seedsPerPacket: 20, sowingSeason: '', careWatering: '', careSunlight: '', careHumidity: '', careTemperature: '', wateringIntervalDays: 7, fertiliserIntervalDays: 30 })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const data: any = { ...form, price: Number(form.price), stock: Number(form.stock), images: [form.thumbnailUrl], tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [] }
      if (tab === 'plants') {
        data.categories = form.categories
        data.wateringIntervalDays = Number(form.wateringIntervalDays)
        data.fertiliserIntervalDays = Number(form.fertiliserIntervalDays)
      } else if (tab === 'seeds') {
        data.categories = form.categories
        data.seedsPerPacket = Number(form.seedsPerPacket)
      }
      await partnerApi[tab].create(data)
      onSave()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  const CATS = ['indoor','outdoor','vegetable','herb','flowering','fruit','succulent','tropical','air_purifying','bonsai']
  const toggleCat = (c: string) => setForm(f => ({ ...f, categories: f.categories.includes(c) ? f.categories.filter((x: string) => x !== c) : [...f.categories, c] }))

  const fi: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: 14, border: '1.5px solid #e8e0d0', borderRadius: 8, outline: 'none', color: '#1a1a18', backgroundColor: '#faf9f7' }
  const lb: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b64', marginBottom: 4 }

  return (
    <div style={{ backgroundColor: '#eaf3de', borderRadius: 16, padding: '24px', marginBottom: 20, border: '1.5px solid #c8e6a0' }}>
      <h3 style={{ margin: '0 0 20px', color: '#1a1a18', fontSize: 16 }}>Add {tab.slice(0, -1)} listing</h3>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div><label style={lb}>Name *</label><input style={fi} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Cherry Tomato Plant" /></div>
          <div><label style={lb}>Slug * (URL-safe)</label><input style={fi} value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s/g, '-'))} required placeholder="cherry-tomato-plant" /></div>
          {(tab === 'plants' || tab === 'seeds') && <div><label style={lb}>Scientific Name</label><input style={fi} value={form.scientificName} onChange={e => set('scientificName', e.target.value)} placeholder="Solanum lycopersicum" /></div>}
          <div><label style={lb}>Price (₹) *</label><input style={fi} type="number" value={form.price} onChange={e => set('price', e.target.value)} required min={1} /></div>
          <div><label style={lb}>Stock *</label><input style={fi} type="number" value={form.stock} onChange={e => set('stock', e.target.value)} required min={0} /></div>
          <div><label style={lb}>Thumbnail URL *</label><input style={fi} value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} required placeholder="https://..." /></div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lb}>Description *</label>
          <textarea style={{ ...fi, resize: 'vertical', fontFamily: 'inherit' }} rows={3} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Describe your product in at least 20 characters…" />
        </div>

        {tab === 'supplies' && (
          <div style={{ marginBottom: 12 }}>
            <label style={lb}>Category</label>
            <select style={fi} value={form.category} onChange={e => set('category', e.target.value)}>
              {['pots','soil','fertiliser','tools','accessories'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {(tab === 'plants' || tab === 'seeds') && (
          <div style={{ marginBottom: 12 }}>
            <label style={lb}>Categories *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATS.map(c => (
                <button key={c} type="button" onClick={() => toggleCat(c)}
                  style={{ padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, backgroundColor: form.categories.includes(c) ? '#3b6d11' : 'white', color: form.categories.includes(c) ? 'white' : '#6b6b64', outline: form.categories.includes(c) ? 'none' : '1px solid #e8e0d0' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'plants' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lb}>Watering care *</label><input style={fi} value={form.careWatering} onChange={e => set('careWatering', e.target.value)} required placeholder="Water every 3 days…" /></div>
            <div><label style={lb}>Sunlight care *</label><input style={fi} value={form.careSunlight} onChange={e => set('careSunlight', e.target.value)} required placeholder="Bright indirect light…" /></div>
            <div><label style={lb}>Humidity care *</label><input style={fi} value={form.careHumidity} onChange={e => set('careHumidity', e.target.value)} required placeholder="Moderate humidity…" /></div>
            <div><label style={lb}>Temperature care *</label><input style={fi} value={form.careTemperature} onChange={e => set('careTemperature', e.target.value)} required placeholder="18–30°C…" /></div>
            <div><label style={lb}>Watering interval (days)</label><input style={fi} type="number" value={form.wateringIntervalDays} onChange={e => set('wateringIntervalDays', e.target.value)} /></div>
            <div><label style={lb}>Fertiliser interval (days)</label><input style={fi} type="number" value={form.fertiliserIntervalDays} onChange={e => set('fertiliserIntervalDays', e.target.value)} /></div>
          </div>
        )}

        {tab === 'seeds' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lb}>Germination days *</label><input style={fi} value={form.germinationDays} onChange={e => set('germinationDays', e.target.value)} required placeholder="5–10 days" /></div>
            <div><label style={lb}>Sowing depth *</label><input style={fi} value={form.sowingDepth} onChange={e => set('sowingDepth', e.target.value)} required placeholder="1 cm deep" /></div>
            <div><label style={lb}>Sowing method *</label><input style={fi} value={form.sowingMethod} onChange={e => set('sowingMethod', e.target.value)} required placeholder="Direct sow / transplant" /></div>
            <div><label style={lb}>Sowing season *</label><input style={fi} value={form.sowingSeason} onChange={e => set('sowingSeason', e.target.value)} required placeholder="Oct–Jan" /></div>
            <div><label style={lb}>Seeds per packet</label><input style={fi} type="number" value={form.seedsPerPacket} onChange={e => set('seedsPerPacket', e.target.value)} /></div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={lb}>Tags (comma separated)</label>
          <input style={fi} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="indoor, beginner, air-purifying" />
        </div>

        {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12, backgroundColor: '#fde8e8', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', backgroundColor: '#3b6d11', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Saving…' : 'Save listing'}
          </button>
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: 'white', color: '#6b6b64', border: '1px solid #e8e0d0', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
