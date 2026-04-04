import { Task, TaskStatus, Prisma } from '@prisma/client'
import { prisma } from '../prisma/client'
import { AppError } from '../utils/AppError'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  title: string
  description?: string
  userId: string
}

export interface GetTasksInput {
  userId: string
  page?: number      // 1-indexed, default 1
  limit?: number     // default 10, max 100
  status?: TaskStatus
  search?: string    // case-insensitive title substring match
}

export interface GetTasksResult {
  tasks: Task[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateTaskInput {
  taskId: string
  userId: string
  title?: string
  description?: string | null   // null explicitly clears the description
  status?: TaskStatus
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const taskService = {
  /**
   * Connectivity check — called by the test endpoint
   */
  ping: (): string => 'task service is reachable',

  /**
   * Creates a new task owned by the authenticated user.
   *
   * 1. Validates title presence
   * 2. Confirms the owning user exists in DB (defensive)
   * 3. Persists the task with status defaulting to 'pending'
   * 4. Returns the created task
   */
  createTask: async (input: CreateTaskInput): Promise<Task> => {
    const { title, description, userId } = input

    // Step 1 — Validate title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new AppError('Title is required', 400)
    }
    if (title.trim().length > 255) {
      throw new AppError('Title must be 255 characters or fewer', 400)
    }

    // Step 2 — Confirm user exists (the JWT is valid, but account could be deleted)
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!userExists) {
      throw new AppError('User account no longer exists', 401)
    }

    // Step 3 — Create task (status defaults to 'pending' via Prisma schema)
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? null,
        status: TaskStatus.pending,
        userId,
      },
    })

    // Step 4 — Return created task
    return task
  },

  /**
   * Fetches a paginated, optionally filtered and searched list of tasks
   * belonging to the authenticated user.
   *
   * Query params:
   *   page    — 1-indexed page number (default: 1)
   *   limit   — items per page (default: 10, max: 100)
   *   status  — filter by TaskStatus enum ('pending' | 'completed')
   *   search  — case-insensitive substring match on title
   *
   * Uses Prisma's $transaction to run findMany + count in a single round-trip.
   */
  getTasksForUser: async (input: GetTasksInput): Promise<GetTasksResult> => {
    const { userId, search } = input

    // ── Pagination ─────────────────────────────────────────────────────
    const page  = Math.max(1, input.page  ?? 1)
    const limit = Math.min(100, Math.max(1, input.limit ?? 10))
    const skip  = (page - 1) * limit

    // ── Status filter ──────────────────────────────────────────────────
    let statusFilter: TaskStatus | undefined
    if (input.status) {
      if (!Object.values(TaskStatus).includes(input.status)) {
        throw new AppError(
          `Invalid status. Allowed values: ${Object.values(TaskStatus).join(', ')}`,
          400
        )
      }
      statusFilter = input.status
    }

    // ── Build Prisma where clause ──────────────────────────────────────
    const where: Prisma.TaskWhereInput = {
      userId,
      ...(statusFilter && { status: statusFilter }),
      ...(search?.trim() && {
        title: {
          contains: search.trim(),
          mode: 'insensitive',  // case-insensitive (PostgreSQL: ILIKE)
        },
      }),
    }

    // ── Query — count + findMany in one DB round-trip ──────────────────
    const [total, tasks] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * Fetches a single task by ID, scoped to the authenticated user.
   * Returns 404 if not found OR if the task belongs to a different user
   * (ownership check — avoids leaking the existence of other users' tasks).
   */
  getTaskById: async (taskId: string, userId: string): Promise<Task> => {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,          // ownership enforced at query level
      },
    })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    return task
  },

  /**
   * Updates a task — only fields provided in the body are changed (partial update).
   *
   * 1. Validates that at least one field is being updated
   * 2. Validates title length if provided
   * 3. Validates status enum if provided
   * 4. Confirms ownership via findFirst (returns 404 for missing OR other user's tasks)
   * 5. Applies the update
   */
  updateTask: async (input: UpdateTaskInput): Promise<Task> => {
    const { taskId, userId, title, description, status } = input

    // Step 1 — At least one field required
    if (title === undefined && description === undefined && status === undefined) {
      throw new AppError('At least one field (title, description, status) must be provided', 400)
    }

    // Step 2 — Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        throw new AppError('Title cannot be empty', 400)
      }
      if (title.trim().length > 255) {
        throw new AppError('Title must be 255 characters or fewer', 400)
      }
    }

    // Step 3 — Validate status if provided
    if (status !== undefined && !Object.values(TaskStatus).includes(status)) {
      throw new AppError(
        `Invalid status. Allowed values: ${Object.values(TaskStatus).join(', ')}`,
        400
      )
    }

    // Step 4 — Confirm task exists and belongs to this user
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true },
    })

    if (!existing) {
      throw new AppError('Task not found', 404)
    }

    // Step 5 — Build update payload (only include fields that were provided)
    const data: Prisma.TaskUpdateInput = {}
    if (title       !== undefined) data.title       = title.trim()
    if (description !== undefined) data.description = description?.trim() ?? null
    if (status      !== undefined) data.status      = status

    return prisma.task.update({
      where: { id: taskId },
      data,
    })
  },

  /**
   * Deletes a task by ID, scoped to the authenticated user.
   *
   * 1. Confirms the task exists and belongs to this user (404 if not)
   * 2. Deletes the task
   *
   * Uses findFirst + delete (two queries) rather than deleteMany so that
   * we can return a clean 404 vs silently doing nothing when ownership fails.
   */
  deleteTask: async (taskId: string, userId: string): Promise<void> => {
    // Step 1 — Ownership check
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true },
    })

    if (!existing) {
      throw new AppError('Task not found', 404)
    }

    // Step 2 — Delete
    await prisma.task.delete({
      where: { id: taskId },
    })
  },

  /**
   * Toggles a task's status between 'pending' ↔ 'completed'.
   *
   * 1. Fetches the task (with ownership check — returns 404 if absent or not owned)
   * 2. Flips the status
   * 3. Persists and returns the updated task
   *
   * Deliberate choice: read-then-write (2 queries) rather than a raw SQL
   * CASE expression, for clarity and Prisma compatibility.
   */
  toggleTask: async (taskId: string, userId: string): Promise<Task> => {
    // Step 1 — Fetch with ownership check
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    // Step 2 — Compute new status
    const newStatus =
      task.status === TaskStatus.pending
        ? TaskStatus.completed
        : TaskStatus.pending

    // Step 3 — Persist and return
    return prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    })
  },
}
