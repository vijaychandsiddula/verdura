import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, type AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_TTL = '15m'
const REFRESH_TTL = '30d'

function signAccess(user: { id: string; email: string; role: string }) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TTL })
}

function signRefresh(userId: string) {
  return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL })
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
  })
  const body = schema.parse(req.body)
  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) throw new AppError('Email already registered', 409)

  const passwordHash = await bcrypt.hash(body.password, 12)
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, passwordHash, phone: body.phone },
  })

  const accessToken = signAccess(user)
  const refreshToken = signRefresh(user.id)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  })

  const { passwordHash: _, ...safeUser } = user
  res.status(201).json({ success: true, data: { user: safeUser, tokens: { accessToken, refreshToken } } })
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string() })
  const body = schema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401)
  }

  const accessToken = signAccess(user)
  const refreshToken = signRefresh(user.id)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  })

  const { passwordHash: _, ...safeUser } = user
  res.json({ success: true, data: { user: safeUser, tokens: { accessToken, refreshToken } } })
})

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw new AppError('Refresh token required', 400)

  let payload: { sub: string }
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { sub: string }
  } catch {
    throw new AppError('Invalid refresh token', 401)
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.expiresAt < new Date()) throw new AppError('Refresh token expired', 401)

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) throw new AppError('User not found', 404)

  const accessToken = signAccess(user)
  res.json({ success: true, data: { accessToken } })
})

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }
  res.json({ success: true, data: null })
})

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true, updatedAt: true },
  })
  res.json({ success: true, data: user })
})

// PATCH /auth/me
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  const schema = z.object({ name: z.string().optional(), phone: z.string().optional(), avatarUrl: z.string().optional() })
  const data = schema.parse(req.body)
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data,
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true, updatedAt: true },
  })
  res.json({ success: true, data: user })
})

export default router
