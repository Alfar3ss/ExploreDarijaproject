import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  try {
    // Try both formData and json
    let allData: any = {}
    const contentType = req.headers.get('content-type') || ''
    console.log('🔔 POST received, content-type:', contentType)

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const body = await req.formData()
      allData = Object.fromEntries(body.entries())
    } else {
      const text = await req.text()
      console.log('📝 Raw body:', text)
      try { allData = JSON.parse(text) } catch { allData = { raw: text } }
    }

    console.log('📦 Data:', JSON.stringify(allData))
    const email = allData.email as string

    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

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
    console.log('✅ Supabase result:', JSON.stringify(patchData))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.log('💥 Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}