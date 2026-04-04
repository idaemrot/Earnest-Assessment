import { Router } from 'express'
import { testAuth, register, login, refresh, logout } from '../controllers/auth.controller'

const router = Router()

// Health check
router.get('/test', testAuth)

// Auth endpoints
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router
