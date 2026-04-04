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

const router = Router()

// ── Public ─────────────────────────────────────────────────────────────────
// Health check — no auth required
router.get('/test', testTask)

// ── Protected ──────────────────────────────────────────────────────────────
// All task endpoints below require a valid access token
router.use(authenticate)

router.get('/', getAllTasks)
router.post('/', createTask)

// Specific sub-resource routes BEFORE generic /:id to avoid param capture
router.patch('/:id/toggle', toggleTask)

// Generic /:id routes
router.get('/:id', getTaskById)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
