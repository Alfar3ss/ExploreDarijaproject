import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function supabaseHeaders() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
  }
}

export async function GET() {
  try {
    const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/users?select=id,name,email,created_at&limit=50&order=created_at.desc`
    const res = await fetch(url, { headers: supabaseHeaders() })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Supabase error: ${res.status} ${text}` }, { status: 500 })
    }
    const rows = await res.json()
    return NextResponse.json({ users: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
