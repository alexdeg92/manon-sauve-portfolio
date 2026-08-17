import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let sql: NeonQueryFunction<false, false> | null = null

/**
 * Built on first use, not at import time.
 *
 * `next build` evaluates every route module while collecting page data, so a
 * client created at module scope throws whenever the build environment has no
 * DATABASE_URL. Deferring the call means the build only needs the variable if a
 * request actually hits the database.
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (sql) return sql

  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error('DATABASE_URL is required at runtime (Neon connection string).')
  }

  sql = neon(url)
  return sql
}
