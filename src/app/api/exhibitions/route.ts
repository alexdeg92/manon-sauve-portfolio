import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { createExhibition, listExhibitions } from '@/lib/exhibitions'

export const dynamic = 'force-dynamic'
// The Neon driver queries over fetch, and Next's Data Cache will happily serve a
// stale query result inside a route handler — reads then lag a write by one
// state. force-no-store opts every query in this route out of that cache.
export const revalidate = 0
export const fetchCache = 'force-no-store'

/** Public: the site's Expositions section reads this. */
export async function GET() {
  const exhibitions = await listExhibitions()
  return NextResponse.json(exhibitions, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

export async function POST(req: Request) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const year = String(body.year ?? '').trim()
    const title = String(body.title ?? '').trim()
    const venueFr = String(body.venueFr ?? '').trim()
    const kindFr = String(body.kindFr ?? '').trim()

    if (!year || !title || !venueFr || !kindFr) {
      return NextResponse.json(
        { error: 'Année, titre, lieu et type sont obligatoires.' },
        { status: 400 }
      )
    }

    const created = await createExhibition({
      year,
      title,
      venueFr,
      venueEn: body.venueEn ?? null,
      kindFr,
      kindEn: body.kindEn ?? null,
    })

    return NextResponse.json(created)
  } catch (err) {
    console.error('POST /api/exhibitions error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
