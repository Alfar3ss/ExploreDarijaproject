import { notFound } from 'next/navigation'
import { getPostBySlug } from '../../../lib/blog-data'

const siteUrl = process.env.SITE_URL || 'https://example.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return {
      title: 'Post not found | ExploreDarija',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.description,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      images: post.image ? [{ url: post.image, alt: post.title }] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    robots: post.meta_robots || 'index, follow',
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-5xl space-y-10 rounded-3xl bg-white p-8 shadow-lg shadow-slate-200/50">
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.35em] text-cyan-700">
            <span>{post.category || 'Insights'}</span>
            <span>{new Date(post.date || '').toLocaleDateString()}</span>
            <span>{post.featured ? 'Featured' : 'Blog'}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{post.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">{post.description}</p>
          {post.meta_keywords ? (
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              {post.meta_keywords.split(',').map((keyword) => (
                <span key={keyword.trim()} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">{keyword.trim()}</span>
              ))}
            </div>
          ) : null}
        </header>

        {post.image ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
          </div>
        ) : null}

        <section className="prose prose-slate max-w-none px-1 text-slate-700">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </section>

        
      </article>
    </main>
  )
}
