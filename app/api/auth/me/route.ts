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

function parseCookie(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const parts = cookie.split(';').map((s) => s.trim())
  for (const p of parts) {
    if (p.startsWith('iDarija_session=')) return p.split('=')[1]
  }
  return null
}

export async function GET(req: Request) {
  try {
    const token = parseCookie(req)
    if (!token) return NextResponse.json({ user: null })

    const sessionUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/sessions?select=user_id&token=eq.${encodeURIComponent(token)}&limit=1`
    const sesRes = await fetch(sessionUrl, { headers: supabaseHeaders() })
    if (!sesRes.ok) return NextResponse.json({ user: null })
    const sesRows = await sesRes.json()
    if (!Array.isArray(sesRows) || !sesRows.length) return NextResponse.json({ user: null })
    const userId = sesRows[0].user_id

    const userUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/users?select=id,name,email,plan&limit=1&id=eq.${encodeURIComponent(userId)}`
    const userRes = await fetch(userUrl, { headers: supabaseHeaders() })
    if (!userRes.ok) return NextResponse.json({ user: null })
    const users = await userRes.json()
    if (!Array.isArray(users) || !users.length) return NextResponse.json({ user: null })

    return NextResponse.json({ user: users[0] })
  } catch (e: any) {
    return NextResponse.json({ user: null })
  }
}
