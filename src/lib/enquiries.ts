import { getSql } from './db'

export type EnquiryStatus = 'new' | 'replied' | 'closed'

export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'replied', 'closed']

export const isEnquiryStatus = (value: unknown): value is EnquiryStatus =>
  typeof value === 'string' && (ENQUIRY_STATUSES as string[]).includes(value)

export interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  /** Artwork title, or a label such as "Commande" / "Infolettre". */
  subject: string | null
  /** Catalogue id when `subject` matched a work, so the UI can show a thumbnail. */
  paintingId: string | null
  status: EnquiryStatus
  createdAt: string
  repliedAt: string | null
  /** null means unread. Independent of `status`. */
  readAt: string | null
}

export async function listEnquiries(): Promise<Enquiry[]> {
  try {
    const rows = await getSql()`
      SELECT id, name, email, phone, message, subject,
             painting_id AS "paintingId", status,
             created_at AS "createdAt", replied_at AS "repliedAt",
           read_at AS "readAt"
      FROM enquiries
      ORDER BY created_at DESC
    `
    return rows as Enquiry[]
  } catch (err) {
    console.error('listEnquiries error:', err)
    return []
  }
}

export async function countNewEnquiries(): Promise<number> {
  try {
    const rows = await getSql()`SELECT count(*)::int AS n FROM enquiries WHERE status = 'new'`
    return rows[0]?.n ?? 0
  } catch (err) {
    console.error('countNewEnquiries error:', err)
    return 0
  }
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const rows = await getSql()`
    SELECT id, name, email, phone, message, subject,
           painting_id AS "paintingId", status,
           created_at AS "createdAt", replied_at AS "repliedAt",
           read_at AS "readAt"
    FROM enquiries
    WHERE id = ${id}
  `
  return (rows[0] as Enquiry) ?? null
}

export interface NewEnquiry {
  name: string
  email: string
  phone?: string | null
  message: string
  subject?: string | null
}

/**
 * Older callers posted the literal "Non fourni" for a phone they never asked
 * for, which then displayed in the admin as though someone had typed it. An
 * absent phone must be NULL so the panel can simply omit the line.
 */
const PLACEHOLDERS = new Set(['non fourni', 'not provided', '—', '-'])

const realOrNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim()
  if (!trimmed || PLACEHOLDERS.has(trimmed.toLowerCase())) return null
  return trimmed
}

/**
 * Stores a submission and resolves `subject` to a catalogue id when it matches a
 * title, which is how the panel knows which work an enquiry is about. The form
 * posts a title string rather than an id, so the match is done here once at
 * write time instead of on every read.
 */
export async function createEnquiry(input: NewEnquiry): Promise<Enquiry> {
  const sql = getSql()
  const subject = input.subject?.trim() || null

  let paintingId: string | null = null
  if (subject) {
    const match = await sql`SELECT id FROM paintings WHERE lower(title) = lower(${subject}) LIMIT 1`
    paintingId = match[0]?.id ?? null
  }

  const id = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const rows = await sql`
    INSERT INTO enquiries (id, name, email, phone, message, subject, painting_id)
    VALUES (${id}, ${input.name}, ${input.email}, ${realOrNull(input.phone)},
            ${input.message}, ${subject}, ${paintingId})
    RETURNING id, name, email, phone, message, subject,
              painting_id AS "paintingId", status,
              created_at AS "createdAt", replied_at AS "repliedAt",
           read_at AS "readAt"
  `
  return rows[0] as Enquiry
}

/** Returns false when no row carried that id. */
export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<boolean> {
  const rows = await getSql()`
    UPDATE enquiries
    SET status = ${status},
        -- Keep the reply timestamp truthful: only a reply sets it, and moving
        -- back to "new" clears it.
        replied_at = CASE
          WHEN ${status} = 'replied' THEN COALESCE(replied_at, now())
          WHEN ${status} = 'new' THEN NULL
          ELSE replied_at
        END
    WHERE id = ${id}
    RETURNING id
  `
  return rows.length > 0
}

export async function markReplied(id: string): Promise<void> {
  await getSql()`
    UPDATE enquiries SET status = 'replied', replied_at = now() WHERE id = ${id}
  `
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const rows = await getSql()`DELETE FROM enquiries WHERE id = ${id} RETURNING id`
  return rows.length > 0
}

export type MessageDirection = 'inbound' | 'outbound'

/** What GET /api/enquiries returns: the enquiry plus its conversation. */
export interface EnquiryWithThread extends Enquiry {
  messages: EnquiryMessage[]
}

export interface EnquiryMessage {
  id: string
  direction: MessageDirection
  body: string
  createdAt: string
}

export async function listMessages(enquiryId: string): Promise<EnquiryMessage[]> {
  try {
    const rows = await getSql()`
      SELECT id, direction, body, created_at AS "createdAt"
      FROM enquiry_messages
      WHERE enquiry_id = ${enquiryId}
      ORDER BY created_at ASC
    `
    return rows as EnquiryMessage[]
  } catch (err) {
    console.error('listMessages error:', err)
    return []
  }
}

/** Every message for every enquiry, so the panel can load one payload. */
export async function listAllMessages(): Promise<Record<string, EnquiryMessage[]>> {
  try {
    const rows = await getSql()`
      SELECT id, enquiry_id AS "enquiryId", direction, body, created_at AS "createdAt"
      FROM enquiry_messages
      ORDER BY created_at ASC
    `
    const byEnquiry: Record<string, EnquiryMessage[]> = {}
    for (const row of rows as (EnquiryMessage & { enquiryId: string })[]) {
      const { enquiryId, ...message } = row
      byEnquiry[enquiryId] = [...(byEnquiry[enquiryId] ?? []), message]
    }
    return byEnquiry
  } catch (err) {
    console.error('listAllMessages error:', err)
    return {}
  }
}

/**
 * Appends to a thread. `providerId` carries Resend's message id for inbound
 * mail: the column is UNIQUE, so a retried webhook conflicts instead of
 * duplicating, and the insert reports whether it was new.
 */
export async function addMessage(input: {
  enquiryId: string
  direction: MessageDirection
  body: string
  providerId?: string | null
}): Promise<boolean> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const rows = await getSql()`
    INSERT INTO enquiry_messages (id, enquiry_id, direction, body, provider_id)
    VALUES (${id}, ${input.enquiryId}, ${input.direction}, ${input.body},
            ${input.providerId ?? null})
    ON CONFLICT (provider_id) DO NOTHING
    RETURNING id
  `
  return rows.length > 0
}

/**
 * The thread an inbound reply belongs to: the sender's most recent enquiry.
 * Matching on address rather than headers keeps it working when a visitor
 * replies from a client that rewrites References.
 */
export async function findEnquiryByEmail(email: string): Promise<Enquiry | null> {
  const rows = await getSql()`
    SELECT id, name, email, phone, message, subject,
           painting_id AS "paintingId", status,
           created_at AS "createdAt", replied_at AS "repliedAt",
           read_at AS "readAt"
    FROM enquiries
    WHERE lower(email) = lower(${email})
    ORDER BY created_at DESC
    LIMIT 1
  `
  return (rows[0] as Enquiry) ?? null
}

/**
 * Marks read or unread. The caller passes the state it wants rather than a
 * toggle, so a stale row in the UI cannot flip the wrong way.
 */
export async function setEnquiryRead(id: string, read: boolean): Promise<boolean> {
  const rows = read
    ? await getSql()`
        UPDATE enquiries SET read_at = COALESCE(read_at, now())
        WHERE id = ${id} RETURNING id
      `
    : await getSql()`
        UPDATE enquiries SET read_at = NULL WHERE id = ${id} RETURNING id
      `
  return rows.length > 0
}

/** A visitor writing back makes the enquiry outstanding again. */
export async function reopenEnquiry(id: string): Promise<void> {
  // Unread as well: a fresh answer from the visitor is exactly what should
  // resurface in the inbox.
  await getSql()`UPDATE enquiries SET status = 'new', read_at = NULL WHERE id = ${id}`
}
