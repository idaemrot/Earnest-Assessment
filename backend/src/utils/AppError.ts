/**
 * AppError — Typed HTTP error for controlled error handling.
 * Throw this anywhere in the service/controller layer to send
 * a clean JSON error response with the correct status code.
 *
 * @example
 *   throw new AppError('User not found', 404)
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Maintain proper stack trace
    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}
