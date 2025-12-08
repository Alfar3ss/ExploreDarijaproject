import { MotionDiv } from "../../../components/motion-div"
import PostViewClient from "../../../components/post-view-client"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default async function PostPage({ params }: { params: { id: string } }) {
  const slug = params?.id
  if (!slug) {
    return (
      <main className="min-h-screen bg-white text-gray-800"><section className="max-w-4xl mx-auto py-20 px-6"> <div className="text-center text-gray-600">Post not found</div></section></main>
    )
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
    const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=*`
    const res = await fetch(restUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) {
      return (<main className="min-h-screen bg-white text-gray-800"><section className="max-w-4xl mx-auto py-20 px-6"> <div className="text-center text-gray-600">Post not found</div></section></main>)
    }
    const rows = await res.json()
    const row = Array.isArray(rows) && rows.length ? rows[0] : null
    if (!row) return (<main className="min-h-screen bg-white text-gray-800"><section className="max-w-4xl mx-auto py-20 px-6"> <div className="text-center text-gray-600">Post not found</div></section></main>)

    const post = {
      id: row.slug || row.id,
      title: row.title,
      excerpt: row.meta_description || row.description || '',
      date: row.published_at ? new Date(row.published_at).toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : ''),
      category: row.category || 'Blog',
      readingTime: row.reading_time || '',
      audioDarija: row.audioDarija,
      content: row.content || '',
      meta_title: row.meta_title || '',
      meta_description: row.meta_description || '',
      og_image: row.og_image || row.image || ''
    }

    return (
      <main className="min-h-screen bg-white text-gray-800">
        <section className="max-w-4xl mx-auto py-16 px-6">
          <MotionDiv>
            <h1 className="text-4xl font-bold">{post.title}</h1>
            <div className="text-sm text-gray-500 mt-2">{new Date(post.date).toLocaleDateString()}</div>
          </MotionDiv>

          <article className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          <PostViewClient post={post} />
        </section>
      </main>
    )
  } catch (e: any) {
    return (<main className="min-h-screen bg-white text-gray-800"><section className="max-w-4xl mx-auto py-20 px-6"> <div className="text-center text-gray-600">{String(e?.message || e)}</div></section></main>)
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const slug = params?.id
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!slug || !SUPABASE_URL || !SUPABASE_KEY) return {}
  try {
    const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=*`
    const res = await fetch(restUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) return {}
    const rows = await res.json()
    const row = Array.isArray(rows) && rows.length ? rows[0] : null
    if (!row) return {}

    const title = row.meta_title || row.title || 'Blog'
    const description = row.meta_description || row.description || ''
    const image = row.og_image || row.image || ''

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [image] : undefined,
      },
      robots: row.meta_robots || undefined,
      alternates: undefined,
    }
  } catch (e) {
    return {}
  }
}
