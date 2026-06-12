'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Plant } from '@/lib/api'

const BLUR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmMGU4Ii8+PC9zdmc+"

const CATEGORY_FILTERS = [
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

const DIFFICULTY_FILTERS = [
  { label: 'Any level', value: '' },
  { label: '🟢 Beginner', value: 'beginner' },
  { label: '🟡 Intermediate', value: 'intermediate' },
  { label: '🔴 Expert', value: 'expert' },
]

function diffStyle(d: string): { bg: string; color: string; label: string } {
  if (d === 'beginner')     return { bg: '#eaf3de', color: '#27500a', label: 'Beginner friendly' }
  if (d === 'intermediate') return { bg: '#fdf5e6', color: '#854f0b', label: 'Intermediate' }
  return                           { bg: '#fde8e8', color: '#8b0000', label: 'Advanced' }
}

function PlantThumb({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false)
  const isRemote = src && (src.startsWith('http://') || src.startsWith('https://'))
  if (isRemote && !err) {
    return (
      <Image src={src} alt={alt} fill sizes="64px" style={{ objectFit: 'cover' }}
        onError={() => setErr(true)} placeholder="blur" blurDataURL={BLUR} />
    )
  }
  return <span style={{ fontSize: 32 }}>🌿</span>
}

export default function GuidesClient({ plants }: { plants: Plant[] }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')

  const filtered = useMemo(() => {
    const lower = q.toLowerCase()
    return plants.filter(p => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(lower) ||
        p.scientificName.toLowerCase().includes(lower) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(lower)) ||
        (p.categories || []).some((c: string) => c.toLowerCase().includes(lower))
      const matchCat  = !category   || (p.categories || []).includes(category)
      const matchDiff = !difficulty || p.difficulty === difficulty
      return matchSearch && matchCat && matchDiff
    })
  }, [plants, q, category, difficulty])

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    whiteSpace: 'nowrap', border: 'none',
    backgroundColor: active ? '#3b6d11' : 'white', color: active ? 'white' : '#6b6b64',
    outline: active ? 'none' : '1px solid #e8e0d0',
  })

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 5%' }}>

        {/* Header */}
        <p style={{ color: '#6b6b64', marginBottom: 32 }}>
          <strong style={{ color: '#1a1a18' }}>Detailed care info for all plants</strong> — click any card to read the full guide.
        </p>

        {/* ── Search bar ── */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by plant name, type, or tag…"
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 44, paddingRight: q ? 44 : 16, paddingTop: 13, paddingBottom: 13,
              fontSize: 15, border: '1.5px solid #e8e0d0', borderRadius: 14,
              backgroundColor: 'white', outline: 'none', color: '#1a1a18',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#a8a89e', lineHeight: 1,
            }}>✕</button>
          )}
        </div>

        {/* ── Category filters ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {CATEGORY_FILTERS.map(f => (
            <button key={f.value} style={pill(category === f.value)} onClick={() => setCategory(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Difficulty filters ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {DIFFICULTY_FILTERS.map(f => (
            <button key={f.value} style={{ ...pill(difficulty === f.value), fontSize: 12 }} onClick={() => setDifficulty(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p style={{ fontSize: 13, color: '#a8a89e', marginBottom: 20 }}>
          {filtered.length === plants.length
            ? `Showing all ${plants.length} plants`
            : `${filtered.length} of ${plants.length} plants`}
          {(q || category || difficulty) && (
            <button onClick={() => { setQ(''); setCategory(''); setDifficulty('') }}
              style={{ marginLeft: 12, fontSize: 12, color: '#3b6d11', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Clear filters
            </button>
          )}
        </p>

        {/* ── Plant cards ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🌿</p>
            <p style={{ color: '#6b6b64', fontSize: 16 }}>No plants match your search.</p>
            <button onClick={() => { setQ(''); setCategory(''); setDifficulty('') }}
              style={{ marginTop: 16, padding: '10px 24px', backgroundColor: '#3b6d11', color: 'white', border: 'none', borderRadius: 100, fontSize: 14, cursor: 'pointer' }}>
              Show all plants
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => {
              const diff = diffStyle(p.difficulty)
              return (
                <Link key={p.id} href={`/plants/${p.slug}`}
                  style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #e8e0d0', padding: '18px 20px', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.15s' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    {/* Thumbnail */}
                    <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0, position: 'relative', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlantThumb src={p.thumbnailUrl} alt={p.name} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 500, color: '#1a1a18', marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: '#a8a89e', fontStyle: 'italic' }}>{p.scientificName}</div>
                    </div>
                    <span style={{ fontSize: 20, color: '#a8a89e', flexShrink: 0 }}>›</span>
                  </div>

                  {/* Care chips */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, backgroundColor: '#f5f0e8', color: '#6b6b64', padding: '4px 10px', borderRadius: 6 }}>
                      💧 Water every {p.wateringIntervalDays}d
                    </span>
                    <span style={{ fontSize: 12, backgroundColor: '#f5f0e8', color: '#6b6b64', padding: '4px 10px', borderRadius: 6 }}>
                      🧪 Feed every {p.fertiliserIntervalDays}d
                    </span>
                    {p.careWatering && (
                      <span style={{ fontSize: 12, backgroundColor: '#f5f0e8', color: '#6b6b64', padding: '4px 10px', borderRadius: 6 }}>
                        ☀️ {p.careSunlight?.split('(')[0].trim()}
                      </span>
                    )}
                    {(p.categories || []).slice(0, 2).map((c: string) => (
                      <span key={c} style={{ fontSize: 12, backgroundColor: '#eaf3de', color: '#3b6d11', padding: '4px 10px', borderRadius: 6 }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, backgroundColor: diff.bg, color: diff.color, fontWeight: 500 }}>
                      {diff.label}
                    </span>
                    <span style={{ fontSize: 13, color: '#3b6d11', fontWeight: 500 }}>
                      Read full guide →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
