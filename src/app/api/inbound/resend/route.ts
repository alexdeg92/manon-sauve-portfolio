import { NextResponse } from 'next/server'
import { getResend } from '@/lib/mailer'
import { ingestReceivedEmail } from '@/lib/inbound'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * Resend inbound webhook for manonsauve.art.
 *
 * A visitor replying to one of Manon's answers arrives here, gets appended to
 * their thread, and puts the enquiry back in "new" so it resurfaces in Demandes.
 * Mail from an address with no prior enquiry opens a new one, so nothing is lost.
 *
 * Set the endpoint in Resend to POST https://<domain>/api/inbound/resend and put
 * its signing secret in RESEND_WEBHOOK_SECRET.
 */

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET

  if (!secret) {
    // Fail closed: an unverified public endpoint that writes to the inbox would
    // let anyone inject enquiries.
    console.error('RESEND_WEBHOOK_SECRET is not set; refusing inbound webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  // The signature covers the exact bytes, so the raw body must be used here —
  // parsing to JSON and re-stringifying invalidates it.
  const raw = await req.text()

  let event
  try {
    event = getResend().webhooks.verify({
      payload: raw,
      headers: {
        id: req.headers.get('svix-id') ?? '',
        timestamp: req.headers.get('svix-timestamp') ?? '',
        signature: req.headers.get('svix-signature') ?? '',
      },
      webhookSecret: secret,
    })
  } catch (err) {
    console.error('Inbound webhook signature rejected:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type !== 'email.received') {
    // Other subscribed events are acknowledged so Resend stops retrying.
    return NextResponse.json({ ok: true, ignored: event.type })
  }

  try {
    const result = await ingestReceivedEmail(event.data.email_id)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('POST /api/inbound/resend error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
