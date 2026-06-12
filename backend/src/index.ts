import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'

import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import authRoutes from './routes/auth'
import plantRoutes from './routes/plants'
import supplyRoutes from './routes/supplies'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import addressRoutes from './routes/addresses'
import gardenRoutes from './routes/garden'
import reminderRoutes from './routes/reminders'
import notificationRoutes from './routes/notifications'
import adminRoutes from './routes/admin'
import uploadRoutes from './routes/upload'
import { seedsRouter as seedRoutes } from './routes/seeds'
import { partnersRouter } from './routes/partners'

import { startCronJobs } from './jobs/reminderCron'
import { prisma } from './lib/prisma'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Gzip all responses (saves 60–80% bandwidth on JSON)
app.use(compression())

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to be loaded cross-origin
}))

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile apps, Postman)
    // or any localhost/LAN origin in development
    if (!origin) return cb(null, true)
    const allowed = [
      process.env.WEB_URL      || 'http://localhost:3000',
      process.env.ADMIN_URL    || 'http://localhost:3001',
      process.env.PARTNER_URL  || 'http://localhost:3002',
    ]
    // Allow any local network IP (Expo Go on physical device)
    if (origin.startsWith('http://192.168.') || origin.startsWith('http://10.') || allowed.includes(origin)) {
      return cb(null, true)
    }
    cb(null, true) // Open in dev; tighten in prod with cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── CACHING HEADERS ─────────────────────────────────────────────────────────

// Cache static public list endpoints for 60s on CDN/browser
app.use('/api/v1/plants', (req, res, next) => {
  if (req.method === 'GET') res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  next()
})
app.use('/api/v1/supplies', (req, res, next) => {
  if (req.method === 'GET') res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  next()
})
app.use('/api/v1/seeds', (req, res, next) => {
  if (req.method === 'GET') res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  next()
})

// ─── RATE LIMITING ────────────────────────────────────────────────────────────

app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many requests, please try again later.' }))
app.use('/api/v1', rateLimit({ windowMs: 1 * 60 * 1000, max: 300 }))

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// ─── HEALTH CHECK (load balancer / uptime monitor) ──────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'error', timestamp: new Date().toISOString() })
  }
})

app.get('/ready', (_req, res) => res.json({ status: 'ready' }))

app.use('/api/v1/auth',          authRoutes)
app.use('/api/v1/plants',        plantRoutes)
app.use('/api/v1/supplies',      supplyRoutes)
app.use('/api/v1/cart',          cartRoutes)
app.use('/api/v1/orders',        orderRoutes)
app.use('/api/v1/addresses',     addressRoutes)
app.use('/api/v1/garden',        gardenRoutes)
app.use('/api/v1/reminders',     reminderRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/admin',         adminRoutes)
app.use('/api/v1/admin',         uploadRoutes)
app.use('/api/v1/seeds',         seedRoutes)
app.use('/api/v1/partners',      partnersRouter)

// Serve uploaded images
app.use('/uploads', express.static('public/uploads'))

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

app.use(notFound)
app.use(errorHandler)

// ─── START ────────────────────────────────────────────────────────────────────

app.listen(PORT, async () => {
  console.info(`🌿 Verdura API running on http://localhost:${PORT}`)
  startCronJobs()
  // Pre-warm DB connection so first user request is instant (avoids 2.5s Neon cold start)
  try {
    await Promise.all([
      prisma.plant.count({ where: { isActive: true } }),
      prisma.supply.count({ where: { isActive: true } }),
    ])
    console.info('✅ DB connection warmed up')
  } catch {
    console.warn('⚠️  DB warm-up failed (will retry on first request)')
  }
})

export default app
