import { NextResponse } from 'next/server'
import { normalizeProduct } from '../../../../lib/shop-products'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function supabaseHeaders() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' }
}

function productPayload(input: Record<string, unknown>) {
  return {
    title: String(input.title || '').trim(),
    slug: String(input.slug || input.title || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: String(input.description || '').trim(),
    price: input.price === '' || input.price === undefined ? null : Number(input.price),
    currency: String(input.currency || 'USD').toUpperCase(),
    type: String(input.type || 'Digital download').trim(),
    included: String(input.included || '').trim(),
    format: String(input.format || '').trim(),
    language: String(input.language || '').trim(),
    label: String(input.label || '').trim() || null,
    color: String(input.color || '').trim() || null,
    image_urls: Array.isArray(input.imageUrls) ? input.imageUrls.filter((image): image is string => typeof image === 'string' && Boolean(image.trim())).slice(0, 4) : [],
    checkout_url: String(input.checkoutUrl || '').trim() || null,
    whop_token: String(input.whopToken || '').trim() || null,
    download_url: String(input.downloadUrl || '').trim() || null,
    digital_file_url: String(input.digitalFileUrl || '').trim() || null,
    is_new: Boolean(input.isNew),
    featured: Boolean(input.featured),
  }
}

export async function GET() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, { headers: supabaseHeaders(), cache: 'no-store' })
    const data = await response.json()
    const products = Array.isArray(data) ? data.map(normalizeProduct).filter((product): product is NonNullable<ReturnType<typeof normalizeProduct>> => Boolean(product)) : []
    return NextResponse.json(response.ok ? { products } : { error: data }, { status: response.ok ? 200 : response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = productPayload(await request.json())
    if (!payload.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, { method: 'POST', headers: { ...supabaseHeaders(), 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) })
    const data = await response.json()
    return NextResponse.json(response.ok ? { product: data[0] } : { error: data }, { status: response.ok ? 201 : response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create product' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...input } = await request.json()
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 })
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...supabaseHeaders(), 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(productPayload(input)) })
    const data = await response.json()
    return NextResponse.json(response.ok ? { product: data[0] } : { error: data }, { status: response.ok ? 200 : response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 })
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { ...supabaseHeaders(), Prefer: 'return=minimal' } })
    return response.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: await response.text() }, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete product' }, { status: 500 })
  }
}