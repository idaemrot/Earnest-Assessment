import { Router } from 'express'
import { testAuth, register, login, refresh, logout } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validators'

const router = Router()

// Health check (no validation needed)
router.get('/test', testAuth)

// Auth endpoints with Zod validation
router.post('/register', validate(registerSchema),  register)
router.post('/login',    validate(loginSchema),     login)
router.post('/refresh',  validate(refreshSchema),   refresh)
router.post('/logout',   logout)   // intentionally not validated — idempotent

export default router
