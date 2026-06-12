'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { ordersApi, type Order } from '@/lib/api'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fdf5e6', color: '#854f0b' },
  confirmed:  { bg: '#eaf3de', color: '#27500a' },
  processing: { bg: '#e6f1fb', color: '#1a4a7a' },
  shipped:    { bg: '#f0f0ff', color: '#4040a0' },
  delivered:  { bg: '#eaf3de', color: '#27500a' },
  cancelled:  { bg: '#fde8e8', color: '#8b0000' },
  refunded:   { bg: '#f5f0e8', color: '#6b6b64' },
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login?next=/orders'); return }
    ordersApi.list(page)
      .then(res => { setOrders(res.data); setTotalPages(res.pagination.totalPages) })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [user, authLoading, page, router])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return
    setCancellingId(id)
    try {
      await ordersApi.cancel(id)
      setOrders(o => o.map(x => x.id === id ? { ...x, status: 'cancelled' } : x))
      toast.success('Order cancelled')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  if (authLoading || loading) return <div style={{ paddingTop: 100, textAlign: 'center', color: '#6b6b64' }}>Loading…</div>

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 5%' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#1a1a18', marginBottom: 8 }}>My orders</h1>
        <p style={{ color: '#6b6b64', marginBottom: 32 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#1a1a18', marginBottom: 8 }}>No orders yet</h2>
            <p style={{ color: '#6b6b64', marginBottom: 24 }}>Your order history will appear here</p>
            <Link href="/shop" style={{ backgroundColor: '#3b6d11', color: 'white', padding: '12px 28px', borderRadius: 100, textDecoration: 'none', fontWeight: 500 }}>Start shopping →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => {
              const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
              return (
                <div key={order.id} style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#a8a89e', marginBottom: 4 }}>Order #{order.orderNumber.slice(-8).toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: '#6b6b64' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ ...sc, fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 500 }}>{order.status}</span>
                      {order.paymentStatus === 'paid' && <span style={{ backgroundColor: '#eaf3de', color: '#27500a', fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 500 }}>Paid</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🌿</span>
                        <div style={{ flex: 1, fontSize: 13 }}>{item.name} <span style={{ color: '#a8a89e' }}>×{item.quantity}</span></div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>₹ {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f5f0e8', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>₹ {order.total}</span>
                      <span style={{ fontSize: 12, color: '#a8a89e', marginLeft: 8 }}>· {order.paymentMethod}</span>
                      {order.trackingNumber && (
                        <div style={{ fontSize: 12, color: '#3b6d11', marginTop: 4 }}>📦 Tracking: {order.trackingNumber}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          style={{ fontSize: 12, color: '#e24b4a', background: 'none', border: '1px solid #e24b4a', borderRadius: 100, padding: '6px 14px', cursor: 'pointer' }}>
                          {cancellingId === order.id ? 'Cancelling…' : 'Cancel order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid #e8e0d0', background: page === 1 ? '#f5f0e8' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, color: '#6b6b64' }}>
              ← Prev
            </button>
            <span style={{ padding: '8px 14px', fontSize: 13, color: '#6b6b64' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid #e8e0d0', background: page === totalPages ? '#f5f0e8' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, color: '#6b6b64' }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
