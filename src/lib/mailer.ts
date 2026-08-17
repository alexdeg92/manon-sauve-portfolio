import { Resend } from 'resend'

/** Where visitor submissions are delivered. */
export const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'manonsauve65@hotmail.com'

/** Must stay on a Resend-verified domain (manonsauve.art) or sends are rejected. */
export const CONTACT_FROM =
  process.env.CONTACT_FROM_EMAIL || 'Site manonsauve.art <contact@manonsauve.art>'

/**
 * Where a visitor's reply should land. With Resend receiving enabled on
 * manonsauve.art, replies must come back to the receiving address so the inbound
 * webhook can thread them in the portal. Pointing this at Manon's personal inbox
 * instead would mean her conversations bypass the system entirely.
 */
export const CONTACT_INBOX =
  process.env.CONTACT_INBOX_EMAIL || extractAddress(CONTACT_FROM)

/** "Site manonsauve.art <contact@manonsauve.art>" -> "contact@manonsauve.art" */
function extractAddress(value: string): string {
  return value.match(/<([^>]+)>/)?.[1]?.trim() ?? value.trim()
}

let resend: Resend | null = null

/** Built on first use so `next build` does not need the key. */
export function getResend(): Resend {
  if (resend) return resend

  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is required at runtime.')

  resend = new Resend(key)
  return resend
}

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Body text is visitor- or artist-supplied, so it must not inject markup. */
export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c])

/** Wraps a message in the same light shell both outgoing mails use. */
export const emailShell = (inner: string) =>
  `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a">${inner}</div>`
