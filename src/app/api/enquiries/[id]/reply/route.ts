import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { addMessage, getEnquiry, markReplied, setEnquiryRead } from '@/lib/enquiries'
import { CONTACT_FROM, CONTACT_INBOX, emailShell, escapeHtml, getResend } from '@/lib/mailer'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * Sends Manon's reply to the person who wrote in, then marks the enquiry replied.
 * The status is only moved after Resend accepts the message, so a failed send
 * leaves the enquiry in the inbox rather than silently marking it handled.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { body } = await req.json()
    const reply = String(body ?? '').trim()

    if (!reply) {
      return NextResponse.json({ error: 'Écrivez une réponse.' }, { status: 400 })
    }

    const enquiry = await getEnquiry(params.id)
    if (!enquiry) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    const subject = enquiry.subject
      ? `Re : ${enquiry.subject}`
      : 'Re : votre message à Manon Sauvé'

    const { error } = await getResend().emails.send({
      from: CONTACT_FROM,
      to: [enquiry.email],
      // Back to the receiving address, not Manon's inbox: that is what lets the
      // visitor's answer return through the inbound webhook and join the thread.
      replyTo: CONTACT_INBOX,
      subject,
      text: `${reply}\n\n—\nManon Sauvé\nmanonsauve.art`,
      html: emailShell(
        `<div style="white-space:pre-wrap">${escapeHtml(reply)}</div>` +
          `<p style="margin-top:22px;color:#666;font-size:13px">—<br>Manon Sauvé<br>` +
          `<a href="https://manonsauve.art" style="color:#666">manonsauve.art</a></p>`
      ),
    })

    if (error) {
      console.error('Resend reply error:', error)
      return NextResponse.json(
        { error: error.message || "L'envoi a échoué." },
        { status: 502 }
      )
    }

    await addMessage({ enquiryId: params.id, direction: 'outbound', body: reply })
    await markReplied(params.id)
    // Answering it is the strongest possible signal that it has been read.
    await setEnquiryRead(params.id, true)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/enquiries/[id]/reply error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
