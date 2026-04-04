import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.middleware'

import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────
app.use(express.json())

// ─── Base Route ───────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is running', version: '1.0.0' })
})

// ─── Routes ───────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)

// ─── 404 Handler ─────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` })
})

// ─── Global Error Handler ─────────────────────────────
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
  console.log(`   GET  /          → API health`)
  console.log(`   GET  /auth/test → Auth route test`)
  console.log(`   GET  /tasks/test → Task route test`)
})
