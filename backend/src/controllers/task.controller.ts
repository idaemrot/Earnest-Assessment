import { Request, Response } from 'express'
import { TaskStatus } from '@prisma/client'
import { taskService } from '../services/task.service'
import { asyncHandler } from '../utils/asyncHandler'
import { AppError } from '../utils/AppError'

/**
 * GET /tasks/test
 * Health check for task routes
 */
export const testTask = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Task route is working',
    service: taskService.ping(),
  })
}

/**
 * GET /tasks
 * Header: Authorization: Bearer <accessToken>
 * Query:  ?page=1&limit=10&status=pending&search=fix
 *
 * 200 → { success, data: { tasks, total, page, limit, totalPages } }
 * 400 → invalid page/limit/status params
 * 401 → unauthenticated
 */
export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  // ── Parse + coerce query params ───────────────────────────────────────
  const page  = req.query.page  ? parseInt(req.query.page  as string, 10) : 1
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10

  if (isNaN(page)  || page  < 1) throw new AppError('page must be a positive integer', 400)
  if (isNaN(limit) || limit < 1) throw new AppError('limit must be a positive integer', 400)

  // ── Optional status filter ─────────────────────────────────────────────
  const rawStatus = req.query.status as string | undefined
  const status = rawStatus
    ? (rawStatus as TaskStatus)
    : undefined

  // ── Optional title search ─────────────────────────────────────────────
  const search = req.query.search as string | undefined

  const result = await taskService.getTasksForUser({
    userId,
    page,
    limit,
    status,
    search,
  })

  res.status(200).json({
    success: true,
    data: result,
  })
})

/**
 * GET /tasks/:id
 * Header: Authorization: Bearer <accessToken>
 *
 * 200 → { success, data: { task } }
 * 401 → unauthenticated
 * 404 → task not found or not owned by user
 */
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  const { id } = req.params

  const task = await taskService.getTaskById(id, userId)

  res.status(200).json({
    success: true,
    data: { task },
  })
})

/**
 * POST /tasks
 * Body: { title: string, description?: string }
 * Header: Authorization: Bearer <accessToken>
 *
 * 201 → { success, message, data: { task } }
 * 400 → missing or invalid title
 * 401 → unauthenticated (handled by authenticate middleware)
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId

  // userId is guaranteed by the authenticate middleware,
  // but we narrow the type defensively
  if (!userId) {
    throw new AppError('Unauthorized', 401)
  }

  const { title, description } = req.body

  const task = await taskService.createTask({ title, description, userId })

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  })
})

/**
 * PATCH /tasks/:id
 * Header: Authorization: Bearer <accessToken>
 * Body:   { title?, description?, status? }  — all fields optional, at least one required
 *
 * 200 → { success, message, data: { task } }
 * 400 → no fields provided, or invalid values
 * 401 → unauthenticated
 * 404 → task not found or not owned by user
 */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  const { id } = req.params
  const { title, description, status } = req.body

  const task = await taskService.updateTask({
    taskId: id,
    userId,
    title,
    description,
    status,
  })

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task },
  })
})

/**
 * DELETE /tasks/:id
 * Header: Authorization: Bearer <accessToken>
 *
 * 200 → { success, message }
 * 401 → unauthenticated
 * 404 → task not found or not owned by user
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  const { id } = req.params

  await taskService.deleteTask(id, userId)

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  })
})

/**
 * PATCH /tasks/:id/toggle
 * Header: Authorization: Bearer <accessToken>
 *
 * Flips status: pending → completed, completed → pending.
 * No request body needed.
 *
 * 200 → { success, message, data: { task } }
 * 401 → unauthenticated
 * 404 → task not found or not owned by user
 */
export const toggleTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  const { id } = req.params

  const task = await taskService.toggleTask(id, userId)

  const nextStatus = task.status === 'completed' ? 'completed' : 'pending'

  res.status(200).json({
    success: true,
    message: `Task marked as ${nextStatus}`,
    data: { task },
  })
})
