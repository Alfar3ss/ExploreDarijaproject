import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function supabaseHeaders() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

function parseCookie(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const parts = cookie.split(';').map((s) => s.trim())
  for (const p of parts) {
    if (p.startsWith('iDarija_session=')) return p.split('=')[1]
  }
  return null
}

export async function POST(req: Request) {
  try {
    const token = parseCookie(req)
    if (token) {
      const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/sessions?token=eq.${encodeURIComponent(token)}`
      await fetch(url, { method: 'DELETE', headers: supabaseHeaders() })
    }

    const res = NextResponse.json({ ok: true })
    // clear cookie
    res.headers.set('Set-Cookie', 'iDarija_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax')
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
