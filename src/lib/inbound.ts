import { addMessage, createEnquiry, findEnquiryByEmail, reopenEnquiry } from './enquiries'
import { getResend } from './mailer'

/** "Manon Sauvé <manon@example.com>" -> { name, email } */
export function parseFrom(from: string): { name: string; email: string } {
  const bracketed = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (bracketed) {
    return {
      name: bracketed[1].replace(/^["']|["']$/g, '').trim() || bracketed[2].trim(),
      email: bracketed[2].trim(),
    }
  }
  const bare = from.trim()
  return { name: bare, email: bare }
}

/**
 * Trims the quoted history a mail client appends, so the thread shows what the
 * person actually wrote rather than the whole chain repeated each time.
 */
export function stripQuotedReply(text: string): string {
  const cutoffs = [
    /^\s*On .+ wrote:\s*$/m,
    /^\s*Le .+ a écrit ?:\s*$/m,
    /^\s*-{2,}\s*Original Message\s*-{2,}\s*$/im,
    /^\s*_{10,}\s*$/m,
    /^\s*De ?:.*$/m,
    /^\s*From ?:.*$/m,
    // Mail-client footers, which would otherwise be quoted back in the thread
    // on every single reply.
    /^\s*Get Outlook for .*$/im,
    /^\s*Sent from my .*$/im,
    /^\s*Envoyé de mon .*$/im,
    /^\s*Obtenez Outlook pour .*$/im,
    /^--\s*$/m,
  ]

  let earliest = text.length
  for (const pattern of cutoffs) {
    const match = text.match(pattern)
    if (match?.index !== undefined && match.index < earliest) earliest = match.index
  }

  const kept = text
    .slice(0, earliest)
    .split('\n')
    .filter((line) => !/^\s*>/.test(line))
    .join('\n')
    .trim()

  return kept || text.trim()
}

const htmlToText = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()

export interface IngestResult {
  status: 'appended' | 'created' | 'duplicate' | 'skipped'
  enquiryId?: string
}

/**
 * Threads one received email into an enquiry. Shared by the webhook and the
 * sync route so both behave identically, and safe to call twice: the message's
 * provider id is UNIQUE, so a repeat is reported as a duplicate rather than
 * appended again or used to reopen a case that was since closed.
 */
export async function ingestReceivedEmail(emailId: string): Promise<IngestResult> {
  const received = await getResend().emails.receiving.get(emailId)

  if (received.error || !received.data) {
    console.error('Could not fetch inbound email', emailId, received.error)
    return { status: 'skipped' }
  }

  const { from, subject, text, html, message_id: messageId } = received.data

  const rawBody = text?.trim() || (html ? htmlToText(html) : '')
  const body = stripQuotedReply(rawBody) || '(message vide)'
  const sender = parseFrom(from)

  const existing = await findEnquiryByEmail(sender.email)

  if (existing) {
    const added = await addMessage({
      enquiryId: existing.id,
      direction: 'inbound',
      body,
      providerId: messageId ?? emailId,
    })
    if (!added) return { status: 'duplicate', enquiryId: existing.id }

    await reopenEnquiry(existing.id)
    return { status: 'appended', enquiryId: existing.id }
  }

  const created = await createEnquiry({
    name: sender.name,
    email: sender.email,
    message: body,
    subject: subject?.trim() || null,
  })
  await addMessage({
    enquiryId: created.id,
    direction: 'inbound',
    body,
    providerId: messageId ?? emailId,
  })

  return { status: 'created', enquiryId: created.id }
}

/**
 * Pulls recent received mail and threads anything not already stored.
 *
 * The webhook is the live path, but it needs a public URL, and a delivery can
 * fail. This closes both gaps: it works from localhost and acts as a backstop.
 */
export async function syncReceivedEmails(): Promise<{
  checked: number
  results: IngestResult[]
}> {
  const list = await getResend().emails.receiving.list()

  if (list.error) {
    console.error('receiving.list failed:', list.error)
    return { checked: 0, results: [] }
  }

  const raw = list.data as unknown
  const emails = (Array.isArray(raw) ? raw : ((raw as { data?: unknown })?.data ?? [])) as {
    id: string
  }[]

  const results: IngestResult[] = []
  for (const email of emails) {
    results.push(await ingestReceivedEmail(email.id))
  }

  return { checked: emails.length, results }
}
