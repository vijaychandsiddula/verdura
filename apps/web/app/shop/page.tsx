// Server component — data fetched on the server before HTML is sent to browser.
// Zero loading spinner on first visit.
import ShopClient from './ShopClient'
import type { Plant, Supply, Seed } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function fetchInitialData() {
  try {
    const [plantsRes, suppliesRes, seedsRes] = await Promise.all([
      fetch(`${API}/api/v1/plants?limit=12&sortBy=newest`, { next: { revalidate: 60 } }),
      fetch(`${API}/api/v1/supplies?limit=20`, { next: { revalidate: 60 } }),
      fetch(`${API}/api/v1/seeds?limit=12&sort=newest`, { next: { revalidate: 60 } }),
    ])
    const [plantsJson, suppliesJson, seedsJson] = await Promise.all([
      plantsRes.json(), suppliesRes.json(), seedsRes.json(),
    ])
    return {
      plants: (plantsJson.data || []) as Plant[],
      plantPages: plantsJson.pagination?.totalPages ?? 1,
      supplies: (suppliesJson.data || []) as Supply[],
      supplyPages: suppliesJson.pagination?.totalPages ?? 1,
      seeds: (seedsJson.data || []) as Seed[],
      seedPages: seedsJson.pagination?.totalPages ?? 1,
    }
  } catch {
    return { plants: [], plantPages: 1, supplies: [], supplyPages: 1, seeds: [], seedPages: 1 }
  }
}

export default async function ShopPage() {
  const { plants, plantPages, supplies, supplyPages, seeds, seedPages } = await fetchInitialData()

  return (
    <ShopClient
      initialPlants={plants}
      initialPlantPages={plantPages}
      initialSupplies={supplies}
      initialSupplyPages={supplyPages}
      initialSeeds={seeds}
      initialSeedPages={seedPages}
    />
  )
}
