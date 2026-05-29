"use client"

import { useEffect, useMemo, useState } from 'react'
import PostEditor from './post-editor'

type AdminPost = {
  slug: string
  title: string
  description?: string
  excerpt?: string
  content?: string
  image?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  canonical_url?: string
  meta_robots?: string
  og_image?: string
  category?: string
  featured?: boolean
  date?: string
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [query, setQuery] = useState('')

  const selectedPost = posts.find((post) => post.slug === selectedSlug) || null

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      return (
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.description || '').toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        (post.category || '').toLowerCase().includes(q)
      )
    })
  }, [posts, query])

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setStatus('Loading posts...')
      const res = await fetch('/api/blog/posts')
      const json = await res.json()
      setPosts(Array.isArray(json.posts) ? json.posts : [])
      setStatus('')
    } catch (error) {
      setStatus('Unable to load posts.')
    }
  }

  async function savePost(post: AdminPost) {
    try {
      setStatus('Saving post...')
      const payload = {
        ...post,
        description: post.description ?? '',
        content: post.content ?? '',
      }
      const res = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setStatus(json.error || 'Failed to save')
        return
      }
      setStatus('Post saved successfully')
      setSelectedSlug(json.post.slug)
      await fetchPosts()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setStatus('Unable to save post.')
    }
  }

  async function deletePost(slug: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      setStatus('Removing post...')
      const res = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        setStatus(json.error || 'Unable to delete post')
        return
      }
      setStatus('Post deleted')
      setSelectedSlug(null)
      await fetchPosts()
    } catch {
      setStatus('Unable to delete post.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Blogger admin</p>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">Manage your blog posts</h1>
          <p className="mt-3 max-w-2xl text-gray-600">Create polished blog content, edit SEO metadata, customize slugs, and publish posts from one clean dashboard.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setSelectedSlug(null)
              setIsEditorOpen(true)
            }}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition"
          >
            New post
          </button>
          <button
            onClick={fetchPosts}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Refresh list
          </button>
        </div>
      </div>

      {status ? (
        <div className="rounded-3xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{status}</div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.85fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Published posts</h2>
                <p className="mt-1 text-sm text-gray-500">Search, open, and manage the latest blog entries.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts by title, slug, or category"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{posts.length} posts</div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Title</th>
                    <th className="px-4 py-4">Slug</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No posts match your search.</td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.slug} className={post.slug === selectedSlug ? 'bg-slate-50' : ''}>
                        <td className="px-4 py-4 font-semibold text-slate-900">{post.title}</td>
                        <td className="px-4 py-4 text-slate-500">{post.slug}</td>
                        <td className="px-4 py-4 text-slate-500">{post.category || 'Insights'}</td>
                        <td className="px-4 py-4 text-slate-500">{post.date ? new Date(post.date).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedSlug(post.slug)
                                setIsEditorOpen(true)
                              }}
                              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePost(post.slug)}
                              className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Quick SEO tips</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Use a descriptive slug and keep it short.</li>
              <li>• Write a meta description between 120‑160 characters.</li>
              <li>• Add comma-separated keywords to improve search relevance.</li>
              <li>• Keep the first paragraph clear and keyword-focused.</li>
              <li>• Mark one post as featured to make it stand out.</li>
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Post editor</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Write and optimize</h2>
              </div>
              {selectedPost ? (
                <button
                  onClick={() => deletePost(selectedPost.slug)}
                  className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <p>Click the "New post" button to open the editor in a modal. You can also edit an existing post from the list.</p>
              <p className="rounded-2xl bg-slate-50 px-4 py-3">The editor includes all SEO fields, slug control, featured settings, and a rich text workspace.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <h2 className="text-xl font-semibold">Content strategy</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Use this admin section to publish posts that feel premium and are built for organic discovery.</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>• Keep headings clear and scannable.</li>
              <li>• Use short paragraphs and bold summaries.</li>
              <li>• Add internal links to related posts and features.</li>
              <li>• Set canonical URL if you publish mirrored content.</li>
            </ul>
          </div>
        </aside>
      </div>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-primary">{selectedPost ? 'Edit Post' : 'New Post'}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Write and optimize</h2>
              </div>
              <button
                onClick={() => {
                  setIsEditorOpen(false)
                  setSelectedSlug(null)
                }}
                className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-6">
              <PostEditor
                initial={selectedPost || undefined}
                onSave={(post) => {
                  savePost(post)
                  setIsEditorOpen(true)
                }}
                onCancel={() => {
                  setIsEditorOpen(false)
                  setSelectedSlug(null)
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
