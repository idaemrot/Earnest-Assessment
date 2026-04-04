import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.middleware'

import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json())               // parse JSON bodies
app.use(express.urlencoded({ extended: true }))  // parse URL-encoded bodies

// ─── Base Route ───────────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    version: '1.0.0',
  })
})

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/auth',  authRoutes)
app.use('/tasks', taskRoutes)

// ─── 404 — Unmatched Routes ───────────────────────────────────────────────────
// Must be after all route registrations but BEFORE the error handler.
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be LAST — Express identifies error handlers by their 4-argument signature.
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🚀  Server running on http://localhost:${port}`)
  console.log('\n  Auth endpoints:')
  console.log('    POST  /auth/register')
  console.log('    POST  /auth/login')
  console.log('    POST  /auth/refresh')
  console.log('    POST  /auth/logout')
  console.log('\n  Task endpoints (protected):')
  console.log('    GET    /tasks')
  console.log('    POST   /tasks')
  console.log('    GET    /tasks/:id')
  console.log('    PATCH  /tasks/:id')
  console.log('    DELETE /tasks/:id')
  console.log('    PATCH  /tasks/:id/toggle')
  console.log()
})
