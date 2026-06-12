'use client'
import { useEffect, useState } from 'react'
import { partnerApi, type PartnerOrderItem, type Pagination } from '../../../lib/api'

export default function Orders() {
  const [orders, setOrders] = useState<PartnerOrderItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    partnerApi.orders(page)
      .then(res => { setOrders(res.data); setPagination(res.pagination) })
      .finally(() => setLoading(false))
  }, [page])

  const totalEarning = orders.reduce((s, o) => s + o.partnerEarning, 0)

  return (
    <div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#1a1a18', margin: '0 0 4px' }}>Orders</h2>
      <p style={{ color: '#6b6b64', margin: '0 0 24px', fontSize: 14 }}>All orders for your products</p>

      {orders.length > 0 && (
        <div style={{ backgroundColor: '#eaf3de', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid #c8e6a0', display: 'flex', gap: 32 }}>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#27500a' }}>₹{totalEarning.toFixed(0)}</div><div style={{ fontSize: 12, color: '#3b6d11' }}>Your earnings (this page)</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#27500a' }}>{pagination?.total}</div><div style={{ fontSize: 12, color: '#3b6d11' }}>Total order items</div></div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a89e' }}>Loading orders…</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#6b6b64' }}>No orders yet. List products to start selling.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ backgroundColor: '#f5f0e8' }}>
              <tr>
                {['Order #', 'Product', 'Customer', 'Location', 'Qty', 'Sale price', 'Your earning', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b6b64', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((item, i) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f5f0e8', backgroundColor: i % 2 === 0 ? 'white' : '#faf9f7' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#3b6d11' }}>#{item.order?.orderNumber?.slice(-6)}</td>
                  <td style={{ padding: '14px 16px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</td>
                  <td style={{ padding: '14px 16px' }}>{item.order?.user?.name}</td>
                  <td style={{ padding: '14px 16px', color: '#a8a89e' }}>{item.order?.address?.city}, {item.order?.address?.state}</td>
                  <td style={{ padding: '14px 16px' }}>×{item.quantity}</td>
                  <td style={{ padding: '14px 16px' }}>₹{(item.price * item.quantity).toFixed(0)}</td>
                  <td style={{ padding: '14px 16px', color: '#27500a', fontWeight: 700 }}>₹{item.partnerEarning?.toFixed(0)}</td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={item.order?.status} /></td>
                  <td style={{ padding: '14px 16px', color: '#a8a89e', whiteSpace: 'nowrap' }}>{new Date(item.order?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: '1px solid #e8e0d0' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e8e0d0', backgroundColor: 'white', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              <span style={{ padding: '6px 14px', color: '#6b6b64', fontSize: 13 }}>Page {page} of {pagination.totalPages}</span>
              <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e8e0d0', backgroundColor: 'white', cursor: page === pagination.totalPages ? 'default' : 'pointer', opacity: page === pagination.totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pending: ['#fdf5e6', '#854f0b'], confirmed: ['#eaf3de', '#27500a'],
    processing: ['#eaf3de', '#27500a'], shipped: ['#e8f0fe', '#1a56db'],
    delivered: ['#eaf3de', '#27500a'], cancelled: ['#fde8e8', '#8b0000'],
  }
  const [bg, color] = map[status] || ['#f5f0e8', '#6b6b64']
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 100, backgroundColor: bg, color }}>{status}</span>
}
