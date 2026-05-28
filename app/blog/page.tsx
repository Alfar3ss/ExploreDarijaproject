import BlogListClient from '../../components/blog-list-client'
import { getAllPosts } from '../../lib/blog-data'

export const metadata = {
  title: 'Blog | ExploreDarija',
  description: 'Explore Darija culture, language, and travel tips with in-depth blog posts crafted for learners and visitors.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const initialPosts = posts.map((post) => ({
    id: post.slug,
    title: post.title,
    excerpt: post.excerpt || post.description,
    date: post.date || new Date().toISOString(),
    category: post.category || 'Insights',
    readingTime: `${Math.max(3, Math.ceil((post.content || '').split(' ').length / 180))} min read`,
    featured: post.featured,
  }))

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-800 to-slate-900 px-8 py-16 text-white shadow-2xl shadow-slate-900/10">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">ExploreDarija Blog</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight">Learn Darija with stories, culture, and travel insight.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">Discover fresh articles, vocabulary guides, local tips, and practical conversations for anyone who wants to experience Morocco in the native language.</p>
        </div>

        <div className="mt-10">
          <BlogListClient initialPosts={initialPosts} />
        </div>
      </div>
    </main>
  )
}
