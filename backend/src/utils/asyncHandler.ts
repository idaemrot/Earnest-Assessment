import { Request, Response, NextFunction, RequestHandler } from 'express'

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>

/**
 * Wraps an async Express controller so that any thrown error
 * is automatically forwarded to the global error handler via next().
 *
 * Eliminates the need for try/catch boilerplate in every controller.
 *
 * @example
 *   router.post('/register', asyncHandler(register))
 */
export const asyncHandler =
  (fn: AsyncController): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
