import BlogListClient from "../../components/blog-list-client"

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

function readingTimeFromContent(html?: string){
  if (!html) return '1 min read'
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export default async function BlogPage(){
  if (!SUPABASE_URL || !SUPABASE_KEY) return (
    <main className="min-h-screen bg-white text-gray-800"><section className="max-w-6xl mx-auto py-16 px-6"> <div className="text-center text-gray-600">Missing Supabase config</div></section></main>
  )

  try{
    const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/posts?select=*&published=eq.true&order=published_at.desc.nullslast`
    const res = await fetch(restUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' }, cache: 'no-store' })
    const rows = await res.json()
    const posts = (Array.isArray(rows) ? rows : []).map((p:any) => ({
      id: p.slug || p.id,
      title: p.title,
      excerpt: p.meta_description || p.description || (p.content ? p.content.replace(/<[^>]+>/g,'').slice(0,160) : ''),
      date: p.published_at ? new Date(p.published_at).toLocaleDateString() : (p.created_at ? new Date(p.created_at).toLocaleDateString() : ''),
      category: p.category || 'Blog',
      readingTime: readingTimeFromContent(p.content),
      audioDarija: p.audioDarija,
      content: p.content || '',
      featured: p.featured || false
    }))

    return (
      <main className="min-h-screen bg-white text-gray-800">
        <section className="max-w-6xl mx-auto py-16 px-6">
          <BlogListClient initialPosts={posts} />
        </section>
      </main>
    )
  }catch(e:any){
    console.error(e)
    return (<main className="min-h-screen bg-white text-gray-800"><section className="max-w-6xl mx-auto py-16 px-6"> <div className="text-center text-gray-600">Error loading posts</div></section></main>)
  }
}
