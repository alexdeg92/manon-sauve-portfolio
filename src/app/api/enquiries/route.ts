import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/paintings-storage'
import { listAllMessages, listEnquiries } from '@/lib/enquiries'

export const dynamic = 'force-dynamic'
// The Neon driver queries over fetch, and Next's Data Cache will happily serve a
// stale query result inside a route handler — reads then lag a write by one
// state. force-no-store opts every query in this route out of that cache.
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: Request) {
  if (!isAuthed(req.headers.get('cookie') || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Threads come along so the panel renders a conversation without a second
  // round trip per enquiry.
  const [enquiries, messages] = await Promise.all([listEnquiries(), listAllMessages()])
  const withThreads = enquiries.map((e) => ({ ...e, messages: messages[e.id] ?? [] }))

  return NextResponse.json(withThreads, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}
