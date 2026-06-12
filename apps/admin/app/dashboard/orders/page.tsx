'use client'
import { useEffect, useState } from 'react'
import { adminApi, type Order } from '@/lib/api'
import toast from 'react-hot-toast'

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fdf5e6', color: '#854f0b' },
  confirmed:  { bg: '#eaf3de', color: '#27500a' },
  processing: { bg: '#e6f1fb', color: '#1a4a7a' },
  shipped:    { bg: '#f0f0ff', color: '#4040a0' },
  delivered:  { bg: '#eaf3de', color: '#3b6d11' },
  cancelled:  { bg: '#fde8e8', color: '#8b0000' },
  refunded:   { bg: '#f5f0e8', color: '#6b6b64' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [tracking, setTracking] = useState<Record<string, string>>({})

  useEffect(() => {
    adminApi.orders.list().then(r => setOrders(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res = await adminApi.orders.updateStatus(id, status, tracking[id])
      setOrders(o => o.map(x => x.id === id ? { ...x, status: res.data.status, trackingNumber: res.data.trackingNumber } : x))
      toast.success('Status updated')
    } catch { toast.error('Failed') }
    finally { setUpdating(null) }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 2 }}>Orders</h1>
        <p style={{ color: '#6b6b64', fontSize: 13 }}>{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', backgroundColor: filter === s ? '#3b6d11' : 'white', color: filter === s ? 'white' : '#6b6b64', border: filter === s ? '1px solid #3b6d11' : '1px solid #e8e0d0' }}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={{ color: '#6b6b64' }}>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 && <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 40, textAlign: 'center', color: '#6b6b64', border: '1px solid #e8e0d0' }}>No orders</div>}
          {filtered.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
            return (
              <div key={order.id} style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a18', marginBottom: 2 }}>#{order.orderNumber.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: '#6b6b64' }}>{order.user?.name} · {order.user?.email}</div>
                    <div style={{ fontSize: 12, color: '#a8a89e', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#3b6d11', marginBottom: 4 }}>₹ {order.total}</div>
                    <span style={{ ...sc, fontSize: 12, padding: '3px 10px', borderRadius: 100, fontWeight: 500 }}>{order.status}</span>
                    {order.paymentStatus === 'paid' && <span style={{ marginLeft: 6, fontSize: 12, backgroundColor: '#eaf3de', color: '#27500a', padding: '3px 10px', borderRadius: 100, fontWeight: 500 }}>Paid</span>}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: '#6b6b64', marginBottom: 12 }}>
                  {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </div>

                {order.address && (
                  <div style={{ fontSize: 12, color: '#a8a89e', marginBottom: 14 }}>
                    📍 {order.address.line1}, {order.address.city}, {order.address.state} – {order.address.pincode}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={order.status}
                    onChange={e => handleStatusUpdate(order.id, e.target.value)}
                    disabled={updating === order.id}
                    style={{ padding: '7px 12px', fontSize: 13, border: '1px solid #e8e0d0', borderRadius: 8, cursor: 'pointer', outline: 'none' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <input
                    placeholder="Tracking number"
                    value={tracking[order.id] || order.trackingNumber || ''}
                    onChange={e => setTracking(t => ({ ...t, [order.id]: e.target.value }))}
                    style={{ padding: '7px 12px', fontSize: 13, border: '1px solid #e8e0d0', borderRadius: 8, outline: 'none', width: 180 }}
                  />
                  <button onClick={() => handleStatusUpdate(order.id, order.status)} disabled={updating === order.id}
                    style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, backgroundColor: '#eaf3de', color: '#27500a', border: '1px solid #c0dd97', borderRadius: 8, cursor: 'pointer' }}>
                    {updating === order.id ? 'Updating…' : 'Update'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
