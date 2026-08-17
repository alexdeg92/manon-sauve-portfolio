import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { getAvailability, normalizeAvailability, saveAvailability } from '@/lib/availability'

export const dynamic = 'force-dynamic'
// The Neon driver queries over fetch, and Next's Data Cache will happily serve a
// stale query result inside a route handler — reads then lag a write by one
// state. force-no-store opts every query in this route out of that cache.
export const revalidate = 0
export const fetchCache = 'force-no-store'

/** Public: the studio-visit forms read which days and times to offer. */
export async function GET() {
  const availability = await getAvailability()
  return NextResponse.json(availability, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

export async function PUT(req: Request) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()

    if (!Array.isArray(body?.weekdays) || body.weekdays.length === 0) {
      return NextResponse.json(
        { error: 'Choisissez au moins une journée.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body?.times) || body.times.length === 0) {
      return NextResponse.json({ error: 'Ajoutez au moins une heure.' }, { status: 400 })
    }

    // Normalization drops anything malformed, so check the result before it is
    // written: otherwise an all-invalid payload would persist an empty list and
    // leave the booking form with nothing to offer.
    const candidate = normalizeAvailability(body)

    if (candidate.weekdays.length === 0 || candidate.times.length === 0) {
      return NextResponse.json(
        { error: 'Journées ou heures invalides (format attendu : 14:30).' },
        { status: 400 }
      )
    }

    return NextResponse.json(await saveAvailability(candidate))
  } catch (err) {
    console.error('PUT /api/availability error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
