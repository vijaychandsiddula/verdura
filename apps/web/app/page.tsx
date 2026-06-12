import Link from 'next/link'
import Image from 'next/image'

// Server component — fetch at render time, Next.js caches with ISR
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function getFeaturedPlants() {
  try {
    const res = await fetch(`${API}/api/v1/plants/featured`, { next: { revalidate: 300 } })
    const json = await res.json()
    return (json.data || []).slice(0, 4) as Array<{
      id: string; slug: string; name: string; price: number;
      comparePrice?: number; thumbnailUrl: string; isBestseller: boolean; isNewArrival: boolean;
      categories: string[]; difficulty: string
    }>
  } catch {
    return []
  }
}

const CATEGORY_GRID = [
  { n: 'Indoor', e: '🏠', s: 'indoor' },
  { n: 'Vegetables', e: '🥦', s: 'vegetable' },
  { n: 'Fruits', e: '🍋', s: 'fruit' },
  { n: 'Flowering', e: '🌸', s: 'flowering' },
  { n: 'Herbs', e: '🫙', s: 'herb' },
  { n: 'Outdoor', e: '🌲', s: 'outdoor' },
  { n: 'Succulents', e: '🌵', s: 'succulent' },
  { n: 'Air-purifying', e: '💨', s: 'air_purifying' },
]

export default async function HomePage() {
  const featured = await getFeaturedPlants()

  // Fallback cards if API is down
  const FALLBACK = [
    { slug: 'monstera-deliciosa', name: 'Monstera', price: 349, thumbnailUrl: '', isBestseller: true, isNewArrival: false },
    { slug: 'tulsi-holy-basil', name: 'Tulsi', price: 99, thumbnailUrl: '', isBestseller: false, isNewArrival: true },
    { slug: 'aloe-vera', name: 'Aloe vera', price: 149, thumbnailUrl: '', isBestseller: false, isNewArrival: false },
    { slug: 'snake-plant', name: 'Snake plant', price: 199, thumbnailUrl: '', isBestseller: true, isNewArrival: false },
  ]

  const cards = featured.length > 0 ? featured : FALLBACK

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{ minHeight: '90vh', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', padding: '80px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#eaf3de', border: '1px solid #c0dd97', padding: '6px 14px', borderRadius: 100, fontSize: 12, color: '#27500a', fontWeight: 500, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, backgroundColor: '#639922', borderRadius: '50%', display: 'inline-block' }} />
              Trusted by 12,000+ plant parents across India
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 5vw, 68px)', lineHeight: 1.05, color: '#1a1a18', marginBottom: 24, letterSpacing: -1 }}>
              Every plant<br/>has a story.<br/><em style={{ color: '#3b6d11' }}>Start yours.</em>
            </h1>
            <p style={{ fontSize: 18, color: '#6b6b64', lineHeight: 1.65, maxWidth: 440, marginBottom: 36, fontWeight: 300 }}>
              Shop Indian plants with tailored care guides, smart watering reminders, and everything you need to help them thrive.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/shop" style={{ backgroundColor: '#3b6d11', color: 'white', padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>Browse plants →</Link>
              <Link href="/guides" style={{ backgroundColor: 'white', color: '#6b6b64', padding: '14px 28px', borderRadius: 100, fontSize: 15, textDecoration: 'none', border: '1.5px solid #e8e0d0' }}>Care guides</Link>
            </div>
          </div>

          {/* Featured plant cards with real images */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {cards.map((p, i) => (
              <Link key={p.slug} href={`/plants/${p.slug}`}
                style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', textDecoration: 'none', display: 'block', overflow: 'hidden', marginTop: i % 2 === 1 ? 32 : 0 }}>
                <div style={{ height: 140, backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  {p.thumbnailUrl && (p.thumbnailUrl.startsWith('http://') || p.thumbnailUrl.startsWith('https://')) ? (
                    <Image src={p.thumbnailUrl} alt={p.name} fill sizes="220px" style={{ objectFit: 'cover' }} priority={i < 2} />
                  ) : (
                    <span style={{ fontSize: 48 }}>🌿</span>
                  )}
                  {p.isBestseller && (
                    <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#eaf3de', color: '#27500a', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 500 }}>Bestseller</span>
                  )}
                  {p.isNewArrival && !p.isBestseller && (
                    <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#fdf5e6', color: '#854f0b', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 500 }}>New</span>
                  )}
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#1a1a18' }}>{p.name}</div>
                  <div style={{ fontSize: 14, color: '#3b6d11', marginTop: 4 }}>₹{p.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ backgroundColor: 'white', padding: '80px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#3b6d11', marginBottom: 12 }}>Browse</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1a18', marginBottom: 12 }}>Find your kind of plant</h2>
          <p style={{ color: '#6b6b64', marginBottom: 48, fontSize: 16 }}>Every plant comes with a personalised care guide and smart reminders.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {CATEGORY_GRID.map(c => (
              <Link key={c.s} href={`/shop?category=${c.s}`} style={{ backgroundColor: '#f5f0e8', borderRadius: 16, border: '1px solid #e8e0d0', padding: '20px 12px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{c.e}</span>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a18' }}>{c.n}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: '#f5f0e8', padding: '80px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#3b6d11', marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1a18', marginBottom: 48 }}>From cart to thriving plant</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
            {[
              { n: '01', t: 'Pick your plant', b: 'Browse by room, light level, or difficulty. Every listing shows exactly what the plant needs.' },
              { n: '02', t: 'We pack with care', b: 'Plants are wrapped in breathable materials and shipped in a box that keeps roots safe.' },
              { n: '03', t: 'Get your guide', b: 'A tailored care guide unlocks in your app the moment your order ships.' },
              { n: '04', t: 'Never miss a watering', b: 'Smart reminders ping you before your plant gets thirsty — personalised to each plant.' },
            ].map(s => (
              <div key={s.n}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 64, color: '#c0dd97', lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: '#1a1a18', marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: '#6b6b64', lineHeight: 1.7 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
