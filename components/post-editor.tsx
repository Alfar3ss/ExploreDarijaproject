"use client"

import { useState } from "react"
import TiptapEditor from "./tiptap-editor"

type Post = {
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

export default function PostEditor({ initial, onSave, onCancel }: {
  initial?: Post
  onSave?: (p: Post) => void
  onCancel?: () => void
}) {
  const [title, setTitle] = useState(initial?.title || "")
  const [desc, setDesc] = useState(initial?.description || "")
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "")
  const [content, setContent] = useState(initial?.content || "<p></p>")
  const [image, setImage] = useState<string | undefined>(initial?.image)
  const [category, setCategory] = useState(initial?.category || "Insights")
  const [featured, setFeatured] = useState(initial?.featured || false)

  const [metaTitle, setMetaTitle] = useState(initial?.meta_title || "")
  const [metaDesc, setMetaDesc] = useState(initial?.meta_description || "")
  const [metaKeywords, setMetaKeywords] = useState(initial?.meta_keywords || "")
  const [canonical, setCanonical] = useState(initial?.canonical_url || "")
  const [metaRobots, setMetaRobots] = useState(initial?.meta_robots || "index, follow")

  const [customSlug, setCustomSlug] = useState(initial?.slug || "")
  const slug = customSlug || (title ? slugify(title) : "")

  const handleImage = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  function slugify(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const save = () => {
    const finalSlug = customSlug || (title ? slugify(title) : `post-${Date.now()}`)
    const canonicalUrl = canonical || `/blog/${finalSlug}`

    const post: Post = {
      slug: finalSlug,
      title,
      description: desc,
      excerpt: excerpt || desc,
      content,
      image,
      category,
      featured,
      meta_title: metaTitle || title,
      meta_description: metaDesc || desc,
      meta_keywords: metaKeywords,
      canonical_url: canonicalUrl,
      meta_robots: metaRobots,
      og_image: image,
      date: initial?.date || new Date().toISOString(),
    }

    onSave?.(post)
  }

  return (
    <div className="bg-white border rounded-3xl p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Post title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Short description</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short description"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">SEO excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Excerpt for listing previews"
              rows={2}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="featured" className="text-sm font-medium text-slate-700">Mark as featured</label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Post image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])} className="text-sm text-slate-600" />
            {image ? <img src={image} alt="Cover" className="mt-3 h-28 w-full rounded-2xl object-cover" /> : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-semibold text-slate-700">Content</label>
          <div className="text-xs text-slate-500">Use the rich editor for headings, lists, links, images and tables.</div>
        </div>
        <TiptapEditor value={content} onChange={setContent} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">SEO / Meta</h4>
          <div className="space-y-4">
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Meta title"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Meta description"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="Meta keywords"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={canonical}
              onChange={(e) => setCanonical(e.target.value)}
              placeholder="Canonical URL"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={metaRobots}
              onChange={(e) => setMetaRobots(e.target.value)}
              placeholder="Robots"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">Publication details</h4>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-medium text-slate-900">Slug preview</p>
              <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">/blog/{slug || 'your-post-slug'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Recommended</p>
              <p className="mt-2">Use a clear slug, strong title, and a short meta description that includes your most important keywords.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button onClick={onCancel} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
        <button onClick={save} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition">Save post</button>
      </div>
    </div>
  )
}
