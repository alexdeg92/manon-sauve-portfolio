import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { deleteExhibition, updateExhibition } from '@/lib/exhibitions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const updated = await updateExhibition(params.id, {
      year,
      title,
      venueFr,
      venueEn: body.venueEn ?? null,
      kindFr,
      kindEn: body.kindEn ?? null,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Exposition non trouvée' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT /api/exhibitions/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const deleted = await deleteExhibition(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Exposition non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/exhibitions/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
