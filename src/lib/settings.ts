import { getSupabase } from './supabase'

export async function getSetting(key: string): Promise<string | null> {
  const { data } = await getSupabase().from('settings').select('value').eq('key', key).single()
  return data?.value ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getSupabase().from('settings').upsert({ key, value })
}
