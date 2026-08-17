import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Built on first use, not at import time.
 *
 * `next build` evaluates every route module while collecting page data, so a
 * client created at module scope throws "supabaseUrl is required" whenever the
 * build environment has no credentials — which is the case for Vercel preview
 * builds when the variables are scoped to Production only. Deferring the call
 * means the build only needs them if a request actually hits the database.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required at runtime.'
    )
  }

  client = createClient(url, key)
  return client
}
