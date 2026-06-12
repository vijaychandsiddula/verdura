import Link from 'next/link'
export function Footer() {
  return (
    <footer style={{ backgroundColor: '#173404', color: '#c0dd97', padding: '64px 5% 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>🌿</div>
            <span style={{ color: 'white', fontWeight: 500, fontSize: 16 }}>Verdura</span>
          </div>
          <p style={{ fontSize: 13, color: '#8fa67c', lineHeight: 1.6 }}>Plants, pots and care guides delivered across India.</p>
        </div>
        <div>
          <h4 style={{ color: 'white', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Shop</h4>
          {['All plants','Succulents','Tropical','Supplies'].map(l => <Link key={l} href="/shop" style={{ display: 'block', fontSize: 13, color: '#8fa67c', textDecoration: 'none', marginBottom: 8 }}>{l}</Link>)}
        </div>
        <div>
          <h4 style={{ color: 'white', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Learn</h4>
          {['Care guides','Beginner guide'].map(l => <Link key={l} href="/guides" style={{ display: 'block', fontSize: 13, color: '#8fa67c', textDecoration: 'none', marginBottom: 8 }}>{l}</Link>)}
        </div>
        <div>
          <h4 style={{ color: 'white', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Company</h4>
          {['About','Contact','Shipping','Returns'].map(l => <a key={l} href="#" style={{ display: 'block', fontSize: 13, color: '#8fa67c', textDecoration: 'none', marginBottom: 8 }}>{l}</a>)}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', borderTop: '1px solid #27500a', paddingTop: 24 }}>
        <p style={{ fontSize: 12, color: '#639922' }}>© 2025 Verdura. All rights reserved.</p>
      </div>
    </footer>
  )
}
