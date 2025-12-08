import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env not configured for dictionary cache list route')
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function GET(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ error: 'supabase not configured' }, { status: 500 })

    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || '200')

    const { data, error } = await supabase
      .from('dictionary_cache')
      .select('id, cache_key, source_lang, query_text, entry, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Supabase read error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entries: data || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'unexpected' }, { status: 500 })
  }
}
