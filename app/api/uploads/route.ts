import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return NextResponse.json({ error: 'Supabase storage is not configured' }, { status: 500 })
    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    const kind = formData.get('kind') === 'file' ? 'file' : 'image'
    if (kind === 'image' && !file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    if (kind === 'file' && file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'Files must be smaller than 25 MB' }, { status: 400 })

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const bucket = kind === 'file' ? 'product-files' : 'product-images'
    const path = `products/${crypto.randomUUID()}.${extension}`
    const uploadResponse = await fetch(`${url.replace(/\/$/, '')}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': file.type, 'x-upsert': 'false' },
      body: await file.arrayBuffer(),
    })
    if (!uploadResponse.ok) return NextResponse.json({ error: await uploadResponse.text() }, { status: uploadResponse.status })
    return NextResponse.json({ ok: true, url: `${url.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${path}` })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload image' }, { status: 500 })
  }
}
