import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { getSetting, setSetting } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const profilePhoto = await getSetting('profile_photo')
  return NextResponse.json({ profile_photo: profilePhoto })
}

export async function PUT(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  if (!isAuthed(cookie)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { profile_photo } = await req.json()
  await setSetting('profile_photo', profile_photo)
  return NextResponse.json({ ok: true })
}
