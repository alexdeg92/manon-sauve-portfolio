import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  if (!isAuthed(cookie)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids required' }, { status: 400 })
  const db = getSupabase()
  const updates = ids.map((id: string, i: number) =>
    db.from('paintings').update({ display_order: i }).eq('id', id)
  )
  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}
