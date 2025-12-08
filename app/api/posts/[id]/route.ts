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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()
    if (!body) return NextResponse.json({ error: 'Missing body' }, { status: 400 })

    // update by slug
    const restUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/posts?slug=eq.${encodeURIComponent(id)}`
    if (body.published && !body.published_at) body.published_at = new Date().toISOString()

    const headers = { ...makeHeaders(), Prefer: 'return=representation' }
    const res = await fetch(restUrl, { method: 'PATCH', headers, body: JSON.stringify(body) })
    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: `Supabase error: ${res.status} ${txt}` }, { status: res.status })
    }
    const rows = await res.json()
    return NextResponse.json(rows?.[0] ?? null)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const restUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/posts?slug=eq.${encodeURIComponent(id)}`
    const headers = makeHeaders(null as any)
    const res = await fetch(restUrl, { method: 'DELETE', headers })
    if (!res.ok) return NextResponse.json({ error: `Supabase error ${res.status}` }, { status: res.status })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const restUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/posts?slug=eq.${encodeURIComponent(id)}&select=*`
    const res = await fetch(restUrl, { headers: makeHeaders(), cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: `Supabase error ${res.status}` }, { status: res.status })
    const rows = await res.json()
    return NextResponse.json(rows?.[0] ?? null)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
