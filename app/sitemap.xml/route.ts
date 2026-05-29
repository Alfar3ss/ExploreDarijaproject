import { getAllPosts } from '../../lib/blog-data'

export async function GET() {
  const siteUrl = process.env.SITE_URL || 'https://www.exploredarija.com'

  const staticPages = ['/', '/translator', '/pricing', '/booking', '/pricing', '/privacy', '/terms', '/blog']
  let slugs: string[] = []

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (SUPABASE_URL && SUPABASE_KEY) {
      const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/posts?select=slug&published=eq.true`
      const res = await fetch(restUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: 'no-store' })
      if (res.ok) {
        const rows = await res.json()
        slugs = Array.isArray(rows) ? rows.map((r: any) => r.slug).filter(Boolean) : []
      }
    }
  } catch {
    // ignore fetch errors and fall back to local posts
  }

  if (slugs.length === 0) {
    try {
      const posts = await getAllPosts()
      slugs = posts.map((post) => post.slug)
    } catch {
      slugs = []
    }
  }

  const urls = staticPages.map((p) => `<url><loc>${siteUrl}${p}</loc></url>`).join('\n')
  const postsXml = slugs.map((slug) => `<url><loc>${siteUrl}/blog/${slug}</loc></url>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n${postsXml}\n</urlset>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
