import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export const partnersRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'verdura-secret'
const JWT_EXPIRES = '7d'
const REFRESH_EXPIRES = '30d'

// ── Auth middleware for partners ────────────────────────────────────────────

export async function partnerAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'No token' })
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { partnerId: string }
    const partner = await prisma.partner.findUnique({ where: { id: payload.partnerId } })
    if (!partner || partner.status === 'suspended') return res.status(401).json({ success: false, error: 'Unauthorized' })
    ;(req as any).partner = partner
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

function issueTokens(partnerId: string) {
  const access = jwt.sign({ partnerId }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  const refresh = jwt.sign({ partnerId }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES })
  return { access, refresh }
}

// ── POST /partners/register ─────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(10),
  type: z.enum(['nursery', 'seed_house', 'supply_store', 'multi']),
  city: z.string(),
  state: z.string(),
  pincode: z.string().length(6),
  gstNumber: z.string().optional(),
  description: z.string().optional(),
})

partnersRouter.post('/register', async (req, res) => {
  const body = registerSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ success: false, error: body.error.flatten() })
  const { email, password, ...rest } = body.data
  const exists = await prisma.partner.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ success: false, error: 'Email already registered' })
  const passwordHash = await bcrypt.hash(password, 12)
  const partner = await prisma.partner.create({
    data: { email, passwordHash, ...rest },
    select: { id: true, email: true, businessName: true, ownerName: true, type: true, status: true, city: true, state: true },
  })
  const { access, refresh } = issueTokens(partner.id)
  await prisma.partnerRefreshToken.create({
    data: { token: refresh, partnerId: partner.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  })
  res.status(201).json({ success: true, data: { partner, tokens: { accessToken: access, refreshToken: refresh } } })
})

// ── POST /partners/login ────────────────────────────────────────────────────

partnersRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  const partner = await prisma.partner.findUnique({ where: { email } })
  if (!partner || !(await bcrypt.compare(password, partner.passwordHash)))
    return res.status(401).json({ success: false, error: 'Invalid credentials' })
  if (partner.status === 'suspended')
    return res.status(403).json({ success: false, error: 'Account suspended. Contact support.' })
  const { access, refresh } = issueTokens(partner.id)
  await prisma.partnerRefreshToken.create({
    data: { token: refresh, partnerId: partner.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  })
  const { passwordHash: _, ...safe } = partner
  res.json({ success: true, data: { partner: safe, tokens: { accessToken: access, refreshToken: refresh } } })
})

// ── GET /partners/me ────────────────────────────────────────────────────────

partnersRouter.get('/me', partnerAuth, async (req, res) => {
  const partner = (req as any).partner
  const { passwordHash: _, ...safe } = partner
  res.json({ success: true, data: safe })
})

// ── PATCH /partners/me ──────────────────────────────────────────────────────

partnersRouter.patch('/me', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const allowed = ['businessName', 'ownerName', 'phone', 'description', 'logoUrl', 'upiId', 'city', 'state', 'pincode', 'gstNumber']
  const data: Record<string, any> = {}
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k]
  const updated = await prisma.partner.update({ where: { id: p.id }, data })
  const { passwordHash: _, ...safe } = updated
  res.json({ success: true, data: safe })
})

// ── GET /partners/me/dashboard ──────────────────────────────────────────────

partnersRouter.get('/me/dashboard', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const [plantCount, seedCount, supplyCount, orderItems, pendingPayout] = await Promise.all([
    prisma.plant.count({ where: { partnerId: p.id, isActive: true } }),
    prisma.seed.count({ where: { partnerId: p.id, isActive: true } }),
    prisma.supply.count({ where: { partnerId: p.id, isActive: true } }),
    prisma.orderItem.findMany({
      where: { partnerId: p.id },
      include: { order: { select: { status: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.partner.findUnique({ where: { id: p.id }, select: { pendingPayout: true, totalEarnings: true } }),
  ])
  const totalRevenue = orderItems.reduce((s, i) => s + i.partnerEarning, 0)
  res.json({
    success: true,
    data: {
      listings: { plants: plantCount, seeds: seedCount, supplies: supplyCount },
      recentOrders: orderItems,
      earnings: pendingPayout,
    },
  })
})

// ── GET /partners/me/orders ─────────────────────────────────────────────────

partnersRouter.get('/me/orders', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const items = await prisma.orderItem.findMany({
    where: { partnerId: p.id },
    include: {
      order: { select: { orderNumber: true, status: true, createdAt: true, user: { select: { name: true, email: true } }, address: { select: { city: true, state: true, pincode: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })
  const total = await prisma.orderItem.count({ where: { partnerId: p.id } })
  res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})

// ── PLANTS ──────────────────────────────────────────────────────────────────

partnersRouter.get('/me/plants', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const plants = await prisma.plant.findMany({ where: { partnerId: p.id }, orderBy: { createdAt: 'desc' } })
  res.json({ success: true, data: plants })
})

const plantSchema = z.object({
  name: z.string().min(2),
  scientificName: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1),
  thumbnailUrl: z.string().url(),
  categories: z.array(z.enum(['indoor','outdoor','succulent','tropical','herb','flowering','fern','air_purifying','bonsai','vegetable','fruit'])).min(1),
  difficulty: z.enum(['beginner','intermediate','expert']).default('beginner'),
  tags: z.array(z.string()).default([]),
  careWatering: z.string(),
  careSunlight: z.string(),
  careHumidity: z.string(),
  careTemperature: z.string(),
  wateringIntervalDays: z.number().int().positive(),
  fertiliserIntervalDays: z.number().int().positive(),
})

partnersRouter.post('/me/plants', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  if (p.status !== 'approved') return res.status(403).json({ success: false, error: 'Account pending approval' })
  const body = plantSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ success: false, error: body.error.flatten() })
  const slugExists = await prisma.plant.findUnique({ where: { slug: body.data.slug } })
  if (slugExists) return res.status(409).json({ success: false, error: 'Slug already taken' })
  const plant = await prisma.plant.create({ data: { ...body.data, partnerId: p.id } })
  res.status(201).json({ success: true, data: plant })
})

partnersRouter.patch('/me/plants/:id', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const plant = await prisma.plant.findFirst({ where: { id: req.params.id, partnerId: p.id } })
  if (!plant) return res.status(404).json({ success: false, error: 'Not found' })
  const allowed = ['name','description','price','comparePrice','stock','images','thumbnailUrl','tags','isActive','careWatering','careSunlight','careHumidity','careTemperature','wateringIntervalDays','fertiliserIntervalDays']
  const data: Record<string, any> = {}
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k]
  const updated = await prisma.plant.update({ where: { id: plant.id }, data })
  res.json({ success: true, data: updated })
})

partnersRouter.delete('/me/plants/:id', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const plant = await prisma.plant.findFirst({ where: { id: req.params.id, partnerId: p.id } })
  if (!plant) return res.status(404).json({ success: false, error: 'Not found' })
  await prisma.plant.update({ where: { id: plant.id }, data: { isActive: false, stock: 0 } })
  res.json({ success: true })
})

// ── SEEDS ───────────────────────────────────────────────────────────────────

partnersRouter.get('/me/seeds', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const seeds = await prisma.seed.findMany({ where: { partnerId: p.id }, orderBy: { createdAt: 'desc' } })
  res.json({ success: true, data: seeds })
})

const seedSchema = z.object({
  name: z.string().min(2),
  scientificName: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1),
  thumbnailUrl: z.string().url(),
  categories: z.array(z.enum(['indoor','outdoor','succulent','tropical','herb','flowering','fern','air_purifying','bonsai','vegetable','fruit'])).min(1),
  difficulty: z.enum(['beginner','intermediate','expert']).default('beginner'),
  tags: z.array(z.string()).default([]),
  germinationDays: z.string(),
  sowingDepth: z.string(),
  sowingMethod: z.string(),
  harvestDays: z.string().optional(),
  seedsPerPacket: z.number().int().min(1),
  sowingSeason: z.string(),
})

partnersRouter.post('/me/seeds', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  if (p.status !== 'approved') return res.status(403).json({ success: false, error: 'Account pending approval' })
  const body = seedSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ success: false, error: body.error.flatten() })
  const slugExists = await prisma.seed.findUnique({ where: { slug: body.data.slug } })
  if (slugExists) return res.status(409).json({ success: false, error: 'Slug already taken' })
  const seed = await prisma.seed.create({ data: { ...body.data, partnerId: p.id } })
  res.status(201).json({ success: true, data: seed })
})

partnersRouter.patch('/me/seeds/:id', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const seed = await prisma.seed.findFirst({ where: { id: req.params.id, partnerId: p.id } })
  if (!seed) return res.status(404).json({ success: false, error: 'Not found' })
  const allowed = ['name','description','price','comparePrice','stock','images','thumbnailUrl','tags','isActive','germinationDays','sowingDepth','sowingMethod','harvestDays','seedsPerPacket','sowingSeason']
  const data: Record<string, any> = {}
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k]
  const updated = await prisma.seed.update({ where: { id: seed.id }, data })
  res.json({ success: true, data: updated })
})

partnersRouter.delete('/me/seeds/:id', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const seed = await prisma.seed.findFirst({ where: { id: req.params.id, partnerId: p.id } })
  if (!seed) return res.status(404).json({ success: false, error: 'Not found' })
  await prisma.seed.update({ where: { id: seed.id }, data: { isActive: false, stock: 0 } })
  res.json({ success: true })
})

// ── SUPPLIES ─────────────────────────────────────────────────────────────────

partnersRouter.get('/me/supplies', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const supplies = await prisma.supply.findMany({ where: { partnerId: p.id }, orderBy: { createdAt: 'desc' } })
  res.json({ success: true, data: supplies })
})

const supplySchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1),
  thumbnailUrl: z.string().url(),
  category: z.enum(['pots','soil','fertiliser','tools','accessories']),
  badges: z.array(z.string()).default([]),
})

partnersRouter.post('/me/supplies', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  if (p.status !== 'approved') return res.status(403).json({ success: false, error: 'Account pending approval' })
  const body = supplySchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ success: false, error: body.error.flatten() })
  const slugExists = await prisma.supply.findUnique({ where: { slug: body.data.slug } })
  if (slugExists) return res.status(409).json({ success: false, error: 'Slug already taken' })
  const supply = await prisma.supply.create({ data: { ...body.data, partnerId: p.id } })
  res.status(201).json({ success: true, data: supply })
})

partnersRouter.patch('/me/supplies/:id', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const supply = await prisma.supply.findFirst({ where: { id: req.params.id, partnerId: p.id } })
  if (!supply) return res.status(404).json({ success: false, error: 'Not found' })
  const allowed = ['name','description','price','comparePrice','stock','images','thumbnailUrl','badges','isActive','category']
  const data: Record<string, any> = {}
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k]
  const updated = await prisma.supply.update({ where: { id: supply.id }, data })
  res.json({ success: true, data: updated })
})

partnersRouter.delete('/me/supplies/:id', partnerAuth, async (req, res) => {
  const p = (req as any).partner
  const supply = await prisma.supply.findFirst({ where: { id: req.params.id, partnerId: p.id } })
  if (!supply) return res.status(404).json({ success: false, error: 'Not found' })
  await prisma.supply.update({ where: { id: supply.id }, data: { isActive: false, stock: 0 } })
  res.json({ success: true })
})
