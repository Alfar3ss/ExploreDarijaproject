"use client"
import React, { useEffect, useRef, useState } from 'react'

type Post = { slug: string; title: string; description?: string; content?: string; image?: string; meta_title?: string; meta_description?: string; meta_keywords?: string; canonical_url?: string; meta_robots?: string; og_image?: string }

const POSTS_KEY = 'iDarija_posts'

function safeParse<T>(k: string, fallback: T) {
  try { const raw = localStorage.getItem(k); if (!raw) return fallback; return JSON.parse(raw) as T } catch (e) { return fallback }
}

export default function PostEditor({ initial, onSave, onCancel }: { initial?: Post; onSave?: (p: Post)=>void; onCancel?: ()=>void }){
  const [title, setTitle] = useState(initial?.title||'')
  const [desc, setDesc] = useState(initial?.description||'')
  const [content, setContent] = useState(initial?.content||'<p></p>')
  const [image, setImage] = useState<string|undefined>(initial?.image)
  const [metaTitle, setMetaTitle] = useState<string>(initial?.meta_title || '')
  const [metaDesc, setMetaDesc] = useState<string>(initial?.meta_description || '')
  const [metaKeywords, setMetaKeywords] = useState<string>(initial?.meta_keywords || '')
  const [canonical, setCanonical] = useState<string>(initial?.canonical_url || '')
  const [metaRobots, setMetaRobots] = useState<string>(initial?.meta_robots || '')
  const editorRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    if (initial){ setTitle(initial.title||''); setDesc(initial.description||''); setContent(initial.content||'<p></p>'); setImage(initial.image) }
  }, [initial])

  const handleImage = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImage(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const save = () => {
    const slug = initial?.slug || `post-${Date.now()}`
    const post: Post = { slug, title, description: desc, content, image, meta_title: metaTitle, meta_description: metaDesc, meta_keywords: metaKeywords, canonical_url: canonical, meta_robots: metaRobots, og_image: image }
    const all = safeParse<Post[]>(POSTS_KEY, [])
    const others = all.filter(p=>p.slug!==slug)
    const next = [post, ...others]
    try { localStorage.setItem(POSTS_KEY, JSON.stringify(next)) } catch(e){}
    onSave?.(post)
  }

  return (
    <div className="bg-white border rounded p-4">
      <div className="mb-3">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Post title" className="w-full border px-3 py-2 rounded" />
      </div>
      <div className="mb-3">
        <input value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Short description" className="w-full border px-3 py-2 rounded" />
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">Cover image</div>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={(e)=>handleImage(e.target.files?.[0])} />
          {image && <img src={image} className="w-28 h-20 object-cover rounded" alt="cover" />}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">Content (HTML allowed)</div>
        <div ref={editorRef} contentEditable className="border p-3 min-h-[180px] rounded" onInput={(e)=>setContent((e.target as HTMLDivElement).innerHTML)} dangerouslySetInnerHTML={{__html: content}} />
      </div>

      <div className="mb-3 border-t pt-3">
        <h4 className="font-semibold mb-2">SEO / Meta</h4>
        <div className="mb-2">
          <input value={metaTitle} onChange={(e)=>setMetaTitle(e.target.value)} placeholder="Meta title (optional)" className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-2">
          <textarea value={metaDesc} onChange={(e)=>setMetaDesc(e.target.value)} placeholder="Meta description (optional)" className="w-full border px-3 py-2 rounded" rows={3} />
        </div>
        <div className="mb-2">
          <input value={metaKeywords} onChange={(e)=>setMetaKeywords(e.target.value)} placeholder="Meta keywords (comma-separated)" className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input value={canonical} onChange={(e)=>setCanonical(e.target.value)} placeholder="Canonical URL (optional)" className="border px-3 py-2 rounded" />
          <input value={metaRobots} onChange={(e)=>setMetaRobots(e.target.value)} placeholder="Robots (e.g. index, follow)" className="border px-3 py-2 rounded" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
        <button onClick={save} className="px-3 py-1 bg-primary text-white rounded">Save post</button>
      </div>
    </div>
  )
}
