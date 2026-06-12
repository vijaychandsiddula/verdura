'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/store/cart'
import { useAuth } from '@/lib/auth'
import { addressesApi, ordersApi, type Address } from '@/lib/api'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void }
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry']

type Step = 'address' | 'payment' | 'success'

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { items, total, clear } = useCart()
  const [step, setStep] = useState<Step>('address')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddr, setSelectedAddr] = useState<string>('')
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [payMethod, setPayMethod] = useState<'razorpay' | 'cod'>('razorpay')
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState('')

  // New address form
  const [form, setForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '' })

  const sub = total()
  const ship = sub >= 499 ? 0 : 49
  const totalAmt = sub + ship

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login?next=/checkout'); return }
    if (items.length === 0) { router.replace('/shop'); return }
    addressesApi.list().then(res => {
      setAddresses(res.data)
      const def = res.data.find(a => a.isDefault)
      if (def) setSelectedAddr(def.id)
      else if (res.data.length > 0) setSelectedAddr(res.data[0].id)
      else setShowNewAddr(true)
    }).catch(() => {})
  }, [user, authLoading, items.length, router])

  const saveAddress = async () => {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) {
      toast.error('Fill in all required fields'); return
    }
    try {
      const res = await addressesApi.create(form)
      setAddresses(a => [...a, res.data])
      setSelectedAddr(res.data.id)
      setShowNewAddr(false)
      toast.success('Address saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save address')
    }
  }

  const placeOrder = async () => {
    if (!selectedAddr) { toast.error('Select a delivery address'); return }
    setPlacing(true)
    try {
      const res = await ordersApi.create(selectedAddr, payMethod)
      const { order, razorpayOrderId } = res.data

      if (payMethod === 'cod') {
        clear()
        setOrderId(order.id)
        setStep('success')
        return
      }

      // Razorpay online payment
      const ok = await loadRazorpay()
      if (!ok) { toast.error('Could not load payment gateway'); return }

      const addr = addresses.find(a => a.id === selectedAddr)!
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: totalAmt * 100,
        currency: 'INR',
        name: 'Verdura',
        description: 'Plants & Supplies',
        order_id: razorpayOrderId,
        prefill: { name: user!.name, email: user!.email, contact: user!.phone || addr.phone },
        theme: { color: '#3b6d11' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await ordersApi.verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            clear()
            setOrderId(order.id)
            setStep('success')
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      })
      rzp.open()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order')
      setPlacing(false)
    }
  }

  if (authLoading) return null

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14, border: '1.5px solid #e8e0d0',
    borderRadius: 10, backgroundColor: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  if (step === 'success') return (
    <div style={{ paddingTop: 80, minHeight: '100vh', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 5%' }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#1a1a18', marginBottom: 12 }}>Order placed!</h1>
        <p style={{ color: '#6b6b64', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Your plants are being carefully packed and will be on their way soon.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/orders" style={{ backgroundColor: '#3b6d11', color: 'white', padding: '12px 24px', borderRadius: 100, textDecoration: 'none', fontWeight: 500 }}>View orders</Link>
          <Link href="/shop" style={{ backgroundColor: 'white', color: '#6b6b64', padding: '12px 24px', borderRadius: 100, textDecoration: 'none', border: '1px solid #e8e0d0' }}>Continue shopping</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 5%' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#1a1a18', marginBottom: 32 }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Left: address + payment */}
          <div>
            {/* Delivery address */}
            <div style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a18', marginBottom: 20 }}>Delivery address</h2>
              {addresses.map(a => (
                <label key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f5f0e8', cursor: 'pointer' }}>
                  <input type="radio" name="addr" value={a.id} checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{a.name} · {a.phone}</div>
                    <div style={{ fontSize: 13, color: '#6b6b64', marginTop: 2 }}>{a.line1}{a.line2 ? ', ' + a.line2 : ''}, {a.city}, {a.state} – {a.pincode}</div>
                    {a.isDefault && <span style={{ fontSize: 11, color: '#3b6d11', fontWeight: 500 }}>Default</span>}
                  </div>
                </label>
              ))}
              <button onClick={() => setShowNewAddr(!showNewAddr)} style={{ marginTop: 14, fontSize: 13, color: '#3b6d11', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showNewAddr ? '− Cancel' : '+ Add new address'}
              </button>
              {showNewAddr && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Full name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} /></div>
                    <div><label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Phone *</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inp} /></div>
                  </div>
                  <div><label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Address line 1 *</label><input value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} placeholder="House/flat, street" style={inp} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Address line 2</label><input value={form.line2} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} placeholder="Landmark (optional)" style={inp} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div><label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>City *</label><input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inp} /></div>
                    <div><label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>State *</label>
                      <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Pincode *</label><input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} maxLength={6} style={inp} /></div>
                  </div>
                  <button onClick={saveAddress} style={{ alignSelf: 'flex-start', backgroundColor: '#3b6d11', color: 'white', padding: '9px 20px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save address</button>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a18', marginBottom: 20 }}>Payment method</h2>
              <label style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f0e8', cursor: 'pointer' }}>
                <input type="radio" name="pay" value="razorpay" checked={payMethod === 'razorpay'} onChange={() => setPayMethod('razorpay')} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>Pay online</div>
                  <div style={{ fontSize: 12, color: '#6b6b64' }}>UPI, Cards, Net Banking via Razorpay</div>
                </div>
              </label>
              <label style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', cursor: 'pointer' }}>
                <input type="radio" name="pay" value="cod" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>Cash on delivery</div>
                  <div style={{ fontSize: 12, color: '#6b6b64' }}>Pay when your order arrives</div>
                </div>
              </label>
            </div>
          </div>

          {/* Right: order summary */}
          <div style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: 24, position: 'sticky', top: 80 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a18', marginBottom: 16 }}>Order summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {items.map(i => (
                <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{i.emoji}</span>
                  <div style={{ flex: 1, fontSize: 13 }}>{i.name} <span style={{ color: '#a8a89e' }}>×{i.qty}</span></div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>₹ {i.price * i.qty}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f5f0e8', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}><span style={{ color: '#6b6b64' }}>Subtotal</span><span>₹ {sub}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}><span style={{ color: '#6b6b64' }}>Shipping</span><span style={{ color: ship === 0 ? '#3b6d11' : undefined }}>{ship === 0 ? 'FREE 🎉' : '₹ ' + ship}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 18, marginBottom: 20 }}><span>Total</span><span style={{ color: '#3b6d11' }}>₹ {totalAmt}</span></div>
              <button onClick={placeOrder} disabled={placing || !selectedAddr}
                style={{ width: '100%', backgroundColor: '#3b6d11', color: 'white', padding: '14px', borderRadius: 100, border: 'none', fontSize: 15, fontWeight: 500, cursor: placing ? 'not-allowed' : 'pointer', opacity: placing ? 0.7 : 1 }}>
                {placing ? 'Processing…' : payMethod === 'cod' ? 'Place order' : 'Pay ₹ ' + totalAmt}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#a8a89e', marginTop: 10 }}>
                {payMethod === 'razorpay' ? 'Secured by Razorpay · UPI, Cards, Net Banking' : 'Pay cash when your order arrives'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
