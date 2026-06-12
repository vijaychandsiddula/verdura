import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

// Store uploads in /public/uploads — or swap this for S3 upload in production
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    cb(null, allowed.includes(file.mimetype))
  },
})

// POST /admin/upload — upload a single image
router.post('/upload', authenticate, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided' })
  }

  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`
  const url = `${baseUrl}/uploads/${req.file.filename}`

  res.json({ success: true, data: { url, filename: req.file.filename } })
})

export default router
