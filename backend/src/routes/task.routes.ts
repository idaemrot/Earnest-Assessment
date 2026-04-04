import { Router } from 'express'
import {
  testTask,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from '../controllers/task.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
} from '../validators/task.validators'

const router = Router()

// ── Public ─────────────────────────────────────────────────────────────────
router.get('/test', testTask)

// ── Protected ──────────────────────────────────────────────────────────────
router.use(authenticate)

// Collection routes
router.get('/',    validate(getTasksQuerySchema, 'query'), getAllTasks)
router.post('/',   validate(createTaskSchema),             createTask)

// Specific sub-resource before generic /:id  (prevents 'toggle' → :id capture)
router.patch('/:id/toggle', toggleTask)

// Generic /:id routes
router.get('/:id',    getTaskById)
router.patch('/:id',  validate(updateTaskSchema), updateTask)
router.delete('/:id', deleteTask)

export default router
