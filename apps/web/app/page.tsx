import Link from 'next/link'
import { LeafCluster, LeafBg, WaveDown, WaveUp, FeatureIcon } from './LandingGraphics'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function getFeaturedPlants() {
  try {
    const res = await fetch(`${API}/api/v1/plants/featured`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000), // don't block page for more than 3s
    })
    const json = await res.json()
    return (json.data || []).slice(0, 4) as Array<{
      id: string; slug: string; name: string; price: number;
      comparePrice?: number; thumbnailUrl: string; isBestseller: boolean; isNewArrival: boolean;
      categories: string[]; difficulty: string
    }>
  } catch { return [] }
}

const CATEGORY_GRID = [
  { n: 'Indoor',       e: '🏠', s: 'indoor' },
  { n: 'Vegetables',   e: '🥦', s: 'vegetable' },
  { n: 'Fruits',       e: '🍋', s: 'fruit' },
  { n: 'Flowering',    e: '🌸', s: 'flowering' },
  { n: 'Herbs',        e: '🫙', s: 'herb' },
  { n: 'Outdoor',      e: '🌲', s: 'outdoor' },
  { n: 'Succulents',   e: '🌵', s: 'succulent' },
  { n: 'Air-purifying',e: '💨', s: 'air_purifying' },
]

const FALLBACK_PLANTS = [
  { slug: 'monstera-deliciosa', name: 'Monstera',    price: 349, thumbnailUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=280&fit=crop&auto=format', isBestseller: true,  isNewArrival: false },
  { slug: 'tulsi-holy-basil',   name: 'Tulsi',       price: 99,  thumbnailUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&h=280&fit=crop&auto=format', isBestseller: false, isNewArrival: true  },
  { slug: 'aloe-vera',          name: 'Aloe vera',   price: 149, thumbnailUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8c10616?w=400&h=280&fit=crop&auto=format', isBestseller: false, isNewArrival: false },
  { slug: 'snake-plant',        name: 'Snake plant', price: 199, thumbnailUrl: 'https://images.unsplash.com/photo-1611211232932-da3113c5b960?w=400&h=280&fit=crop&auto=format', isBestseller: true,  isNewArrival: false },
]

export default async function HomePage() {
  const featured = await getFeaturedPlants()
  const cards = featured.length > 0 ? featured : FALLBACK_PLANTS

  return (
    <div style={{ paddingTop: 64 }}>

      {/* Hero */}
      <section style={{ minHeight: '90vh', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', padding: '80px 5%', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: -40, left: -60, width: 340, height: 340, opacity: 0.07, pointerEvents: 'none' }} viewBox="0 0 200 200">
          <path d="M100 180 C70 130 20 100 30 50 C40 0 90 10 100 60 C110 10 160 0 170 50 C180 100 130 130 100 180Z" fill="#3b6d11" />
        </svg>
        <svg style={{ position: 'absolute', bottom: -20, right: 420, width: 200, height: 200, opacity: 0.06, pointerEvents: 'none' }} viewBox="0 0 200 200">
          <path d="M100 180 C70 130 20 100 30 50 C40 0 90 10 100 60 C110 10 160 0 170 50 C180 100 130 130 100 180Z" fill="#3b6d11" />
        </svg>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%' }}>
          {/* Left — text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#eaf3de', border: '1px solid #c0dd97', padding: '6px 14px', borderRadius: 100, fontSize: 12, color: '#27500a', fontWeight: 500, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, backgroundColor: '#639922', borderRadius: '50%', display: 'inline-block' }} />
              Trusted by 12,000+ plant parents across India
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 5vw, 68px)', lineHeight: 1.05, color: '#1a1a18', marginBottom: 24, letterSpacing: -1 }}>
              Every plant<br />has a story.<br /><em style={{ color: '#3b6d11' }}>Start yours.</em>
            </h1>
            <p style={{ fontSize: 18, color: '#6b6b64', lineHeight: 1.65, maxWidth: 440, marginBottom: 36, fontWeight: 300 }}>
              Shop Indian plants with tailored care guides, smart watering reminders, and everything you need to help them thrive.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/shop" style={{ backgroundColor: '#3b6d11', color: 'white', padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
                Browse plants →
              </Link>
              <Link href="/guides" style={{ backgroundColor: 'white', color: '#6b6b64', padding: '14px 28px', borderRadius: 100, fontSize: 15, textDecoration: 'none', border: '1.5px solid #e8e0d0' }}>
                Care guides
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[
                { icon: '🚚', label: 'Free shipping over ₹499' },
                { icon: '🌱', label: '7-day plant guarantee' },
                { icon: '📱', label: 'App care reminders' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ fontSize: 12, color: '#6b6b64', fontWeight: 500 }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — cards + SVG illustration */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 320, height: 400, zIndex: 0, pointerEvents: 'none' }}>
              <LeafCluster />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, position: 'relative', zIndex: 1 }}>
              {cards.map((p, i) => (
                <Link key={p.slug} href={`/plants/${p.slug}`}
                  style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', textDecoration: 'none', display: 'block', overflow: 'hidden', marginTop: i % 2 === 1 ? 32 : 0, boxShadow: '0 4px 24px rgba(59,109,17,0.08)' }}>
                  <div style={{ height: 140, backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {p.thumbnailUrl
                      ? <img src={p.thumbnailUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <span style={{ fontSize: 48 }}>🌿</span>}
                    {p.isBestseller && <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#eaf3de', color: '#27500a', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 500 }}>Bestseller</span>}
                    {p.isNewArrival && !p.isBestseller && <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#fdf5e6', color: '#854f0b', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 500 }}>New</span>}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: '#1a1a18' }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: '#3b6d11', marginTop: 4 }}>₹{p.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <WaveDown from="#f5f0e8" to="#3b6d11" />
      <section style={{ backgroundColor: '#3b6d11', padding: '40px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { n: '12,000+', l: 'Happy plant parents' },
            { n: '200+',    l: 'Plant varieties' },
            { n: '4.8 ★',  l: 'Average rating' },
            { n: '48 hrs',  l: 'Delivery across India' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, color: '#c0dd97', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: '#a8cc78', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>
      <WaveUp from="#3b6d11" to="white" />

      {/* Categories */}
      <section style={{ backgroundColor: 'white', padding: '80px 5%', position: 'relative', overflow: 'hidden' }}>
        <LeafBg />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#3b6d11', marginBottom: 12 }}>Browse</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1a18', marginBottom: 12 }}>Find your kind of plant</h2>
          <p style={{ color: '#6b6b64', marginBottom: 48, fontSize: 16 }}>Every plant comes with a personalised care guide and smart reminders.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {CATEGORY_GRID.map(c => (
              <Link key={c.s} href={`/shop?category=${c.s}`}
                style={{ backgroundColor: '#f5f0e8', borderRadius: 16, border: '1px solid #e8e0d0', padding: '24px 12px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>{c.e}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{c.n}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Verdura */}
      <WaveDown from="white" to="#f5f0e8" />
      <section style={{ backgroundColor: '#f5f0e8', padding: '80px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#3b6d11', marginBottom: 12 }}>Why Verdura</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1a18', marginBottom: 48 }}>Everything your plant needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              { icon: '📖', title: 'Personalised care guides',  body: 'Every plant ships with a care guide written for Indian homes — humidity, sunlight, and seasonal tips included.' },
              { icon: '💧', title: 'Smart watering reminders',  body: 'The app pings you before your plant gets thirsty. Reminders adapt to each plant\'s needs automatically.' },
              { icon: '🌱', title: '7-day plant guarantee',     body: 'If your plant arrives damaged or dies within 7 days, we replace it — no questions asked.' },
              { icon: '🚚', title: 'Safe, breathable packaging',body: 'Plants are wrapped in breathable materials and shipped in boxes designed to keep roots happy in transit.' },
              { icon: '🪴', title: '200+ Indian varieties',     body: 'From tulsi and curry leaf to monstera and succulents — curated for Indian climate and homes.' },
              { icon: '📱', title: 'Full-featured app',         body: 'Track your garden, log watering, set reminders, and read care guides — all in one place on iOS & Android.' },
            ].map(f => (
              <div key={f.title} style={{ backgroundColor: 'white', borderRadius: 20, padding: 28, border: '1px solid #e8e0d0' }}>
                <FeatureIcon>{f.icon}</FeatureIcon>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a18', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b6b64', lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <WaveDown from="#f5f0e8" to="white" />
      <section style={{ backgroundColor: 'white', padding: '80px 5%', position: 'relative', overflow: 'hidden' }}>
        <LeafBg />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#3b6d11', marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1a18', marginBottom: 56 }}>From cart to thriving plant</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 2, backgroundColor: '#e8e0d0' }} />
            {[
              { n: '01', t: 'Pick your plant',      b: 'Browse by room, light level, or difficulty. Every listing shows exactly what the plant needs.', icon: '🌿' },
              { n: '02', t: 'We pack with care',    b: 'Plants are wrapped in breathable materials and shipped in a box that keeps roots safe.',       icon: '📦' },
              { n: '03', t: 'Get your guide',       b: 'A tailored care guide unlocks in your app the moment your order ships.',                        icon: '📖' },
              { n: '04', t: 'Never miss a watering',b: 'Smart reminders ping you before your plant gets thirsty — personalised to each plant.',         icon: '💧' },
            ].map(s => (
              <div key={s.n} style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 56, height: 56, backgroundColor: '#3b6d11', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 20, border: '4px solid white', boxShadow: '0 0 0 2px #c0dd97' }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#c0dd97', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>{s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a1a18', marginBottom: 10 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: '#6b6b64', lineHeight: 1.7, margin: 0 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <WaveDown from="white" to="#f5f0e8" />
      <section style={{ backgroundColor: '#f5f0e8', padding: '80px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#3b6d11', marginBottom: 12 }}>Reviews</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: '#1a1a18', marginBottom: 48 }}>Plant parents love us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { name: 'Priya S.',  city: 'Bengaluru', plant: '🌿', text: 'My monstera arrived perfectly packed and is thriving! The care guide in the app is so helpful — I finally stopped killing my plants.' },
              { name: 'Rohan M.', city: 'Mumbai',     plant: '🌵', text: 'Ordered a succulent set for my office desk. Arrived next day, looked exactly like the photos. The watering reminders are a game-changer.' },
              { name: 'Ananya K.',city: 'Hyderabad',  plant: '🌱', text: 'The tulsi and curry leaf plants are so healthy. I love that the guides are written for Indian weather — not generic US advice.' },
              { name: 'Vikram P.',city: 'Chennai',    plant: '🌸', text: 'Bought hibiscus and bougainvillea. Both are flowering beautifully within a month. Packaging was excellent, zero damage.' },
              { name: 'Meera T.', city: 'Pune',       plant: '🍃', text: 'The snake plant has purified our bedroom air noticeably. Worth every rupee. Will definitely order again!' },
              { name: 'Arjun R.', city: 'Delhi',      plant: '🪴', text: 'Customer support helped me identify what was wrong with my aloe and sent a replacement within 48 hours. Outstanding service.' },
            ].map(r => (
              <div key={r.name} style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, border: '1px solid #e8e0d0' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#f5a623', fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: '#4a4a42', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, backgroundColor: '#eaf3de', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{r.plant}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#a8a89e' }}>{r.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <WaveDown from="#f5f0e8" to="#3b6d11" />
      <section style={{ backgroundColor: '#3b6d11', padding: '80px 5%', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', right: -40, top: -40, width: 360, height: 360, opacity: 0.1, pointerEvents: 'none' }} viewBox="0 0 200 200">
          <path d="M100 180 C70 130 20 100 30 50 C40 0 90 10 100 60 C110 10 160 0 170 50 C180 100 130 130 100 180Z" fill="white" />
        </svg>
        <svg style={{ position: 'absolute', left: -20, bottom: -30, width: 240, height: 240, opacity: 0.08, pointerEvents: 'none' }} viewBox="0 0 200 200">
          <path d="M100 180 C70 130 20 100 30 50 C40 0 90 10 100 60 C110 10 160 0 170 50 C180 100 130 130 100 180Z" fill="white" />
        </svg>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 20 }}>🌿</span>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: 'white', marginBottom: 16, lineHeight: 1.2 }}>Ready to grow something beautiful?</h2>
          <p style={{ fontSize: 17, color: '#a8cc78', marginBottom: 36, lineHeight: 1.6 }}>Join 12,000+ plant parents. Free shipping on orders over ₹499.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop" style={{ backgroundColor: 'white', color: '#3b6d11', padding: '15px 32px', borderRadius: 100, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Shop now →
            </Link>
            <Link href="/register" style={{ backgroundColor: 'transparent', color: 'white', padding: '15px 32px', borderRadius: 100, fontSize: 15, fontWeight: 500, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)' }}>
              Create account
            </Link>
          </div>
        </div>
      </section>
      <div style={{ height: 2, backgroundColor: '#2d5a0e' }} />

    </div>
  )
}
