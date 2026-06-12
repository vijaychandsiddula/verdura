'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/store/cart'
import { plantsApi, suppliesApi, seedsApi, type Plant, type Supply, type Seed, type Pagination } from '@/lib/api'
import toast from 'react-hot-toast'

// Same categories for plants AND seeds
const PLANT_SEED_FILTERS = [
  { label: '🌿 All', value: '' },
  { label: '🏠 Indoor', value: 'indoor' },
  { label: '🌳 Outdoor', value: 'outdoor' },
  { label: '🥦 Vegetables', value: 'vegetable' },
  { label: '🍋 Fruits', value: 'fruit' },
  { label: '🌿 Herbs', value: 'herb' },
  { label: '🌸 Flowering', value: 'flowering' },
  { label: '💨 Air-purifying', value: 'air_purifying' },
  { label: '🌵 Succulents', value: 'succulent' },
  { label: '🌴 Tropical', value: 'tropical' },
]

const SUPPLY_CATS = [
  { label: 'All', value: '' },
  { label: '🪴 Pots', value: 'pots' },
  { label: '🌍 Soil', value: 'soil' },
  { label: '🧪 Fertilisers', value: 'fertiliser' },
  { label: '✂️ Tools', value: 'tools' },
  { label: '🎁 Accessories', value: 'accessories' },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
  { label: 'Bestsellers', value: 'bestseller' },
]

function difficultyColor(d: string) {
  return d === 'beginner' ? { bg: '#eaf3de', color: '#27500a' }
    : d === 'intermediate' ? { bg: '#fdf5e6', color: '#854f0b' }
    : { bg: '#fde8e8', color: '#8b0000' }
}

const BLUR_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmMGU4Ii8+PC9zdmc+"

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function PlantSkeleton() {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
      <div style={{ height: 200, backgroundColor: '#f0ebe1', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '14px' }}>
        <div style={{ height: 16, backgroundColor: '#f0ebe1', borderRadius: 8, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, backgroundColor: '#f0ebe1', borderRadius: 8, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

function SupplySkeleton() {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, backgroundColor: '#f0ebe1', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 16, backgroundColor: '#f0ebe1', borderRadius: 8, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, backgroundColor: '#f0ebe1', borderRadius: 8, width: '80%', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

function isRemoteUrl(src: string) { return src && (src.startsWith('http://') || src.startsWith('https://')) }

function PlantImg({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const [err, setErr] = useState(false)
  if (isRemoteUrl(src) && !err) {
    return <Image src={src} alt={alt} fill sizes="(max-width:768px) 50vw,25vw" style={{ objectFit: 'cover' }}
      priority={priority} onError={() => setErr(true)} placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} />
  }
  return <span style={{ fontSize: 48 }}>🌿</span>
}

function SupplyImg({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false)
  if (isRemoteUrl(src) && !err) {
    return <Image src={src} alt={alt} fill sizes="80px" style={{ objectFit: 'cover' }} onError={() => setErr(true)} />
  }
  return <span style={{ fontSize: 30 }}>🪴</span>
}

function SeedImg({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const [err, setErr] = useState(false)
  if (isRemoteUrl(src) && !err) {
    return <Image src={src} alt={alt} fill sizes="(max-width:768px) 50vw,25vw" style={{ objectFit: 'cover' }}
      priority={priority} onError={() => setErr(true)} placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} />
  }
  return <span style={{ fontSize: 48 }}>🌱</span>
}

// ── Props from server ─────────────────────────────────────────────────────────
interface Props {
  initialPlants: Plant[]
  initialPlantPages: number
  initialSupplies: Supply[]
  initialSupplyPages: number
  initialSeeds: Seed[]
  initialSeedPages: number
}

export default function ShopClient({
  initialPlants, initialPlantPages,
  initialSupplies, initialSupplyPages,
  initialSeeds, initialSeedPages,
}: Props) {
  const [tab, setTab] = useState<'plants' | 'seeds' | 'supplies'>('plants')
  const [category, setCategory] = useState('')
  const [seedCat, setSeedCat] = useState('')
  const [supCat, setSupCat] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [plants, setPlants] = useState<Plant[]>(initialPlants)
  const [supplies, setSupplies] = useState<Supply[]>(initialSupplies)
  const [seeds, setSeeds] = useState<Seed[]>(initialSeeds)
  const [plantPages, setPlantPages] = useState(initialPlantPages)
  const [supplyPages, setSupplyPages] = useState(initialSupplyPages)
  const [seedPages, setSeedPages] = useState(initialSeedPages)

  const [plantLoading, setPlantLoading] = useState(false)
  const [supplyLoading, setSupplyLoading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)

  const { add } = useCart()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search])

  useEffect(() => { setPage(1) }, [tab, category, seedCat, supCat, debouncedSearch, sort])

  const fetchPlants = useCallback(async () => {
    if (isFirstMount.current && category === '' && debouncedSearch === '' && sort === 'newest' && page === 1) return
    setPlantLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 12, sortBy: sort }
      if (category) params.category = category
      if (debouncedSearch) params.search = debouncedSearch
      const res = await plantsApi.list(params)
      setPlants(res.data); setPlantPages(res.pagination.totalPages)
    } catch { toast.error('Failed to load plants') }
    finally { setPlantLoading(false) }
  }, [category, debouncedSearch, sort, page])

  const fetchSeeds = useCallback(async () => {
    if (isFirstMount.current && seedCat === '' && debouncedSearch === '' && sort === 'newest' && page === 1) return
    setSeedLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 12, sort }
      if (seedCat) params.category = seedCat
      if (debouncedSearch) params.search = debouncedSearch
      const res = await seedsApi.list(params)
      setSeeds(res.data); setSeedPages(res.pagination.totalPages)
    } catch { toast.error('Failed to load seeds') }
    finally { setSeedLoading(false) }
  }, [seedCat, debouncedSearch, sort, page])

  const fetchSupplies = useCallback(async () => {
    if (isFirstMount.current && supCat === '' && debouncedSearch === '' && page === 1) return
    setSupplyLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 20 }
      if (supCat) params.category = supCat
      if (debouncedSearch) params.search = debouncedSearch
      const res = await suppliesApi.list(params)
      setSupplies(res.data); setSupplyPages(res.pagination.totalPages)
    } catch { toast.error('Failed to load supplies') }
    finally { setSupplyLoading(false) }
  }, [supCat, debouncedSearch, page])

  useEffect(() => {
    isFirstMount.current = false
    fetchPlants(); fetchSeeds(); fetchSupplies()
  }, [fetchPlants, fetchSeeds, fetchSupplies])

  const loading = tab === 'plants' ? plantLoading : tab === 'seeds' ? seedLoading : supplyLoading
  const totalPages = tab === 'plants' ? plantPages : tab === 'seeds' ? seedPages : supplyPages

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    backgroundColor: active ? '#3b6d11' : 'white', color: active ? 'white' : '#6b6b64',
    border: active ? '1px solid #3b6d11' : '1px solid #e8e0d0', whiteSpace: 'nowrap',
  })

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 24px', fontSize: 15, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none',
    borderBottom: active ? '2px solid #3b6d11' : '2px solid transparent',
    color: active ? '#3b6d11' : '#6b6b64', marginBottom: -1,
  })

  // Which filters to show
  const activeFilters = tab === 'supplies' ? SUPPLY_CATS : PLANT_SEED_FILTERS
  const activeFilterValue = tab === 'plants' ? category : tab === 'seeds' ? seedCat : supCat
  const setActiveFilter = tab === 'plants' ? setCategory : tab === 'seeds' ? setSeedCat : setSupCat

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 5%' }}>
        <p style={{ marginBottom: 32, color: '#6b6b64' }}>
          <strong style={{ color: '#1a1a18' }}>Plants, seeds, pots and everything in between</strong>
        </p>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #e8e0d0', marginBottom: 28, display: 'flex' }}>
          <button style={tabStyle(tab === 'plants')} onClick={() => setTab('plants')}>🌿 Plants</button>
          <button style={tabStyle(tab === 'seeds')} onClick={() => setTab('seeds')}>🌱 Seeds</button>
          <button style={tabStyle(tab === 'supplies')} onClick={() => setTab('supplies')}>🪴 Supplies</button>
        </div>

        {/* Search + sort */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a8a89e' }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab}…`}
              style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: '1px solid #e8e0d0', borderRadius: 12, fontSize: 14, backgroundColor: 'white', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {tab !== 'supplies' && (
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #e8e0d0', borderRadius: 12, fontSize: 14, backgroundColor: 'white', color: '#1a1a18', cursor: 'pointer' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>

        {/* Filters — same categories for plants & seeds */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {activeFilters.map(f => (
            <button key={f.value} style={pill(activeFilterValue === f.value)}
              onClick={() => setActiveFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Plants grid ── */}
        {tab === 'plants' && (
          <>
            {plantLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 20 }}>
                {Array.from({ length: 8 }).map((_, i) => <PlantSkeleton key={i} />)}
              </div>
            ) : plants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🌿</p>
                <p style={{ color: '#6b6b64' }}>No plants found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 20 }}>
                {plants.map((p, idx) => {
                  const diff = difficultyColor(p.difficulty)
                  return (
                    <div key={p.id} style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
                      <Link href={`/plants/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ height: 200, position: 'relative', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <PlantImg src={p.thumbnailUrl} alt={p.name} priority={idx < 4} />
                          {p.isBestseller && (
                            <span style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#eaf3de', color: '#27500a', fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 500, zIndex: 1 }}>Bestseller</span>
                          )}
                          {p.isNewArrival && !p.isBestseller && (
                            <span style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#fdf5e6', color: '#854f0b', fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 500, zIndex: 1 }}>New</span>
                          )}
                        </div>
                        <div style={{ padding: '14px 14px 0' }}>
                          <div style={{ fontWeight: 500, color: '#1a1a18', fontSize: 15 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#a8a89e', fontStyle: 'italic', marginTop: 2 }}>{p.scientificName}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, backgroundColor: '#f5f0e8', color: '#6b6b64', padding: '3px 8px', borderRadius: 6 }}>💧 {p.wateringIntervalDays}d</span>
                            <span style={{ fontSize: 11, ...diff, padding: '3px 8px', borderRadius: 6 }}>{p.difficulty}</span>
                          </div>
                        </div>
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
                        <div>
                          <span style={{ fontSize: 18, fontWeight: 600, color: '#3b6d11' }}>₹{p.price}</span>
                          {p.comparePrice && <span style={{ fontSize: 12, color: '#a8a89e', textDecoration: 'line-through', marginLeft: 6 }}>₹{p.comparePrice}</span>}
                        </div>
                        <button
                          onClick={() => { add({ id: p.id, name: p.name, price: p.price, emoji: '🌿' }); toast.success(`${p.name} added!`) }}
                          style={{ width: 34, height: 34, backgroundColor: p.stock > 0 ? '#3b6d11' : '#a8a89e', color: 'white', border: 'none', borderRadius: '50%', fontSize: 20, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          disabled={p.stock === 0}>
                          {p.stock > 0 ? '+' : '✕'}
                        </button>
                      </div>
                      {p.stock === 0 && <div style={{ textAlign: 'center', fontSize: 11, color: '#e24b4a', paddingBottom: 8 }}>Out of stock</div>}
                      {(p as any).partner && <div style={{ textAlign: 'center', fontSize: 11, color: '#a8a89e', paddingBottom: 8 }}>🏪 {(p as any).partner.businessName}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Seeds grid ── */}
        {tab === 'seeds' && (
          <>
            {seedLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 20 }}>
                {Array.from({ length: 8 }).map((_, i) => <PlantSkeleton key={i} />)}
              </div>
            ) : seeds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🌱</p>
                <p style={{ color: '#6b6b64' }}>No seeds found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 20 }}>
                {seeds.map((s, idx) => {
                  const diff = difficultyColor(s.difficulty)
                  return (
                    <div key={s.id} style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
                      <div style={{ height: 200, position: 'relative', backgroundColor: '#f0fde8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <SeedImg src={s.thumbnailUrl} alt={s.name} priority={idx < 4} />
                        {s.isBestseller && (
                          <span style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#eaf3de', color: '#27500a', fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 500, zIndex: 1 }}>Bestseller</span>
                        )}
                        {s.isNewArrival && !s.isBestseller && (
                          <span style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#fdf5e6', color: '#854f0b', fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 500, zIndex: 1 }}>New</span>
                        )}
                        {/* Germination badge */}
                        <span style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.92)', color: '#3b6d11', fontSize: 10, padding: '3px 8px', borderRadius: 100, fontWeight: 600 }}>
                          🌱 {s.germinationDays}
                        </span>
                      </div>
                      <div style={{ padding: '14px 14px 0' }}>
                        <div style={{ fontWeight: 500, color: '#1a1a18', fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#a8a89e', fontStyle: 'italic', marginTop: 2 }}>{s.scientificName}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, backgroundColor: '#f0fde8', color: '#27500a', padding: '3px 8px', borderRadius: 6 }}>📅 {s.sowingSeason}</span>
                          <span style={{ fontSize: 11, ...diff, padding: '3px 8px', borderRadius: 6 }}>{s.difficulty}</span>
                        </div>
                        {s.harvestDays && (
                          <div style={{ fontSize: 11, color: '#a8a89e', marginTop: 6 }}>🌾 Harvest in {s.harvestDays}</div>
                        )}
                        {s.seedsPerPacket > 0 && (
                          <div style={{ fontSize: 11, color: '#a8a89e', marginTop: 2 }}>📦 {s.seedsPerPacket} seeds/packet</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
                        <div>
                          <span style={{ fontSize: 18, fontWeight: 600, color: '#3b6d11' }}>₹{s.price}</span>
                          {s.comparePrice && <span style={{ fontSize: 12, color: '#a8a89e', textDecoration: 'line-through', marginLeft: 6 }}>₹{s.comparePrice}</span>}
                        </div>
                        <button
                          onClick={() => { add({ id: s.id, name: s.name, price: s.price, emoji: '🌱' }); toast.success(`${s.name} added!`) }}
                          style={{ width: 34, height: 34, backgroundColor: s.stock > 0 ? '#3b6d11' : '#a8a89e', color: 'white', border: 'none', borderRadius: '50%', fontSize: 20, cursor: s.stock > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          disabled={s.stock === 0}>
                          {s.stock > 0 ? '+' : '✕'}
                        </button>
                      </div>
                      {s.stock === 0 && <div style={{ textAlign: 'center', fontSize: 11, color: '#e24b4a', paddingBottom: 8 }}>Out of stock</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Supplies grid ── */}
        {tab === 'supplies' && (
          <>
            {supplyLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 6 }).map((_, i) => <SupplySkeleton key={i} />)}
              </div>
            ) : supplies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🪴</p>
                <p style={{ color: '#6b6b64' }}>No supplies found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
                {supplies.map(s => (
                  <div key={s.id} style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 80, height: 80, backgroundColor: '#f5f0e8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                      <SupplyImg src={s.thumbnailUrl} alt={s.name} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a18' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#6b6b64', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {s.badges?.map(b => <span key={b} style={{ fontSize: 11, backgroundColor: '#eaf3de', color: '#27500a', padding: '2px 8px', borderRadius: 100 }}>{b}</span>)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 600, color: '#3b6d11' }}>₹{s.price}</div>
                      {s.comparePrice && <div style={{ fontSize: 12, color: '#a8a89e', textDecoration: 'line-through' }}>₹{s.comparePrice}</div>}
                      <button
                        onClick={() => { add({ id: s.id, name: s.name, price: s.price, emoji: '🪴' }); toast.success(`${s.name} added!`) }}
                        disabled={s.stock === 0}
                        style={{ marginTop: 8, backgroundColor: s.stock > 0 ? '#3b6d11' : '#a8a89e', color: 'white', border: 'none', borderRadius: 100, padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: s.stock > 0 ? 'pointer' : 'not-allowed' }}>
                        {s.stock > 0 ? 'Add to cart' : 'Out of stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid #e8e0d0', background: page === 1 ? '#f5f0e8' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, color: '#6b6b64' }}>
              ← Prev
            </button>
            <span style={{ padding: '8px 18px', fontSize: 13, color: '#6b6b64' }}>Page {page} of {totalPages}</span>
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
