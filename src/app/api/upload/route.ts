import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'

// Images live in Vercel Blob; only the structured catalogue is in the database.
export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  if (!isAuthed(cookie)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const blob = await put(`paintings/${Date.now()}-${cleanName}`, file, {
      access: 'public',
      contentType: file.type || undefined,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('POST /api/upload error:', err)
    const message =
      err instanceof Error && /token/i.test(err.message)
        ? 'BLOB_READ_WRITE_TOKEN manquant.'
        : "Erreur lors de l'upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
