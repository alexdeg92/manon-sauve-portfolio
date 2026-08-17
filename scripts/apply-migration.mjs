/**
 * Applies a .sql file to Neon over the HTTP driver, which takes one statement
 * per call, so the file is split on top-level semicolons.
 *
 *   node --env-file=.env.local scripts/apply-migration.mjs migrations/001_init.sql
 */
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const file = process.argv[2]
if (!file) throw new Error('usage: apply-migration.mjs <file.sql>')
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')

const statements = readFileSync(file, 'utf8')
  .replace(/^\s*--.*$/gm, '')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

const sql = neon(process.env.DATABASE_URL)

for (const statement of statements) {
  const label = statement.replace(/\s+/g, ' ').slice(0, 68)
  await sql.query(statement)
  console.log(`  ok  ${label}`)
}

console.log(`\nApplied ${statements.length} statements from ${file}.`)
