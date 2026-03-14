import { supabase } from './supabase'

export interface Painting {
  id: string
  title: string
  medium: string
  dimensions: string
  price: number | null
  image: string
  year: number
  sold?: boolean
}

export async function getPaintings(): Promise<Painting[]> {
  const { data, error } = await supabase
    .from('paintings')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) { console.error('getPaintings error:', error); return [] }
  return data ?? []
}

export async function savePaintings(paintings: Painting[]): Promise<void> {
  const rows = paintings.map((p, i) => ({ ...p, display_order: i }))
  const { error } = await supabase.from('paintings').upsert(rows, { onConflict: 'id' })
  if (error) throw error
}

export function isAuthed(cookieHeader: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'manon2024'
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  return cookies['admin-session'] === adminPassword
}
