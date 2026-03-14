import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  if (!isAuthed(cookie)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const filename = `${Date.now()}-${cleanName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabase.storage
      .from('paintings')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('paintings')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('POST /api/upload error:', err)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}
