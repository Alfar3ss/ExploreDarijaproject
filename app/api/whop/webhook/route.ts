import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('🔔 Whop webhook:', JSON.stringify(body))

    const event = body.event
    const email = body.data?.user?.email

    console.log('📧 Event:', event, '| Email:', email)

    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

    if (event === 'membership_activated' || event === 'payment_succeeded') {
      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({ plan: 'premium' })
        }
      )
      const data = await patchRes.json()
      console.log('✅ Supabase result:', JSON.stringify(data))
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.log('💥 Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}