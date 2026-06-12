'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { gardenApi, remindersApi, type GardenPlant, type Reminder } from '@/lib/api'
import toast from 'react-hot-toast'

export default function GardenPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [plants, setPlants] = useState<GardenPlant[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login?next=/garden'); return }
    Promise.all([gardenApi.list(), remindersApi.list('pending')])
      .then(([g, r]) => { setPlants(g.data); setReminders(r.data) })
      .catch(() => toast.error('Failed to load garden'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const handleRemove = async (id: string, name: string) => {
    if (!confirm('Remove ' + name + ' from your garden?')) return
    try {
      await gardenApi.remove(id)
      setPlants(p => p.filter(x => x.id !== id))
      setReminders(r => r.filter(x => x.gardenPlantId !== id))
      toast.success(name + ' removed')
    } catch { toast.error('Failed to remove') }
  }

  const handleMarkDone = async (id: string) => {
    try {
      await remindersApi.markDone(id)
      setReminders(r => r.map(x => x.id === id ? { ...x, status: 'done' as const } : x))
      toast.success('Done!')
    } catch { toast.error('Failed') }
  }

  const today = reminders.filter(r => {
    const d = new Date(r.dueAt)
    const eod = new Date(); eod.setHours(23, 59, 59, 999)
    return r.status === 'pending' && d <= eod
  })

  const upcoming = reminders.filter(r => {
    const d = new Date(r.dueAt)
    const eod = new Date(); eod.setHours(23, 59, 59, 999)
    return r.status === 'pending' && d > eod
  })

  if (authLoading || loading) return <div style={{ paddingTop: 100, textAlign: 'center', color: '#6b6b64' }}>Loading...</div>

  const typeIcon = (t: string) => t === 'watering' ? '💧' : t === 'fertilising' ? '🧪' : t === 'pruning' ? '✂️' : '🪴'

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: '#1a1a18' }}>My garden</h1>
          <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#3b6d11', color: 'white', padding: '10px 18px', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            <Plus size={14} /> Add plant
          </Link>
        </div>
        <p style={{ color: '#6b6b64', marginBottom: 36 }}>
          {plants.length > 0 ? plants.length + ' plant' + (plants.length > 1 ? 's' : '') + ' in your collection' : 'Start your collection'}
        </p>

        {today.length > 0 && (
          <div style={{ backgroundColor: '#eaf3de', border: '1px solid #c0dd97', borderRadius: 20, padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontWeight: 600, color: '#1a1a18', marginBottom: 16, fontSize: 15 }}>🔔 {today.length} task{today.length > 1 ? 's' : ''} due today</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {today.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'white', borderRadius: 14, padding: 14, border: '1px solid #c0dd97' }}>
                  <span style={{ fontSize: 24 }}>{typeIcon(r.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: '#1a1a18' }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: '#6b6b64', marginTop: 2 }}>{r.gardenPlant?.plant?.name}</div>
                  </div>
                  <button onClick={() => handleMarkDone(r.id)}
                    style={{ fontSize: 12, backgroundColor: '#eaf3de', border: '1px solid #c0dd97', color: '#27500a', padding: '6px 14px', borderRadius: 100, cursor: 'pointer', fontWeight: 500 }}>
                    Done ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {plants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontSize: 22, fontWeight: 500, color: '#1a1a18', marginBottom: 8 }}>Your garden is empty</h2>
            <p style={{ color: '#6b6b64', maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Open any plant page and click "Add to garden". Watering and fertilising reminders are created automatically.
            </p>
            <Link href="/shop" style={{ backgroundColor: '#3b6d11', color: 'white', padding: '13px 28px', borderRadius: 100, textDecoration: 'none', fontWeight: 500 }}>
              Browse plants →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {plants.map(gp => (
              <div key={gp.id} style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 56, height: 56, backgroundColor: '#f0f8e8', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🌿</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 500, color: '#1a1a18', marginBottom: 2 }}>
                    {gp.nickname || gp.plant.name}
                    {gp.nickname && <span style={{ fontSize: 13, color: '#a8a89e', fontStyle: 'italic', marginLeft: 6 }}>{gp.plant.name}</span>}
                  </h3>
                  <p style={{ fontSize: 12, color: '#a8a89e', fontStyle: 'italic', marginBottom: 8 }}>{gp.plant.scientificName}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, backgroundColor: '#eaf3de', color: '#27500a', padding: '4px 10px', borderRadius: 100 }}>💧 Every {gp.plant.wateringIntervalDays}d</span>
                    <span style={{ fontSize: 12, backgroundColor: '#eaf3de', color: '#27500a', padding: '4px 10px', borderRadius: 100 }}>🧪 Every {gp.plant.fertiliserIntervalDays}d</span>
                    <span style={{ fontSize: 12, backgroundColor: '#f5f0e8', color: '#6b6b64', padding: '4px 10px', borderRadius: 100 }}>Added {new Date(gp.acquiredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#eaf3de', border: '2px solid #c0dd97', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#3b6d11' }}>{gp.healthScore}%</span>
                  </div>
                  <p style={{ fontSize: 10, color: '#a8a89e', marginTop: 4 }}>Health</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <Link href={'/plants/' + gp.plant.slug}
                    style={{ fontSize: 12, backgroundColor: '#f5f0e8', border: '1px solid #e8e0d0', padding: '7px 12px', borderRadius: 8, textDecoration: 'none', color: '#6b6b64', textAlign: 'center' }}>
                    View guide
                  </Link>
                  <button onClick={() => handleRemove(gp.id, gp.plant.name)}
                    style={{ fontSize: 12, color: '#e24b4a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', padding: '4px 0' }}>
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontWeight: 500, color: '#1a1a18', marginBottom: 16 }}>📅 Upcoming reminders</h2>
            <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
              {upcoming.slice(0, 6).map((r, i) => {
                const days = Math.ceil((new Date(r.dueAt).getTime() - Date.now()) / 86400000)
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderBottom: i < upcoming.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                    <span style={{ fontSize: 20 }}>{typeIcon(r.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: '#6b6b64' }}>{r.gardenPlant?.plant?.name}</div>
                    </div>
                    <div style={{ fontSize: 12, backgroundColor: '#f5f0e8', color: '#6b6b64', padding: '4px 10px', borderRadius: 100 }}>
                      {days === 1 ? 'Tomorrow' : 'In ' + days + 'd'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
