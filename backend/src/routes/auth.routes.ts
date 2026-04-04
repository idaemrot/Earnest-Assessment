import { Router } from 'express'
import { testAuth, register, login } from '../controllers/auth.controller'

const router = Router()

// Health check
router.get('/test', testAuth)

// Auth endpoints (placeholders)
router.post('/register', register)
router.post('/login', login)

export default router
