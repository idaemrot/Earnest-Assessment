import { Router } from 'express'
import {
  testTask,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// ── Public ─────────────────────────────────────────────────────────────────
// Health check — no auth required
router.get('/test', testTask)

// ── Protected ──────────────────────────────────────────────────────────────
// All task CRUD endpoints require a valid access token
router.use(authenticate)

router.get('/', getAllTasks)
router.get('/:id', getTaskById)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
