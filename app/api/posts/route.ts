import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function makeHeaders(contentType = 'application/json') {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
  const h: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
  }
  if (contentType) h['Content-Type'] = contentType
  return h
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const params = url.searchParams

    let qs = 'select=*'
    if (params.get('published') === 'true') qs += '&published=eq.true'
    if (params.get('limit')) qs += `&limit=${encodeURIComponent(params.get('limit') || '')}`
    qs += '&order=published_at.desc.nullslast'

    const restUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/posts?${qs}`
    const res = await fetch(restUrl, { headers: makeHeaders(), cache: 'no-store' })

    if (!res.ok) {
      return NextResponse.json({ error: `Supabase error ${res.status}` }, { status: res.status })
    }

    let rows = await res.json()

    //  FIX: remove null, undefined, or malformed posts
    rows = Array.isArray(rows)
      ? rows.filter(p => p && typeof p === 'object' && p.slug)
      : []

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || !body.title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

    const slug = body.slug || (String(body.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now())
    const payload: any = { ...body, slug }
    if (payload.published && !payload.published_at) payload.published_at = new Date().toISOString()

    const restUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/posts`
    const headers = { ...makeHeaders(), Prefer: 'return=representation' }
    const res = await fetch(restUrl, { method: 'POST', headers, body: JSON.stringify(payload) })
    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: `Supabase error: ${res.status} ${txt}` }, { status: res.status })
    }
    const rows = await res.json()
    return NextResponse.json(
  rows && rows[0] ? rows[0] : { error: "Post creation failed" },
  { status: rows && rows[0] ? 200 : 500 }
)

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
