import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env not configured for dictionary cache route')
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null

// Expected table schema (SQL example, not enforced here):
// CREATE TABLE dictionary_cache (
//   id text PRIMARY KEY,
//   cache_key text UNIQUE,
//   source_lang text,
//   query_text text,
//   entry jsonb,
//   created_at timestamptz DEFAULT now()
// );

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const cacheKey = url.searchParams.get('key')
    if (!cacheKey) return NextResponse.json({ error: 'missing key' }, { status: 400 })

    if (!supabase) return NextResponse.json({ found: false })

    const { data, error } = await supabase
      .from('dictionary_cache')
      .select('entry')
      .eq('cache_key', cacheKey)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Supabase read error', error)
      return NextResponse.json({ found: false })
    }

    if (!data) return NextResponse.json({ found: false })

    return NextResponse.json({ found: true, entry: data.entry })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'unexpected' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cacheKey, sourceLang, queryText, entry } = body
    if (!cacheKey || !entry) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

    if (!supabase) return NextResponse.json({ ok: false, message: 'supabase not configured' })

    // Upsert by cache_key
    const payload = {
      cache_key: cacheKey,
      source_lang: sourceLang || null,
      query_text: queryText || null,
      entry,
    }

    const { error } = await supabase
      .from('dictionary_cache')
      .upsert(payload, { onConflict: 'cache_key' })

    if (error) {
      console.warn('Supabase upsert error', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'unexpected' }, { status: 500 })
  }
}
