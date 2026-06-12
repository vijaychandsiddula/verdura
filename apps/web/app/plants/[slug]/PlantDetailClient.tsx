'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useAuth } from '@/lib/auth'
import { gardenApi, type Plant } from '@/lib/api'
import toast from 'react-hot-toast'

const BLUR_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmMGU4Ii8+PC9zdmc+"

function isRemoteUrl(src: string) {
  return src && (src.startsWith('http://') || src.startsWith('https://'))
}

interface Props {
  plant: Plant | null
  related: Plant[]
  slug: string
}

export default function PlantDetailClient({ plant, related, slug }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const { add } = useCart()
  const [open, setOpen] = useState<number | null>(0)
  const [inGarden, setInGarden] = useState(false)
  const [addingToGarden, setAddingToGarden] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  const handleAddToGarden = async () => {
    if (!user) { router.push('/login?next=/plants/' + slug); return }
    if (!plant) return
    setAddingToGarden(true)
    try {
      await gardenApi.add(plant.id)
      setInGarden(true)
      toast.success(plant.name + ' added to your garden! Reminders set.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed'
      if (msg.includes('already')) { setInGarden(true); toast('Already in garden') }
      else toast.error(msg)
    } finally {
      setAddingToGarden(false)
    }
  }

  if (!plant) return (
    <div style={{ paddingTop: 100, textAlign: 'center' }}>
      <p style={{ color: '#6b6b64', marginBottom: 16 }}>Plant not found</p>
      <Link href="/shop" style={{ color: '#3b6d11', fontWeight: 500, textDecoration: 'none' }}>Back to shop</Link>
    </div>
  )

  const careItems = [
    { label: 'Watering', value: plant.careWatering },
    { label: 'Sunlight', value: plant.careSunlight },
    { label: 'Humidity', value: plant.careHumidity },
    { label: 'Temperature', value: plant.careTemperature },
  ]

  const hasImage = isRemoteUrl(plant.thumbnailUrl) && !imgErr

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 5%' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6b64', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24 }}>
          <ArrowLeft size={15} /> Back
        </button>

        {/* Hero card */}
        <div style={{ backgroundColor: '#f0f8e8', borderRadius: 24, padding: '40px 32px', textAlign: 'center', marginBottom: 24, border: '1px solid #e8e0d0' }}>
          <div style={{ width: 200, height: 200, margin: '0 auto 16px', borderRadius: 20, overflow: 'hidden', position: 'relative', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasImage ? (
              <Image
                src={plant.thumbnailUrl}
                alt={plant.name}
                fill
                priority
                sizes="200px"
                style={{ objectFit: 'cover' }}
                onError={() => setImgErr(true)}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            ) : (
              <span style={{ fontSize: 80 }}>🌿</span>
            )}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#1a1a18', marginBottom: 4 }}>{plant.name}</h1>
          <p style={{ fontSize: 14, color: '#a8a89e', fontStyle: 'italic', marginBottom: 12 }}>{plant.scientificName}</p>
          <p style={{ fontSize: 32, fontWeight: 600, color: '#3b6d11', marginBottom: 4 }}>
            ₹ {plant.price}
            {plant.comparePrice && <span style={{ fontSize: 18, color: '#a8a89e', textDecoration: 'line-through', marginLeft: 8 }}>₹ {plant.comparePrice}</span>}
          </p>
          <p style={{ fontSize: 13, color: '#a8a89e', marginBottom: 20 }}>
            {plant.stock > 0 ? `${plant.stock} in stock` : 'Out of stock'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleAddToGarden} disabled={inGarden || addingToGarden}
              style={{ padding: '12px 24px', borderRadius: 100, border: '1.5px solid #3b6d11', backgroundColor: inGarden ? '#eaf3de' : 'transparent', color: inGarden ? '#27500a' : '#3b6d11', fontSize: 14, fontWeight: 500, cursor: inGarden ? 'default' : 'pointer' }}>
              {addingToGarden ? 'Adding...' : inGarden ? '✓ In my garden' : '+ Add to garden'}
            </button>
            <button
              onClick={() => { add({ id: plant.id, name: plant.name, price: plant.price, emoji: '🌿' }); toast.success(plant.name + ' added to cart!') }}
              disabled={plant.stock === 0}
              style={{ padding: '12px 28px', borderRadius: 100, backgroundColor: plant.stock > 0 ? '#3b6d11' : '#a8a89e', color: 'white', fontSize: 14, fontWeight: 500, border: 'none', cursor: plant.stock > 0 ? 'pointer' : 'not-allowed' }}>
              {plant.stock > 0 ? `Add to cart — ₹ ${plant.price}` : 'Out of stock'}
            </button>
          </div>
        </div>

        {plant.description && <p style={{ fontSize: 15, color: '#6b6b64', lineHeight: 1.7, marginBottom: 24 }}>{plant.description}</p>}

        {/* Care at a glance */}
        <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#a8a89e', marginBottom: 12 }}>Care at a glance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
          {careItems.map(c => (
            <div key={c.label} style={{ backgroundColor: 'white', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e0d0' }}>
              <div style={{ fontSize: 11, color: '#a8a89e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a18' }}>{c.value || '-'}</div>
            </div>
          ))}
        </div>

        {/* Schedule chips */}
        <div style={{ backgroundColor: '#eaf3de', borderRadius: 14, padding: 16, marginBottom: 28, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: '#27500a', fontWeight: 600 }}>💧 Water every</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3b6d11' }}>{plant.wateringIntervalDays} days</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#27500a', fontWeight: 600 }}>🧪 Fertilise every</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3b6d11' }}>{plant.fertiliserIntervalDays} days</div>
          </div>
          {plant.pruningIntervalDays && (
            <div>
              <div style={{ fontSize: 12, color: '#27500a', fontWeight: 600 }}>✂️ Prune every</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3b6d11' }}>{plant.pruningIntervalDays} days</div>
            </div>
          )}
          {plant.repottingIntervalMonths && (
            <div>
              <div style={{ fontSize: 12, color: '#27500a', fontWeight: 600 }}>🪴 Repot every</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3b6d11' }}>{plant.repottingIntervalMonths} months</div>
            </div>
          )}
        </div>

        {/* Care guide accordion */}
        {plant.careGuide?.length > 0 && (
          <>
            <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#a8a89e', marginBottom: 12 }}>Full care guide</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {plant.careGuide.map((g, i) => (
                <div key={g.id} style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid #e8e0d0', overflow: 'hidden' }}>
                  <button onClick={() => setOpen(open === i ? null : i)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontWeight: 500, color: '#1a1a18', fontSize: 14 }}>{g.icon}  {g.title}</span>
                    <span style={{ color: '#a8a89e', fontSize: 16 }}>{open === i ? '▾' : '›'}</span>
                  </button>
                  {open === i && <p style={{ fontSize: 14, color: '#6b6b64', lineHeight: 1.7, padding: '0 18px 16px', margin: 0 }}>{g.body}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Related plants */}
        {related.length > 0 && (
          <>
            <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#a8a89e', marginBottom: 16 }}>You might also like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12 }}>
              {related.map(r => (
                <Link key={r.id} href={`/plants/${r.slug}`}
                  style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #e8e0d0', textDecoration: 'none', overflow: 'hidden', display: 'block' }}>
                  <div style={{ height: 100, position: 'relative', backgroundColor: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {isRemoteUrl(r.thumbnailUrl) ? (
                      <Image src={r.thumbnailUrl} alt={r.name} fill sizes="160px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 40 }}>🌿</span>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{r.name}</div>
                    <div style={{ fontSize: 14, color: '#3b6d11', fontWeight: 600, marginTop: 4 }}>₹ {r.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
