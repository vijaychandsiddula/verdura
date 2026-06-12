import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth'

export const notificationsRouter = Router()
notificationsRouter.use(authenticate)

notificationsRouter.post('/token', async (req: AuthRequest, res) => {
  const { token, platform } = req.body
  await prisma.pushToken.upsert({
    where: { token },
    create: { token, platform, userId: req.user!.id },
    update: { userId: req.user!.id },
  })
  res.json({ success: true, data: { token } })
})

export const adminRouter = Router()
adminRouter.use(authenticate, requireAdmin)

// Admin: list all orders
adminRouter.get('/orders', async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } }, items: true, address: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json({ success: true, data: orders })
})

// Admin: update order status
adminRouter.patch('/orders/:id/status', async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status, trackingNumber: req.body.trackingNumber },
  })
  res.json({ success: true, data: order })
})

// Admin: create plant
adminRouter.post('/plants', async (req, res) => {
  const { careGuide, images, ...rest } = req.body
  const plant = await prisma.plant.create({
    data: {
      ...rest,
      thumbnailUrl: rest.thumbnailUrl || '',
      images: images || [],
      careGuide: careGuide ? { create: careGuide } : undefined,
    },
    include: { careGuide: true },
  })
  res.status(201).json({ success: true, data: plant })
})

// Admin: update plant — whitelist safe fields only
adminRouter.patch('/plants/:id', async (req, res) => {
  const allowed = ['name','slug','scientificName','description','price','comparePrice','stock','thumbnailUrl','images','categories','difficulty','tags','isBestseller','isNewArrival','isActive','careWatering','careSunlight','careHumidity','careTemperature','wateringIntervalDays','fertiliserIntervalDays','pruningIntervalDays','repottingIntervalMonths']
  const data: Record<string, unknown> = {}
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k]
  const plant = await prisma.plant.update({ where: { id: req.params.id }, data })
  res.json({ success: true, data: plant })
})

// Admin: create supply
adminRouter.post('/supplies', async (req, res) => {
  const supply = await prisma.supply.create({ data: req.body })
  res.status(201).json({ success: true, data: supply })
})

// Admin: update supply — whitelist safe fields only
adminRouter.patch('/supplies/:id', async (req, res) => {
  const allowed = ['name','description','price','comparePrice','stock','thumbnailUrl','images','category','badges','isActive']
  const data: Record<string, unknown> = {}
  for (const k of allowed) if (req.body[k] !== undefined) data[k] = req.body[k]
  const supply = await prisma.supply.update({ where: { id: req.params.id }, data })
  res.json({ success: true, data: supply })
})

// Admin: delete supply
adminRouter.delete('/supplies/:id', async (req, res) => {
  await prisma.supply.update({ where: { id: req.params.id }, data: { isActive: false } })
  res.json({ success: true, data: null })
})

// Admin: delete (deactivate) plant
adminRouter.delete('/plants/:id', async (req, res) => {
  await prisma.plant.update({ where: { id: req.params.id }, data: { isActive: false } })
  res.json({ success: true, data: null })
})

// Admin: list all plants (including inactive)
adminRouter.get('/plants', async (_req, res) => {
  const plants = await prisma.plant.findMany({
    orderBy: { createdAt: 'desc' },
    include: { careGuide: { orderBy: { order: 'asc' } } },
  })
  res.json({ success: true, data: plants })
})

// Admin: list all supplies (including inactive)
adminRouter.get('/supplies', async (_req, res) => {
  const supplies = await prisma.supply.findMany({ orderBy: { createdAt: 'desc' } })
  res.json({ success: true, data: supplies })
})

// Admin: list all users
adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, phone: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: users })
})

// Admin: dashboard stats
adminRouter.get('/stats', async (_req, res) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalOrders, totalRevenue, totalUsers, totalPlants, monthOrders, monthRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.plant.count({ where: { isActive: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid', createdAt: { gte: startOfMonth } } }),
  ])
  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalUsers,
      totalPlants,
      monthOrders,
      monthRevenue: monthRevenue._sum.total ?? 0,
    },
  })
})
