"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

// TinyMCE – load client-side only
const Editor = dynamic(() => import("@tinymce/tinymce-react").then(m => m.Editor), {
  ssr: false,
})

type Post = {
  slug: string
  title: string
  description?: string
  content?: string
  image?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  canonical_url?: string
  meta_robots?: string
  og_image?: string
}

const POSTS_KEY = "iDarija_posts"

function safeParse<T>(k: string, fallback: T) {
  try {
    const raw = localStorage.getItem(k)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export default function PostEditor({ initial, onSave, onCancel }: {
  initial?: Post
  onSave?: (p: Post) => void
  onCancel?: () => void
}) {
  const [title, setTitle] = useState(initial?.title || "")
  const [desc, setDesc] = useState(initial?.description || "")
  const [content, setContent] = useState(initial?.content || "<p></p>")
  const [image, setImage] = useState<string | undefined>(initial?.image)

  const [metaTitle, setMetaTitle] = useState(initial?.meta_title || "")
  const [metaDesc, setMetaDesc] = useState(initial?.meta_description || "")
  const [metaKeywords, setMetaKeywords] = useState(initial?.meta_keywords || "")
  const [canonical, setCanonical] = useState(initial?.canonical_url || "")
  const [metaRobots, setMetaRobots] = useState(initial?.meta_robots || "")

  // Slug state for custom editing
  const [customSlug, setCustomSlug] = useState(initial?.slug || "")
  // Compute slug for display and saving
  const slug = customSlug || (title ? slugify(title) : "")

  const [mode, setMode] = useState<"visual" | "html">("visual")

  const handleImage = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  // Generate a canonical, SEO-friendly slug from the title
  function slugify(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const save = () => {
    // Use customSlug if set, otherwise generate from title
    let finalSlug = customSlug || (title ? slugify(title) : `post-${Date.now()}`)
    // If canonical is empty, auto-generate it from slug
    const canonicalUrl = canonical || `/blog/${finalSlug}`

    const post: Post = {
      slug: finalSlug,
      title,
      description: desc,
      content,
      image,
      meta_title: metaTitle,
      meta_description: metaDesc,
      meta_keywords: metaKeywords,
      canonical_url: canonicalUrl,
      meta_robots: metaRobots,
      og_image: image,
    }

    const all = safeParse<Post[]>(POSTS_KEY, [])
    const others = all.filter(p => p.slug !== finalSlug)
    const next = [post, ...others]

    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(next))
    } catch {}

    onSave?.(post)
  }

  return (
    <div className="bg-white border rounded p-4">


      {/* TITLE */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full border px-3 py-2 rounded mb-1"
      />

      {/* SLUG URL (editable) */}
      <div className="mb-3 text-sm text-gray-600">
        <span className="font-semibold">Slug URL: </span>
        <span className="inline-flex items-center">
          <span className="bg-gray-100 px-2 py-1 rounded-l text-gray-800 border-r border-gray-300">/blog/</span>
          <input
            type="text"
            value={customSlug}
            onChange={e => setCustomSlug(slugify(e.target.value))}
            placeholder="custom-slug"
            className="bg-gray-100 px-2 py-1 rounded-r text-gray-800 border-none outline-none w-48"
            spellCheck={false}
          />
        </span>
      </div>

      {/* DESCRIPTION */}
      <input
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Short description"
        className="w-full border px-3 py-2 rounded mb-3"
      />

      {/* COVER IMAGE */}
      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">Cover image</div>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={e => handleImage(e.target.files?.[0])} />
          {image && <img src={image} className="w-28 h-20 object-cover rounded" />}
        </div>
      </div>

      {/* EDITOR MODE SWITCH */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setMode("visual")}
          className={`px-3 py-1 rounded border ${mode === "visual" ? "bg-blue-500 text-white" : ""}`}
        >
          Visual Editor
        </button>
        <button
          onClick={() => setMode("html")}
          className={`px-3 py-1 rounded border ${mode === "html" ? "bg-blue-500 text-white" : ""}`}
        >
          HTML Editor
        </button>
      </div>

      {/* VISUAL MODE */}
      {mode === "visual" && (
        <Editor
          value={content}
          onEditorChange={setContent}
          tinymceScriptSrc={`https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY}/tinymce/6/tinymce.min.js`}
          init={{
            height: 300,
            menubar: false,
            plugins: "link image lists code table",
            toolbar:
              "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
            branding: false,
          }}
        />
      )}

      {/* HTML MODE */}
      {mode === "html" && (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={12}
        />
      )}

      {/* SEO */}
      <div className="mt-4 border-t pt-3">
        <h4 className="font-semibold mb-2">SEO / Meta</h4>

        <input
          value={metaTitle}
          onChange={e => setMetaTitle(e.target.value)}
          placeholder="Meta title"
          className="w-full border px-3 py-2 rounded mb-2"
        />

        <textarea
          value={metaDesc}
          onChange={e => setMetaDesc(e.target.value)}
          placeholder="Meta description"
          rows={3}
          className="w-full border px-3 py-2 rounded mb-2"
        />

        <input
          value={metaKeywords}
          onChange={e => setMetaKeywords(e.target.value)}
          placeholder="Meta keywords"
          className="w-full border px-3 py-2 rounded mb-2"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            value={canonical}
            onChange={e => setCanonical(e.target.value)}
            placeholder="Canonical URL"
            className="border px-3 py-2 rounded"
          />
          <input
            value={metaRobots}
            onChange={e => setMetaRobots(e.target.value)}
            placeholder="Robots"
            className="border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
        <button onClick={save} className="px-3 py-1 bg-primary text-white rounded">Save post</button>
      </div>

    </div>
  )
}
