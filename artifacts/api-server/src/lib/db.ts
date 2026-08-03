// Re-export the shared Drizzle client and all schema types from @workspace/db.
// The pool and db instance are initialised there using DATABASE_URL.
export { db, pool } from "@workspace/db";
export * from "@workspace/db";
