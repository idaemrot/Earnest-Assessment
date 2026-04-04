import { z } from 'zod'

// ─── Status enum ──────────────────────────────────────────────────────────────

const TaskStatusEnum = z.enum(['pending', 'completed'], {
  errorMap: () => ({ message: "status must be 'pending' or 'completed'" }),
})

// ─── Create Task ──────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be 255 characters or fewer'),

  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

// ─── Update Task ──────────────────────────────────────────────────────────────

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must be 255 characters or fewer')
      .optional(),

    // null = explicitly clear description; undefined = leave unchanged
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be 2000 characters or fewer')
      .nullable()
      .optional(),

    status: TaskStatusEnum.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    { message: 'At least one field (title, description, status) must be provided' }
  )

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// ─── Get Tasks (query params) ─────────────────────────────────────────────────

export const getTasksQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'page must be a positive integer')
    .transform(Number)
    .refine((n) => n >= 1, 'page must be ≥ 1')
    .optional(),

  limit: z
    .string()
    .regex(/^\d+$/, 'limit must be a positive integer')
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, 'limit must be between 1 and 100')
    .optional(),

  status: TaskStatusEnum.optional(),

  search: z.string().trim().optional(),
})

export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>
