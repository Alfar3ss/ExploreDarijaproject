export async function GET() {
  const siteUrl = process.env.SITE_URL || 'https://example.com'

  // static pages to include
  const staticPages = ['/', '/pricing', '/booking', '/contact', '/privacy', '/terms', '/blog']

  let postsXml = ''
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (SUPABASE_URL && SUPABASE_KEY) {
      const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/posts?select=slug&published=eq.true`
      const res = await fetch(restUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: 'no-store' })
      if (res.ok) {
        const rows = await res.json()
        const slugs = Array.isArray(rows) ? rows.map((r: any) => r.slug).filter(Boolean) : []
        postsXml = slugs.map((s: string) => `<url><loc>${siteUrl}/blog/${s}</loc></url>`).join('\n')
      }
    }
  } catch (e) {
    // ignore fetch errors and fall back to static pages
  }

  const urls = staticPages.map(p => `<url><loc>${siteUrl}${p}</loc></url>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n${postsXml}\n</urlset>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
