import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'completed'

export interface Task {
  id:          string
  title:       string
  description: string | null
  status:      TaskStatus
  userId:      string
  createdAt:   string
  updatedAt:   string
}

export interface GetTasksParams {
  page?:    number
  limit?:   number
  status?:  TaskStatus
  search?:  string
}

export interface GetTasksResult {
  tasks:      Task[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export interface CreateTaskPayload {
  title:        string
  description?: string
}

export interface UpdateTaskPayload {
  title?:       string
  description?: string | null
  status?:      TaskStatus
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * GET /tasks
 * Paginated + filtered task list for the authenticated user.
 */
export async function getTasks(params: GetTasksParams = {}): Promise<GetTasksResult> {
  const { data } = await api.get('/tasks', { params })
  return data.data as GetTasksResult
}

/**
 * GET /tasks/:id
 */
export async function getTaskById(id: string): Promise<Task> {
  const { data } = await api.get(`/tasks/${id}`)
  return data.data.task as Task
}

/**
 * POST /tasks
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post('/tasks', payload)
  return data.data.task as Task
}

/**
 * PATCH /tasks/:id
 * Partial update — only send fields you want to change.
 */
export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}`, payload)
  return data.data.task as Task
}

/**
 * DELETE /tasks/:id
 */
export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}

/**
 * PATCH /tasks/:id/toggle
 * Flips status: pending ↔ completed.
 */
export async function toggleTask(id: string): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}/toggle`)
  return data.data.task as Task
}
