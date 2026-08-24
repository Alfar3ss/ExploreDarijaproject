import { NextResponse } from 'next/server'
import { fetchProductBySlug } from '../../../../lib/shop-products'

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Product slug is required' }, { status: 400 })

  const product = await fetchProductBySlug(slug)
  const fileUrl = product?.digitalFileUrl || product?.downloadUrl
  if (!fileUrl) return NextResponse.json({ error: 'No digital file is configured for this product' }, { status: 404 })

  try {
    const fileResponse = await fetch(fileUrl, { cache: 'no-store' })
    if (!fileResponse.ok || !fileResponse.body) return NextResponse.json({ error: 'The digital file could not be downloaded' }, { status: 502 })
    const headers = new Headers({
      'Content-Disposition': `attachment; filename="${product.slug}.pdf"`,
      'Content-Type': fileResponse.headers.get('content-type') || 'application/pdf',
      'Cache-Control': 'private, no-store',
    })
    return new Response(fileResponse.body, { headers })
  } catch {
    return NextResponse.json({ error: 'The digital file could not be downloaded' }, { status: 502 })
  }
}