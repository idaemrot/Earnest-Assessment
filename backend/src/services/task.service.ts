/**
 * Task Service
 * Business logic for task management will live here.
 * (CRUD operations, filtering, authorization checks, etc.)
 */
export const taskService = {
  /**
   * Connectivity check — called by the controller test endpoint
   */
  ping: (): string => 'task service is reachable',
}
