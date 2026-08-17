import { getSql } from './db'

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

export async function getPaintings(): Promise<Painting[]> {
  try {
    const rows = await getSql()`
      SELECT id, title, medium, dimensions, price::float8 AS price, image, year,
             sold, collection, note
      FROM paintings
      ORDER BY display_order ASC NULLS LAST, title ASC
    `
    return rows as Painting[]
  } catch (err) {
    console.error('getPaintings error:', err)
    return []
  }
}

/**
 * Upserts every row and rewrites display_order from the array order.
 *
 * Deliberately does not delete rows that are absent from `paintings`: callers
 * build their argument on top of getPaintings(), which returns [] when the read
 * fails, so a delete-what-is-missing sync would empty the table on a transient
 * read error. Removals go through deletePainting instead.
 */
export async function savePaintings(paintings: Painting[]): Promise<void> {
  if (paintings.length === 0) return

  await getSql()`
    INSERT INTO paintings (id, title, medium, dimensions, price, image, year,
                           sold, collection, note, display_order)
    SELECT * FROM unnest(
      ${paintings.map((p) => p.id)}::text[],
      ${paintings.map((p) => p.title)}::text[],
      ${paintings.map((p) => p.medium)}::text[],
      ${paintings.map((p) => p.dimensions)}::text[],
      ${paintings.map((p) => p.price)}::numeric[],
      ${paintings.map((p) => p.image)}::text[],
      ${paintings.map((p) => p.year)}::int[],
      ${paintings.map((p) => p.sold ?? false)}::boolean[],
      ${paintings.map((p) => p.collection ?? null)}::text[],
      ${paintings.map((p) => p.note ?? null)}::text[],
      ${paintings.map((_, i) => i)}::int[]
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      medium = EXCLUDED.medium,
      dimensions = EXCLUDED.dimensions,
      price = EXCLUDED.price,
      image = EXCLUDED.image,
      year = EXCLUDED.year,
      sold = EXCLUDED.sold,
      collection = EXCLUDED.collection,
      note = EXCLUDED.note,
      display_order = EXCLUDED.display_order
  `
}

/** Returns false when no row carried that id. */
export async function deletePainting(id: string): Promise<boolean> {
  const rows = await getSql()`DELETE FROM paintings WHERE id = ${id} RETURNING id`
  return rows.length > 0
}

export async function reorderPaintings(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  await getSql()`
    UPDATE paintings AS p
    SET display_order = ordered.position
    FROM (
      SELECT * FROM unnest(${ids}::text[], ${ids.map((_, i) => i)}::int[])
        AS t(id, position)
    ) AS ordered
    WHERE p.id = ordered.id
  `
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
