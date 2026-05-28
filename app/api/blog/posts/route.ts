import { NextResponse } from 'next/server'
import { getAllPosts, upsertPost } from '../../../../lib/blog-data'

export async function GET() {
  const posts = await getAllPosts()
  return NextResponse.json({ posts })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || !body.slug || !body.title || !body.content || !body.description) {
      return NextResponse.json({ error: 'slug, title, description and content are required' }, { status: 400 })
    }
    const saved = await upsertPost(body)
    return NextResponse.json({ post: saved })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to save post' }, { status: 500 })
  }
}
