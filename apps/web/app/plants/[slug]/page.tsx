import type { Metadata } from 'next'
import PlantDetailClient from './PlantDetailClient'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function getPlant(slug: string) {
  try {
    const res = await fetch(`${API}/api/v1/plants/${slug}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

async function getRelated(slug: string) {
  try {
    const res = await fetch(`${API}/api/v1/plants/${slug}/related`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const plant = await getPlant(params.slug)
  if (!plant) return { title: 'Plant not found — Verdura' }
  return {
    title: `${plant.name} — Verdura`,
    description: plant.description?.slice(0, 160),
    openGraph: {
      title: plant.name,
      description: plant.description?.slice(0, 160),
      images: plant.thumbnailUrl ? [plant.thumbnailUrl] : [],
    },
  }
}

export default async function PlantPage({ params }: { params: { slug: string } }) {
  const [plant, related] = await Promise.all([
    getPlant(params.slug),
    getRelated(params.slug),
  ])

  return <PlantDetailClient plant={plant} related={related} slug={params.slug} />
}
