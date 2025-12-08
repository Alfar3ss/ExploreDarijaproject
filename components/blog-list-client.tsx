"use client"
import React, { useMemo, useState } from 'react'
import { MotionDiv } from './motion-div'
import { useT } from './use-t'

type Post = {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  readingTime: string
  audioDarija?: string
  content?: string
  featured?: boolean
}

const PAGE_SIZE = 3

export default function BlogListClient({ initialPosts }: { initialPosts: Post[] }){
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const t = useT()

  const posts = initialPosts

  const categories = useMemo(() => {
    const s = new Set<string>()
    posts.forEach((p) => s.add(p.category))
    return Array.from(s)
  }, [posts])

  const featured = useMemo(() => posts.find((p) => p.featured), [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const catOk = category ? p.category === category : true
      const textOk = q ? (p.title + " " + (p.excerpt || '')).toLowerCase().includes(q) : true
      return catOk && textOk
    }).sort((a,b) => (b.date > a.date ? 1 : -1))
  }, [posts, query, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  React.useEffect(() => { setPage(1) }, [query, category])

  function playDarija(text?: string){ if (!text) return; try { const u = new SpeechSynthesisUtterance(text); u.lang = 'ar-MA'; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch(e){} }

  return (
    <>
      <MotionDiv>
        <>
          <h1 className="text-4xl font-bold">{t('blog.title')}</h1>
          <p className="mt-3 text-gray-600 max-w-3xl">{t('blog.subtitle')}</p>
        </>
      </MotionDiv>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('blog.search_placeholder')}
              className="w-full md:flex-1 px-4 py-3 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategory(null)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${category === null ? 'bg-primary text-white shadow' : 'bg-white border'}`}>{t('blog.all')}</button>
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory((s) => (s === c ? null : c))} className={`px-3 py-1.5 rounded-full text-sm font-medium ${category === c ? 'bg-primary text-white shadow' : 'bg-white border'}`}>{c}</button>
              ))}
            </div>
          </div>

          {featured && (
            <article className="mt-6 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 shadow-lg p-6 transition-transform transform hover:-translate-y-1">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <div className="inline-block text-xs bg-primary text-white px-3 py-1 rounded-full font-semibold">Featured</div>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900">{featured.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">{featured.date} • {featured.readingTime} • <span className="px-2 py-0.5 bg-white/60 rounded-full">{featured.category}</span></div>
                  <p className="mt-4 text-gray-700 leading-relaxed">{featured.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3">
                    {featured.audioDarija && <button onClick={() => playDarija(featured.audioDarija)} className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50">🔊 Play</button>}
                    <a href={`/blog/${featured.id}`} className="ml-2 inline-block px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark">Read featured →</a>
                  </div>
                </div>
              </div>
            </article>
          )}

          <div className="mt-6 grid gap-6">
            {pageItems.map((p) => (
              <article key={p.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-primary font-semibold">{p.category}</div>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900">{p.title}</h3>
                    <div className="text-sm text-gray-500 mt-1">{p.date} • {p.readingTime}</div>
                    <p className="mt-3 text-gray-700 leading-relaxed">{p.excerpt}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-3">
                    {p.audioDarija && <button onClick={() => playDarija(p.audioDarija)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">🔊</button>}
                    <a href={`/blog/${p.id}`} className="text-sm text-primary font-medium hover:underline">Read →</a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => setPage((s) => Math.max(1, s-1))} className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50">Prev</button>
            <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
            <button onClick={() => setPage((s) => Math.min(totalPages, s+1))} className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50">Next</button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h4 className="font-semibold text-lg">{t('blog.recent_posts')}</h4>
            <div className="mt-3 space-y-3">
              {posts.slice(0,3).map((r) => (
                <a key={r.id} href={`/blog/${r.id}`} className="block p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
                  <div className="text-sm font-medium text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.date}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h4 className="font-semibold">What you’ll find</h4>
            <ul className="mt-3 text-sm text-gray-700 space-y-2">
              <li>📝 Language Tips & Lessons</li>
              <li>🇲🇦 Moroccan Culture Explained</li>
              <li>📚 Everyday Conversations</li>
              <li>🧕👳 Stories From Moroccans</li>
              <li>🗺️ Learn Darija Through Travel</li>
              <li>👂 Audio & Examples</li>
              <li>💡 Tips for Fast Learning</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
