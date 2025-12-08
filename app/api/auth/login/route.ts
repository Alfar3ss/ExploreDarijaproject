import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

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

async function fetchUserByEmail(email: string) {
  const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}&limit=1`
  const res = await fetch(url, { headers: supabaseHeaders() })
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`)
  const rows = await res.json()
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

function makeCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 30 // 30 days
  const secure = process.env.NODE_ENV === 'production'
  return `iDarija_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const user = await fetchUserByEmail(String(email).toLowerCase())
    if (!user || !user.password_hash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const match = await bcrypt.compare(String(password), user.password_hash)
    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // create session
    const crypto = await import('crypto')
    const token = crypto.randomBytes(48).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    const sessionUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/sessions`
    const sessionBody = JSON.stringify({ token, user_id: user.id, expires_at: expiresAt })
    const sesRes = await fetch(sessionUrl, { method: 'POST', headers: { ...supabaseHeaders(), Prefer: 'return=representation' }, body: sessionBody })
    if (!sesRes.ok) {
      const text = await sesRes.text()
      throw new Error(`Supabase create session error: ${sesRes.status} ${text}`)
    }

    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } })
    res.headers.set('Set-Cookie', makeCookie(token))
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
