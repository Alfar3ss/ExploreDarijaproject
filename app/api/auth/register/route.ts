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

async function insertUser(name: string, email: string, passwordHash: string) {
  const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/users`
  const body = JSON.stringify({ name, email, password_hash: passwordHash })
  const headers = { ...supabaseHeaders(), Prefer: 'return=representation' }
  const res = await fetch(url, { method: 'POST', headers, body })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase insert user error: ${res.status} ${text}`)
  }
  const rows = await res.json()
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

function makeCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 30 // 30 days
  // Do not set Secure in dev (localhost), but allow secure in prod via env
  const secure = process.env.NODE_ENV === 'production'
  return `iDarija_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body || {}
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const saltRounds = 10
    const hash = await bcrypt.hash(String(password), saltRounds)

    const user = await insertUser(name || null, String(email).toLowerCase(), hash)
    if (!user) return NextResponse.json({ error: 'Unable to create user' }, { status: 500 })

    // Create session
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
