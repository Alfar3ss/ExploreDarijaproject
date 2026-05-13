import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: Request) {
  try {
    const body = await req.formData()
    
    const email = body.get('email') as string
    const productPermalink = body.get('product_permalink') as string
    
    // make sure it's your product
    if (productPermalink !== 'darijapremium') {
      return NextResponse.json({ error: 'Wrong product' }, { status: 400 })
    }

    // find user by email and upgrade to premium
    await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY!,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan: 'premium' })
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}