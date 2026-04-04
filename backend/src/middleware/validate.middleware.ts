import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

type RequestTarget = 'body' | 'query' | 'params'

/**
 * Generic Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), registerController)
 *   router.get('/',          validate(getTasksQuerySchema, 'query'), getAllTasks)
 *
 * On success:  replaces req[target] with the parsed + coerced Zod output.
 * On failure:  calls next(ZodError) — handled by the global errorHandler.
 */
export const validate =
  (schema: ZodSchema, target: RequestTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      // Forward the raw ZodError — errorHandler formats it into a clean 400
      return next(result.error)
    }

    // Replace the target with the fully parsed + coerced data
    // (e.g. email lowercased, page/limit cast to number)
    ;(req as any)[target] = result.data

    next()
  }
