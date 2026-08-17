import { getSupabase } from './supabase'

export interface Painting {
  id: string
  title: string
  medium: string
  dimensions: string
  price: number | null
  image: string
  year: number
  sold?: boolean
  collection?: string | null
  note?: string | null
}

/**
 * Columns added by migrations/001_add_collection_and_note.sql. Until that has
 * run, writing them fails; savePaintings retries without them so a save never
 * breaks on a database that has not been migrated yet.
 */
const OPTIONAL_COLUMNS = ['collection', 'note'] as const

export async function getPaintings(): Promise<Painting[]> {
  const { data, error } = await getSupabase()
    .from('paintings')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) { console.error('getPaintings error:', error); return [] }
  return data ?? []
}

export async function savePaintings(paintings: Painting[]): Promise<void> {
  const rows = paintings.map((p, i) => ({ ...p, display_order: i }))
  const { error } = await getSupabase().from('paintings').upsert(rows, { onConflict: 'id' })
  if (!error) return

  const missing = OPTIONAL_COLUMNS.filter((column) => error.message?.includes(column))
  if (missing.length === 0) throw error

  console.warn(`paintings table is missing ${missing.join(', ')}; saving without them`)
  const stripped = rows.map((row) => {
    const copy: Record<string, unknown> = { ...row }
    missing.forEach((column) => delete copy[column])
    return copy
  })
  const retry = await getSupabase().from('paintings').upsert(stripped, { onConflict: 'id' })
  if (retry.error) throw retry.error
}

export function isAuthed(cookieHeader: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'manon2024'
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  return cookies['admin-session'] === adminPassword
}
