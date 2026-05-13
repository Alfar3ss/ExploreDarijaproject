import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Handle Gumroad test ping (GET)
export async function GET() {
  return NextResponse.json({ ok: true })
}

// Handle real purchases (POST)
export async function POST(req: Request) {
  try {
    const body = await req.formData()
    const email = body.get('email') as string

    console.log('Gumroad purchase:', Object.fromEntries(body.entries()))

    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

    await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY!,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ plan: 'premium' })
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}