import { Router } from 'express'
import {
  testTask,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller'

const router = Router()

// Health check
router.get('/test', testTask)

// Task CRUD endpoints (placeholders)
router.get('/', getAllTasks)
router.get('/:id', getTaskById)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
