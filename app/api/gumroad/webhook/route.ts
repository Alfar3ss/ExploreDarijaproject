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
    const allData = Object.fromEntries(body.entries())
    console.log('🔔 Full Gumroad POST data:', JSON.stringify(allData))

    const email = body.get('email') as string
    console.log('📧 Email received:', email)

    if (!email) {
      console.log('❌ No email found in request')
      return NextResponse.json({ error: 'No email' }, { status: 400 })
    }

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY!,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ plan: 'premium' })
    })

    const patchData = await patchRes.json()
    console.log('📦 Supabase PATCH result:', JSON.stringify(patchData))

    if (!patchRes.ok) {
      console.log('❌ Supabase PATCH failed:', patchRes.status)
      return NextResponse.json({ error: 'Supabase update failed' }, { status: 500 })
    }

    if (!patchData || patchData.length === 0) {
      console.log('⚠️ No user found with email:', email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User upgraded to premium:', email)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.log('💥 Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}