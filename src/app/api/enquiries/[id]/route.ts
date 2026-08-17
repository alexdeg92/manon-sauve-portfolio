import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { deleteEnquiry, isEnquiryStatus, setEnquiryStatus } from '@/lib/enquiries'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { status } = await req.json()

    if (!isEnquiryStatus(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const updated = await setEnquiryStatus(params.id, status)
    if (!updated) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/enquiries/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const deleted = await deleteEnquiry(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/enquiries/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
