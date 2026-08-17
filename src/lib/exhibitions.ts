import { getSql } from './db'

export interface Exhibition {
  id: string
  year: string
  title: string
  venueFr: string
  venueEn: string | null
  kindFr: string
  kindEn: string | null
  displayOrder: number | null
}

/** English is optional: an empty column falls back to the French text. */
export const localized = (fr: string, en: string | null, lang: 'fr' | 'en') =>
  lang === 'en' ? en?.trim() || fr : fr

export async function listExhibitions(): Promise<Exhibition[]> {
  try {
    const rows = await getSql()`
      SELECT id, year, title,
             venue_fr AS "venueFr", venue_en AS "venueEn",
             kind_fr AS "kindFr", kind_en AS "kindEn",
             display_order AS "displayOrder"
      FROM exhibitions
      ORDER BY display_order ASC NULLS LAST, year DESC
    `
    return rows as Exhibition[]
  } catch (err) {
    console.error('listExhibitions error:', err)
    return []
  }
}

export interface ExhibitionInput {
  year: string
  title: string
  venueFr: string
  venueEn?: string | null
  kindFr: string
  kindEn?: string | null
}

export async function createExhibition(input: ExhibitionInput): Promise<Exhibition> {
  const sql = getSql()
  const next = await sql`SELECT COALESCE(max(display_order) + 1, 0) AS n FROM exhibitions`

  const rows = await sql`
    INSERT INTO exhibitions (id, year, title, venue_fr, venue_en, kind_fr, kind_en, display_order)
    VALUES (${`exh-${Date.now()}`}, ${input.year}, ${input.title}, ${input.venueFr},
            ${input.venueEn?.trim() || null}, ${input.kindFr},
            ${input.kindEn?.trim() || null}, ${next[0].n})
    RETURNING id, year, title,
              venue_fr AS "venueFr", venue_en AS "venueEn",
              kind_fr AS "kindFr", kind_en AS "kindEn",
              display_order AS "displayOrder"
  `
  return rows[0] as Exhibition
}

export async function updateExhibition(
  id: string,
  input: ExhibitionInput
): Promise<Exhibition | null> {
  const sql = getSql()
  const rows = await sql`
    UPDATE exhibitions
    SET year = ${input.year},
        title = ${input.title},
        venue_fr = ${input.venueFr},
        venue_en = ${input.venueEn?.trim() || null},
        kind_fr = ${input.kindFr},
        kind_en = ${input.kindEn?.trim() || null}
    WHERE id = ${id}
    RETURNING id, year, title,
              venue_fr AS "venueFr", venue_en AS "venueEn",
              kind_fr AS "kindFr", kind_en AS "kindEn",
              display_order AS "displayOrder"
  `
  return (rows[0] as Exhibition) ?? null
}

export async function deleteExhibition(id: string): Promise<boolean> {
  const rows = await getSql()`DELETE FROM exhibitions WHERE id = ${id} RETURNING id`
  return rows.length > 0
}

export async function reorderExhibitions(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  await getSql()`
    UPDATE exhibitions AS e
    SET display_order = ordered.position
    FROM (
      SELECT * FROM unnest(${ids}::text[], ${ids.map((_, i) => i)}::int[])
        AS t(id, position)
    ) AS ordered
    WHERE e.id = ordered.id
  `
}
