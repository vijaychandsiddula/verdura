'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/store/cart'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => { setMounted(true) }, [])

  const items = useCart(s => s.items)
  const count = useCart(s => s.count())
  const { remove, setQty, total } = useCart()
  const sub = total()
  const ship = sub >= 499 ? 0 : 49

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.push('/')
  }

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e0d0', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>🌿</div>
          <span style={{ fontSize: 18, fontWeight: 500, color: '#1a1a18' }}>Verdura</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/shop" style={{ fontSize: 14, color: '#6b6b64', textDecoration: 'none' }}>Shop</Link>
          <Link href="/guides" style={{ fontSize: 14, color: '#6b6b64', textDecoration: 'none' }}>Care guides</Link>
          <Link href={user ? '/garden' : '/login?next=/garden'} style={{ fontSize: 14, color: '#6b6b64', textDecoration: 'none' }}>
            🌱 My garden
          </Link>
          {user && (
            <Link href="/orders" style={{ fontSize: 14, color: '#6b6b64', textDecoration: 'none' }}>Orders</Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {mounted && !user && (
            <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: '#3b6d11', textDecoration: 'none', padding: '7px 16px', border: '1.5px solid #3b6d11', borderRadius: 100 }}>
              Sign in
            </Link>
          )}
          {mounted && user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
              >
                <div style={{ width: 32, height: 32, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: '#1a1a18', fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', backgroundColor: 'white', border: '1px solid #e8e0d0', borderRadius: 12, padding: '8px 0', minWidth: 160, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 200 }}>
                  <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid #f5f0e8' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: '#a8a89e', marginTop: 2 }}>{user.email}</div>
                  </div>
                  {user.role === 'admin' && (
                    <a href="http://localhost:3001/dashboard" target="_blank" rel="noreferrer" style={{ display: 'block', padding: '9px 16px', fontSize: 13, color: '#3b6d11', textDecoration: 'none', fontWeight: 500 }}>
                      Admin dashboard →
                    </a>
                  )}
                  <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, color: '#e24b4a', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setCartOpen(true)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 8 }}>
            🛒
            {mounted && count > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#639922', color: 'white', fontSize: 10, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{count}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Click-away backdrop for user menu */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />}

      {/* Cart slide-in */}
      {cartOpen && <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100 }} />}

      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, backgroundColor: 'white', zIndex: 101, transform: cartOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8e0d0' }}>
          <span style={{ fontSize: 18, fontWeight: 500 }}>Cart {mounted && count > 0 ? `(${count})` : ''}</span>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b6b64' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {!mounted || items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <p style={{ color: '#6b6b64', fontSize: 14 }}>Your cart is empty</p>
              <Link href="/shop" onClick={() => setCartOpen(false)} style={{ display: 'inline-block', marginTop: 16, color: '#3b6d11', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Browse plants →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#f5f0e8', borderRadius: 12, padding: 12 }}>
                  <span style={{ fontSize: 32 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#3b6d11' }}>₹ {item.price}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <button onClick={() => setQty(item.id, item.qty - 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #e8e0d0', background: 'white', cursor: 'pointer' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #e8e0d0', background: 'white', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a89e', fontSize: 16 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {mounted && items.length > 0 && (
          <div style={{ padding: 24, borderTop: '1px solid #e8e0d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}><span style={{ color: '#6b6b64' }}>Subtotal</span><span>₹ {sub}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 16 }}><span style={{ color: '#6b6b64' }}>Shipping</span><span style={{ color: ship === 0 ? '#3b6d11' : undefined }}>{ship === 0 ? 'FREE 🎉' : '₹ ' + ship}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 17, marginBottom: 20 }}><span>Total</span><span style={{ color: '#3b6d11' }}>₹ {sub + ship}</span></div>
            {user ? (
              <Link href="/checkout" onClick={() => setCartOpen(false)} style={{ display: 'block', backgroundColor: '#3b6d11', color: 'white', textAlign: 'center', padding: 14, borderRadius: 100, textDecoration: 'none', fontWeight: 500 }}>
                Proceed to checkout →
              </Link>
            ) : (
              <Link href="/login?next=/checkout" onClick={() => setCartOpen(false)} style={{ display: 'block', backgroundColor: '#3b6d11', color: 'white', textAlign: 'center', padding: 14, borderRadius: 100, textDecoration: 'none', fontWeight: 500 }}>
                Sign in to checkout →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
