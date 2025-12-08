import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function supabaseHeaders() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const post_id = searchParams.get('post_id')
  let url = ''
  if (post_id) {
    url = `${SUPABASE_URL}/rest/v1/comments?post_id=eq.${encodeURIComponent(post_id)}&order=created_at.desc`
  } else {
    url = `${SUPABASE_URL}/rest/v1/comments?order=created_at.desc`
  }
  const res = await fetch(url, { headers: supabaseHeaders() })
  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text }, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json({ comments: data })
}

export async function POST(req: Request) {
  try {
    const { post_id, author_name, author_email, text } = await req.json()
    if (!post_id || !author_name || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const url = `${SUPABASE_URL}/rest/v1/comments`
    const res = await fetch(url, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ post_id, author_name, author_email, text })
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json({ comment: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
