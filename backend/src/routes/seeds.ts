import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { fromCache, toCache, invalidatePrefix } from '../lib/cache'
import { getKitForPlant } from '../lib/kitSuggestions'

export const seedsRouter = Router()

const LIST_SELECT = {
  id: true, name: true, scientificName: true, slug: true, description: true,
  price: true, comparePrice: true, stock: true, thumbnailUrl: true, images: true,
  categories: true, difficulty: true, tags: true, isBestseller: true, isNewArrival: true,
  isActive: true, germinationDays: true, sowingDepth: true, sowingMethod: true,
  harvestDays: true, seedsPerPacket: true, sowingSeason: true, linkedPlantSlug: true,
  createdAt: true,
}

// GET /seeds
seedsRouter.get('/', async (req, res) => {
  const query = z.object({
    category: z.string().optional(),
    search:   z.string().optional(),
    sort:     z.enum(['newest', 'price_asc', 'price_desc', 'bestseller']).default('newest'),
    page:     z.coerce.number().default(1),
    limit:    z.coerce.number().default(12),
  }).parse(req.query)

  const cacheKey = `seeds:list:${JSON.stringify(query)}`
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const where: Record<string, unknown> = { isActive: true }
  if (query.category) where.categories = { has: query.category }
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' }

  const orderBy =
    query.sort === 'price_asc'   ? { price: 'asc'  as const } :
    query.sort === 'price_desc'  ? { price: 'desc' as const } :
    query.sort === 'bestseller'  ? { isBestseller: 'desc' as const } :
                                   { createdAt: 'desc' as const }

  const [total, seeds] = await Promise.all([
    prisma.seed.count({ where }),
    prisma.seed.findMany({ where, select: LIST_SELECT, orderBy, skip: (query.page - 1) * query.limit, take: query.limit }),
  ])

  const response = {
    success: true, data: seeds,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), hasNext: query.page * query.limit < total, hasPrev: query.page > 1 },
  }
  await toCache(cacheKey, response)
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  res.json(response)
})

// GET /seeds/bestsellers
seedsRouter.get('/bestsellers', async (_req, res) => {
  const cached = await fromCache<unknown>('seeds:bestsellers')
  if (cached) return res.json(cached)
  const seeds = await prisma.seed.findMany({ where: { isActive: true, isBestseller: true }, select: LIST_SELECT, take: 8 })
  const r = { success: true, data: seeds }
  await toCache('seeds:bestsellers', r)
  res.json(r)
})

// GET /seeds/:slug
seedsRouter.get('/:slug', async (req, res) => {
  const cacheKey = `seeds:detail:${req.params.slug}`
  const cached = await fromCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const seed = await prisma.seed.findUnique({ where: { slug: req.params.slug } })
  if (!seed) return res.status(404).json({ success: false, error: 'Seed not found' })

  // Seeds need the same pot+soil kit as the plant they grow into
  // categories on seed match plant categories (vegetable, herb, flowering etc.)
  const seedAsPlant = {
    categories:       seed.categories as string[],
    potSizeMinInch:   null,   // seeds use generic starter sizes
    potSizeMaxInch:   null,
    potVolumeLitres:  8,      // standard 8" starter pot
    soilCocoPeatPct:  35,
    soilGardenSoilPct: 35,
    soilCompostPct:   30,
    soilExtrasPct:    null,
    soilExtrasNote:   null,
  }
  const { kit, kitTotal } = await getKitForPlant(seedAsPlant, prisma)
  const r = { success: true, data: { ...seed, kit, kitTotal } }
  await toCache(cacheKey, r, 300)
  res.json(r)
})
