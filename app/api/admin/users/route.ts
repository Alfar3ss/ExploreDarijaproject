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
    const url = `${SUPABASE_URL}/rest/v1/users?select=id,name,email,is_active,plan`
    const res = await fetch(url, { headers: supabaseHeaders() })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json({ users: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, plan } = await req.json()
    if (!id || !plan) {
      return NextResponse.json({ error: 'Missing id or plan' }, { status: 400 })
    }
    const url = `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...supabaseHeaders(),
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ plan })
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json({ user: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
