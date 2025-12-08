import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function fetchAdmin(email?: string) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')

  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
  }

  const params = email
    ? `select=password_hash,email&email=eq.${encodeURIComponent(email)}&limit=1`
    : `select=password_hash,email&limit=1`

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/admins?${params}`

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`)
  const rows = await res.json()
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

    const admin = await fetchAdmin(email)
    if (!admin || !admin.password_hash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const match = await bcrypt.compare(String(password), admin.password_hash)
    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
