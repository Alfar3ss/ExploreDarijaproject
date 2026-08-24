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
    <main className="min-h-screen bg-[#fffaf5] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="border border-black bg-black px-8 py-16 text-white shadow-[8px_8px_0_#e76f51]">
          <p className="text-sm uppercase tracking-[0.35em] text-[#ff7aac]">ExploreDarija Blog</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-normal leading-[0.98] md:text-7xl">Learn Darija with stories, culture, and travel insight.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">Discover fresh articles, vocabulary guides, local tips, and practical conversations for anyone who wants to experience Morocco in the native language.</p>
        </div>

        <div className="mt-10">
          <BlogListClient initialPosts={initialPosts} />
        </div>
      </div>
    </main>
  )
}
