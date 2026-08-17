import { NextRequest, NextResponse } from 'next/server'
import { createEnquiry } from '@/lib/enquiries'
import { CONTACT_FROM, CONTACT_TO, emailShell, escapeHtml, getResend } from '@/lib/mailer'

/**
 * Contact, commission, studio-visit and newsletter forms all post the same
 * { name, email, phone, message, painting } shape here and check `success`,
 * so every caller keeps working: only the transport changed from the ngrok
 * relay to Resend.
 *
 * The submission is stored in Neon first and emailed second. If Resend fails the
 * request still succeeds, because the enquiry is already saved and visible in the
 * admin — losing a potential sale to a mail outage is worse than a missing
 * notification. A failed store, by contrast, is a real error.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const message = String(body.message ?? '').trim()
    const painting = String(body.painting ?? '').trim()

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Adresse courriel invalide' },
        { status: 400 }
      )
    }

    await createEnquiry({
      name,
      email,
      phone: phone || null,
      message,
      subject: painting || null,
    })

    const fields: [string, string][] = [
      ['Nom', name],
      ['Courriel', email],
      ['Téléphone', phone || 'Non fourni'],
      ['Objet', painting || '—'],
    ]

    const text = [...fields.map(([k, v]) => `${k} : ${v}`), '', message].join('\n')

    const html = emailShell(
      `<table cellpadding="0" cellspacing="0" style="margin-bottom:20px">${fields
        .map(
          ([k, v]) =>
            `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td>` +
            `<td style="padding:2px 0"><strong>${escapeHtml(v)}</strong></td></tr>`
        )
        .join('')}</table>` +
        `<div style="white-space:pre-wrap;border-left:2px solid #ddd;padding-left:14px">${escapeHtml(
          message
        )}</div>`
    )

    try {
      const { error } = await getResend().emails.send({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        replyTo: email, // so replying in the inbox answers the visitor directly
        subject: painting ? `${painting} — ${name}` : `Nouveau message du site — ${name}`,
        text,
        html,
      })
      if (error) console.error('Resend send error (enquiry was still saved):', error)
    } catch (mailError) {
      console.error('Resend threw (enquiry was still saved):', mailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    )
  }
}
