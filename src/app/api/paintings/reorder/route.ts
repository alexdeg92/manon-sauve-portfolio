import { NextResponse } from 'next/server'
import { isAuthed, reorderPaintings } from '@/lib/paintings-storage'

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  if (!isAuthed(cookie)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids required' }, { status: 400 })

  try {
    await reorderPaintings(ids)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/paintings/reorder error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
