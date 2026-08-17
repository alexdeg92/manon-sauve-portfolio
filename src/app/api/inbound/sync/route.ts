import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { syncReceivedEmails } from '@/lib/inbound'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * Admin-triggered pull of received mail. The webhook needs a public URL and can
 * miss a delivery; this threads anything Resend holds that is not stored yet.
 */
export async function POST(req: Request) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { checked, results } = await syncReceivedEmails()
    const counts = results.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    }, {})
    return NextResponse.json({ ok: true, checked, ...counts })
  } catch (err) {
    console.error('POST /api/inbound/sync error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
