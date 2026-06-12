// Server component — fetches ALL plants from the DB and passes to client for search
import GuidesClient from './GuidesClient'
import type { Plant } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function fetchAllPlants(): Promise<Plant[]> {
  try {
    // Fetch all active plants in two passes if needed (limit 200 covers us for now)
    const res = await fetch(`${API}/api/v1/plants?limit=200&sortBy=newest`, {
      next: { revalidate: 120 },
    })
    const json = await res.json()
    return (json.data || []) as Plant[]
  } catch {
    return []
  }
}

export default async function GuidesPage() {
  const plants = await fetchAllPlants()
  return <GuidesClient plants={plants} />
}
