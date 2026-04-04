// src/types/express/index.d.ts
//
// Augments Express's Request interface to include `userId`.
// This is populated by the `authenticate` middleware after token verification.
//
// TypeScript merges this declaration with the Express namespace automatically
// because it lives inside `src/` which is included in tsconfig.json.

declare namespace Express {
  interface Request {
    userId?: string
  }
}
