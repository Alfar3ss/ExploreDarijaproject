export type Product = {
  id: string
  slug: string
  title: string
  description: string
  price: string
  type: string
  included: string
  format: string
  language: string
  label: string
  color: string
  imageUrls: string[]
  imageUrl?: string
  checkoutUrl?: string
  whopToken?: string
  downloadUrl?: string
  digitalFileUrl?: string
  isNew?: boolean
  featured?: boolean
}

const colors = ['bg-[#f4a261]', 'bg-[#70a9a1]', 'bg-[#e76f51]', 'bg-[#264653]', 'bg-[#8ab17d]']

function asBoolean(value: unknown) {
  return value === true || value === 1 || value === 'true'
}

function formatPrice(value: unknown, currency = 'USD') {
  if (typeof value === 'string' && value.trim()) return value.startsWith('$') ? value : `${value} ${currency}`
  if (typeof value === 'number') return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
  return 'Price unavailable'
}

export function normalizeProduct(record: Record<string, unknown>, index: number): Product | null {
  const title = String(record.title || record.name || '').trim()
  if (!title) return null
  const slug = String(record.slug || record.handle || productSlug(title))
  const currency = String(record.currency || 'USD').toUpperCase()
  return {
    id: String(record.id || slug),
    slug,
    title,
    description: String(record.description || record.summary || ''),
    price: formatPrice(record.price, currency),
    type: String(record.type || record.category || 'Digital download'),
    included: String(record.included || "Examples, exercises, quick-reference pages"),
    format: String(record.format || 'PDF guide, made for phone or print'),
    language: String(record.language || 'Moroccan Darija + English'),
    label: String(record.label || String(index + 1).padStart(2, '0')),
    color: String(record.color || colors[index % colors.length]),
    imageUrls: Array.isArray(record.image_urls) ? record.image_urls.filter((image): image is string => typeof image === 'string' && image.trim() !== '') : typeof record.image_url === 'string' && record.image_url.trim() ? [record.image_url] : [],
    imageUrl: typeof record.image_url === 'string' ? record.image_url : typeof record.imageUrl === 'string' ? record.imageUrl : undefined,
    checkoutUrl: typeof record.checkout_url === 'string' ? record.checkout_url : typeof record.checkoutUrl === 'string' ? record.checkoutUrl : undefined,
    whopToken: typeof record.whop_token === 'string' ? record.whop_token : undefined,
    downloadUrl: typeof record.download_url === 'string' ? record.download_url : undefined,
    digitalFileUrl: typeof record.digital_file_url === 'string' ? record.digital_file_url : undefined,
    isNew: asBoolean(record.is_new ?? record.isNew),
    featured: asBoolean(record.featured),
  }
}

export async function fetchProducts() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/products?select=*&order=created_at.desc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    if (!response.ok) return []
    const records = await response.json()
    return Array.isArray(records) ? records.map(normalizeProduct).filter((product): product is Product => Boolean(product)) : []
  } catch {
    return []
  }
}

export async function fetchProductBySlug(slug: string) {
  const allProducts = await fetchProducts()
  return allProducts.find((product) => product.slug === slug || productSlug(product.title) === slug)
}

export function productSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
