import { Router } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { prisma } from '../lib/prisma'
import { authenticate, type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { scheduleRemindersForPlant } from '../services/reminderService'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
})

import { fromCache as fromSupplyCache, toCache as toSupplyCache } from '../lib/cache'

// ─── SUPPLIES ────────────────────────────────────────────────────────────────

export const suppliesRouter = Router()

suppliesRouter.get('/', async (req, res) => {
  const query = z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(12),
  }).parse(req.query)

  const cacheKey = `supplies:list:${JSON.stringify(query)}`
  const cached = await fromSupplyCache<unknown>(cacheKey)
  if (cached) return res.json(cached)

  const where: Record<string, unknown> = { isActive: true }
  if (query.category) where.category = query.category
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' }

  const [total, supplies] = await Promise.all([
    prisma.supply.count({ where }),
    prisma.supply.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const response = {
    success: true, data: supplies,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), hasNext: query.page * query.limit < total, hasPrev: query.page > 1 },
  }
  await toSupplyCache(cacheKey, response)
  res.json(response)
})

suppliesRouter.get('/category/:category', async (req, res) => {
  const supplies = await prisma.supply.findMany({
    where: { isActive: true, category: req.params.category as never },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: supplies })
})

suppliesRouter.get('/:slug', async (req, res) => {
  const supply = await prisma.supply.findUnique({ where: { slug: req.params.slug } })
  if (!supply) return res.status(404).json({ success: false, error: 'Supply not found' })
  res.json({ success: true, data: supply })
})

// ─── CART ────────────────────────────────────────────────────────────────────

export const cartRouter = Router()
cartRouter.use(authenticate)

async function buildCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { plant: true, supply: true, seed: true },
  })
  const subtotal = items.reduce((s, i) => {
    const price = i.plant?.price ?? i.supply?.price ?? i.seed?.price ?? 0
    return s + price * i.quantity
  }, 0)
  const shipping = subtotal >= 499 ? 0 : 49
  return { items, subtotal, shipping, total: subtotal + shipping, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
}

cartRouter.get('/', async (req: AuthRequest, res) => {
  res.json({ success: true, data: await buildCart(req.user!.id) })
})

cartRouter.post('/items', async (req: AuthRequest, res) => {
  const schema = z.object({
    productId: z.string(),
    productType: z.enum(['plant', 'supply', 'seed']),
    quantity: z.number().min(1).default(1),
  })
  const body = schema.parse(req.body)
  const userId = req.user!.id
  const data =
    body.productType === 'plant'  ? { userId, plantId:  body.productId, quantity: body.quantity } :
    body.productType === 'seed'   ? { userId, seedId:   body.productId, quantity: body.quantity } :
                                    { userId, supplyId: body.productId, quantity: body.quantity }
  const key =
    body.productType === 'plant'  ? { userId_plantId:  { userId, plantId:  body.productId } } :
    body.productType === 'seed'   ? { userId_seedId:   { userId, seedId:   body.productId } } :
                                    { userId_supplyId: { userId, supplyId: body.productId } }
  await prisma.cartItem.upsert({ where: key as never, create: data, update: { quantity: { increment: body.quantity } } })
  res.json({ success: true, data: await buildCart(userId) })
})

cartRouter.patch('/items/:id', async (req: AuthRequest, res) => {
  const { quantity } = z.object({ quantity: z.number().min(0) }).parse(req.body)
  const userId = req.user!.id
  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: req.params.id } })
  } else {
    await prisma.cartItem.update({ where: { id: req.params.id }, data: { quantity } })
  }
  res.json({ success: true, data: await buildCart(userId) })
})

cartRouter.delete('/items/:id', async (req: AuthRequest, res) => {
  await prisma.cartItem.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: await buildCart(req.user!.id) })
})

cartRouter.delete('/', async (req: AuthRequest, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } })
  res.json({ success: true, data: await buildCart(req.user!.id) })
})

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const ordersRouter = Router()
ordersRouter.use(authenticate)

ordersRouter.get('/', async (req: AuthRequest, res) => {
  const page = Number(req.query.page) || 1
  const limit = 10
  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId: req.user!.id } }),
    prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])
  res.json({ success: true, data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 } })
})

ordersRouter.get('/:id', async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { items: true, address: true },
  })
  if (!order) throw new AppError('Order not found', 404)
  res.json({ success: true, data: order })
})

ordersRouter.post('/', async (req: AuthRequest, res) => {
  const schema = z.object({ addressId: z.string(), paymentMethod: z.string(), notes: z.string().optional() })
  const body = schema.parse(req.body)
  const userId = req.user!.id
  const cart = await buildCart(userId)
  if (cart.items.length === 0) throw new AppError('Cart is empty', 400)

  const order = await prisma.order.create({
    data: {
      userId,
      addressId: body.addressId,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
      items: {
        create: cart.items.map((i) => ({
          plantId: i.plantId,
          supplyId: i.supplyId,
          seedId: i.seedId,
          name: i.plant?.name ?? i.supply?.name ?? (i as any).seed?.name ?? '',
          price: i.plant?.price ?? i.supply?.price ?? (i as any).seed?.price ?? 0,
          quantity: i.quantity,
          thumbnailUrl: i.plant?.thumbnailUrl ?? i.supply?.thumbnailUrl ?? (i as any).seed?.thumbnailUrl ?? '',
        })),
      },
    },
    include: { items: true },
  })

  // Create Razorpay order for online payment
  let razorpayOrderId: string | undefined
  if (body.paymentMethod === 'razorpay') {
    try {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(cart.total * 100), // paise
        currency: 'INR',
        receipt: order.id,
      })
      razorpayOrderId = rzpOrder.id
      await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId } })
    } catch {
      // Razorpay keys not configured in dev — return order without payment ID
    }
  } else {
    // COD — clear cart immediately
    await prisma.cartItem.deleteMany({ where: { userId } })
  }

  res.status(201).json({ success: true, data: { order, razorpayOrderId } })
})

// POST /orders/verify-payment — verify Razorpay signature and mark order paid
ordersRouter.post('/verify-payment', async (req: AuthRequest, res) => {
  const schema = z.object({
    orderId: z.string(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  })
  const body = schema.parse(req.body)

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
    .digest('hex')

  if (expectedSignature !== body.razorpaySignature) {
    throw new AppError('Payment verification failed', 400)
  }

  const order = await prisma.order.update({
    where: { id: body.orderId },
    data: {
      paymentStatus: 'paid',
      status: 'confirmed',
      razorpayPaymentId: body.razorpayPaymentId,
    },
  })

  await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } })
  res.json({ success: true, data: order })
})

// POST /orders/:id/cancel
ordersRouter.post('/:id/cancel', async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id } })
  if (!order) throw new AppError('Order not found', 404)
  if (!['pending', 'confirmed'].includes(order.status)) throw new AppError('Order cannot be cancelled', 400)

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: 'cancelled' },
  })
  res.json({ success: true, data: updated })
})

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export const addressesRouter = Router()
addressesRouter.use(authenticate)

addressesRouter.get('/', async (req: AuthRequest, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user!.id } })
  res.json({ success: true, data: addresses })
})

addressesRouter.post('/', async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string(), phone: z.string(), line1: z.string(), line2: z.string().optional(),
    city: z.string(), state: z.string(), pincode: z.string(), isDefault: z.boolean().default(false),
  })
  const data = schema.parse(req.body)
  if (data.isDefault) await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } })
  const address = await prisma.address.create({ data: { ...data, userId: req.user!.id } })
  res.status(201).json({ success: true, data: address })
})

addressesRouter.patch('/:id', async (req: AuthRequest, res) => {
  const address = await prisma.address.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json({ success: true, data: address })
})

addressesRouter.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.address.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: null })
})

addressesRouter.post('/:id/default', async (req: AuthRequest, res) => {
  await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } })
  const address = await prisma.address.update({ where: { id: req.params.id }, data: { isDefault: true } })
  res.json({ success: true, data: address })
})

// ─── GARDEN ──────────────────────────────────────────────────────────────────

export const gardenRouter = Router()
gardenRouter.use(authenticate)

gardenRouter.get('/', async (req: AuthRequest, res) => {
  const garden = await prisma.gardenPlant.findMany({
    where: { userId: req.user!.id },
    include: { plant: { include: { careGuide: { orderBy: { order: 'asc' } } } } },
  })
  res.json({ success: true, data: garden })
})

gardenRouter.post('/', async (req: AuthRequest, res) => {
  const { plantId, nickname } = z.object({ plantId: z.string(), nickname: z.string().optional() }).parse(req.body)
  const plant = await prisma.plant.findUnique({ where: { id: plantId } })
  if (!plant) throw new AppError('Plant not found', 404)

  const gp = await prisma.gardenPlant.create({
    data: { userId: req.user!.id, plantId, nickname },
    include: { plant: true },
  })

  // Schedule reminders automatically
  await scheduleRemindersForPlant(req.user!.id, gp.id, plant)

  res.status(201).json({ success: true, data: gp })
})

gardenRouter.patch('/:id', async (req: AuthRequest, res) => {
  const schema = z.object({ nickname: z.string().optional(), healthScore: z.number().min(0).max(100).optional(), notes: z.string().optional() })
  const data = schema.parse(req.body)
  const gp = await prisma.gardenPlant.update({ where: { id: req.params.id }, data, include: { plant: true } })
  res.json({ success: true, data: gp })
})

gardenRouter.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.gardenPlant.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: null })
})

// ─── REMINDERS ───────────────────────────────────────────────────────────────

export const remindersRouter = Router()
remindersRouter.use(authenticate)

remindersRouter.get('/', async (req: AuthRequest, res) => {
  const status = req.query.status as string | undefined
  const reminders = await prisma.reminder.findMany({
    where: { userId: req.user!.id, ...(status ? { status: status as never } : {}) },
    include: { gardenPlant: { include: { plant: true } } },
    orderBy: { dueAt: 'asc' },
  })
  res.json({ success: true, data: reminders })
})

remindersRouter.get('/today', async (req: AuthRequest, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date(); end.setHours(23, 59, 59, 999)
  const reminders = await prisma.reminder.findMany({
    where: { userId: req.user!.id, status: 'pending', dueAt: { gte: start, lte: end } },
    include: { gardenPlant: { include: { plant: true } } },
    orderBy: { dueAt: 'asc' },
  })
  res.json({ success: true, data: reminders })
})

remindersRouter.post('/:id/done', async (req: AuthRequest, res) => {
  const reminder = await prisma.reminder.update({
    where: { id: req.params.id },
    data: { status: 'done', completedAt: new Date() },
  })
  res.json({ success: true, data: reminder })
})

remindersRouter.post('/:id/snooze', async (req: AuthRequest, res) => {
  const { until } = z.object({ until: z.string().datetime() }).parse(req.body)
  const reminder = await prisma.reminder.update({
    where: { id: req.params.id },
    data: { status: 'snoozed', snoozedUntil: new Date(until) },
  })
  res.json({ success: true, data: reminder })
})
