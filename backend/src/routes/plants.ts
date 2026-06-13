import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { fromCache, toCache, invalidatePrefix } from '../lib/cache'
import { getKitForPlant } from '../lib/kitSuggestions'

const router = Router()

async function invalidate(prefix: string) { await invalidatePrefix(prefix) }

// ── Shared select for list views (no careGuide JOIN) ─────────────────────────
const LIST_SELECT = {
  id: true, name: true, scientificName: true, slug: true, description: true,
  price: true, comparePrice: true, stock: true, thumbnailUrl: true, images: true,
  categories: true, difficulty: true, tags: true, isBestseller: true, isNewArrival: true,
  careWatering: true, careSunlight: true, careHumidity: true, careTemperature: true,
  wateringIntervalDays: true, fertiliserIntervalDays: true,
  pruningIntervalDays: true, repottingIntervalMonths: true,
  potSizeMinInch: true, potSizeMaxInch: true, potVolumeLitres: true,
  soilCocoPeatPct: true, soilGardenSoilPct: true, soilCompostPct: true,
  soilExtrasPct: true, soilExtrasNote: true, potNotes: true,
  isActive: true, createdAt: true, updatedAt: true,
}

// GET /plants
router.get('/', async (req, res) => {
  const query = z.object({
    category:   z.string().optional(),
    difficulty: z.string().optional(),
    search:     z.string().optional(),
    minPrice:   z.coerce.number().optional(),
    maxPrice:   z.coerce.number().optional(),
    sortBy:     z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'bestseller']).optional(),
    page:       z.coerce.number().default(1),
    limit:      z.coerce.number().default(12),
  }).parse(req.query)

  const cacheKey = `plants:list:${JSON.stringify(query)}`
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const where: Record<string, unknown> = { isActive: true }
  if (query.category)  where.categories = { has: query.category }
  if (query.difficulty) where.difficulty = query.difficulty
  if (query.search)    where.name = { contains: query.search, mode: 'insensitive' }
  if (query.minPrice || query.maxPrice) {
    where.price = {}
    if (query.minPrice) (where.price as Record<string, unknown>).gte = query.minPrice
    if (query.maxPrice) (where.price as Record<string, unknown>).lte = query.maxPrice
  }

  const orderBy: Record<string, unknown> =
    query.sortBy === 'price_asc'  ? { price: 'asc' }         :
    query.sortBy === 'price_desc' ? { price: 'desc' }        :
    query.sortBy === 'bestseller' ? { isBestseller: 'desc' } :
    { createdAt: 'desc' }

  const [total, plants] = await Promise.all([
    prisma.plant.count({ where }),
    prisma.plant.findMany({
      where, orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: LIST_SELECT,   // ← no careGuide JOIN on list
    }),
  ])

  const response = {
    success: true,
    data: plants,
    pagination: {
      page: query.page, limit: query.limit, total,
      totalPages: Math.ceil(total / query.limit),
      hasNext: query.page * query.limit < total,
      hasPrev: query.page > 1,
    },
  }
  await toCache(cacheKey, response)
  res.json(response)
})

// GET /plants/featured
router.get('/featured', async (_req, res) => {
  const cacheKey = 'plants:featured'
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const plants = await prisma.plant.findMany({
    where: { isActive: true, OR: [{ isBestseller: true }, { isNewArrival: true }] },
    take: 8,
    select: LIST_SELECT,   // ← no careGuide JOIN
  })
  const response = { success: true, data: plants }
  await toCache(cacheKey, response)
  res.json(response)
})

// GET /plants/bestsellers
router.get('/bestsellers', async (_req, res) => {
  const cacheKey = 'plants:bestsellers'
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const plants = await prisma.plant.findMany({
    where: { isActive: true, isBestseller: true },
    take: 6,
    select: LIST_SELECT,
  })
  const response = { success: true, data: plants }
  await toCache(cacheKey, response)
  res.json(response)
})

// GET /plants/id/:id — fetch by database ID (detail — includes careGuide)
router.get('/id/:id', async (req, res) => {
  const cacheKey = `plants:id:${req.params.id}`
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const plant = await prisma.plant.findUnique({
    where: { id: req.params.id },
    include: { careGuide: { orderBy: { order: 'asc' } }, partner: { select: { id: true, businessName: true, city: true, state: true } } },
  })
  if (!plant) return res.status(404).json({ success: false, error: 'Plant not found' })
  const { kit, kitTotal } = await getKitForPlant(plant, prisma)
  const response = { success: true, data: { ...plant, kit, kitTotal } }
  await toCache(cacheKey, response, 300)
  res.json(response)
})

// GET /plants/:slug/related
router.get('/:slug/related', async (req, res) => {
  const cacheKey = `plants:related:${req.params.slug}`
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const plant = await prisma.plant.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, categories: true },
  })
  if (!plant) return res.status(404).json({ success: false, error: 'Plant not found' })

  const related = await prisma.plant.findMany({
    where: { isActive: true, id: { not: plant.id }, categories: { hasSome: plant.categories } },
    take: 4,
    select: LIST_SELECT,
  })
  const response = { success: true, data: related }
  await toCache(cacheKey, response)
  res.json(response)
})

// GET /plants/:slug — detail view (includes careGuide)
router.get('/:slug', async (req, res) => {
  const cacheKey = `plants:slug:${req.params.slug}`
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const plant = await prisma.plant.findUnique({
    where: { slug: req.params.slug },
    include: {
      careGuide: { orderBy: { order: 'asc' } },
      reviews: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!plant) return res.status(404).json({ success: false, error: 'Plant not found' })
  const { kit, kitTotal } = await getKitForPlant(plant, prisma)
  const response = { success: true, data: { ...plant, kit, kitTotal } }
  await toCache(cacheKey, response, 300)
  res.json(response)
})

export { invalidate as invalidatePlantsCache }
export default router
