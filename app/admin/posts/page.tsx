"use client"
import React, { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin-layout'
import PostEditor from '../../../components/post-editor'

type Post = { slug: string; title: string; description?: string; content?: string; image?: string; published?: boolean; createdAt?: number; meta_title?: string; meta_description?: string; meta_keywords?: string; canonical_url?: string; meta_robots?: string; og_image?: string }

const POSTS_KEY = 'iDarija_posts'

function safeParse<T>(k: string, fallback: T) {
  try { const raw = localStorage.getItem(k); if (!raw) return fallback; return JSON.parse(raw) as T } catch (e) { return fallback }
}

export default function AdminPostsPage(){
  const [posts, setPosts] = useState<Post[]>([])
  const [query, setQuery] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ loadPosts() }, [])

  async function loadPosts(){
    setLoading(true)
    try{
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    }catch(e){
      console.error(e)
      setPosts([])
    }finally{ setLoading(false) }
  }

  const openNew = () => {
    const p: Post = { slug: `post-${Date.now()}`, title: '', description: '', content: '', published: false, createdAt: Date.now() }
    setEditing(p)
    setEditorOpen(true)
  }

  const openEdit = (p: Post) => { setEditing(p); setEditorOpen(true) }

  const onSave = async (p: Post) => {
    try{
      // if existing post (by slug) then PATCH, otherwise POST
      const exists = posts.some(x => x.slug === p.slug)
      if (exists){
        const res = await fetch(`/api/posts/${encodeURIComponent(p.slug)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
        if (!res.ok) throw new Error('Failed to update')
        const row = await res.json()
        const others = posts.filter(x => x.slug !== row.slug)
        const next = [row, ...others]
        setPosts(next)
      } else {
        const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
        if (!res.ok) throw new Error('Failed to create')
        const row = await res.json()
        const next = [row, ...posts]
        setPosts(next)
      }
    }catch(err:any){
      console.error(err); alert('Error saving post: '+(err?.message||err))
    }finally{
      setEditorOpen(false); setEditing(null)
    }
  }

  const remove = async (slug: string) => {
    if (!confirm('Delete post?')) return
    try{
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setPosts(prev => prev.filter(p => p.slug !== slug))
    }catch(e){ console.error(e); alert('Failed to delete') }
  }

  const togglePublish = async (slug: string) => {
    try{
      const p = posts.find(x=>x.slug===slug)
      if (!p) return
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !p.published }) })
      if (!res.ok) throw new Error('Publish toggle failed')
      const row = await res.json()
      setPosts(prev => prev.map(it => it.slug===slug ? row : it))
    }catch(e){ console.error(e); alert('Failed to update publish status') }
  }

  const preview = (p: Post) => {
    // open the live blog URL if available, otherwise show content
    const w = window.open('', '_blank')
    if (!w) return
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${p.title}</title></head><body><h1>${p.title}</h1><div>${p.content||''}</div></body></html>`
    w.document.open(); w.document.write(html); w.document.close()
  }

  const filtered = posts.filter(p => (p.title||'').toLowerCase().includes(query.toLowerCase()) || (p.description||'').toLowerCase().includes(query.toLowerCase()))

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Posts</h1>
            <p className="text-sm text-gray-600">Manage posts, drafts and published content.</p>
          </div>
          <div className="flex items-center gap-3">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search posts..." className="border px-3 py-2 rounded" />
            <button onClick={openNew} className="px-3 py-2 bg-primary text-white rounded">Add New</button>
          </div>
        </div>

        <div className="bg-white border rounded">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-semibold">All posts ({filtered.length})</div>
            <div className="text-sm text-gray-500">Showing latest</div>
          </div>

          <div className="p-3">
            <div className="space-y-2">
              {filtered.length===0 && <div className="text-sm text-gray-500 p-4">No posts yet.</div>}
              {filtered.map(p => (
                <div key={p.slug} className="p-3 border rounded flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="font-semibold">{p.title || <span className="text-gray-400">(Untitled)</span>}</div>
                    <div className="text-xs text-gray-500">{p.description}</div>
                    <div className="text-xs text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>preview(p)} className="px-2 py-1 border rounded text-sm">Preview</button>
                    <button onClick={()=>openEdit(p)} className="px-2 py-1 bg-primary text-white rounded text-sm">Edit</button>
                    <button onClick={()=>togglePublish(p.slug)} className={`px-2 py-1 rounded text-sm ${p.published ? 'bg-green-600 text-white' : 'border'}`}>{p.published ? 'Unpublish' : 'Publish'}</button>
                    <button onClick={()=>remove(p.slug)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {editorOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-start md:items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-4xl rounded shadow-lg overflow-auto max-h-[90vh]">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="font-semibold">{editing ? 'Edit Post' : 'New Post'}</div>
                <div>
                  <button onClick={()=>{setEditorOpen(false); setEditing(null)}} className="px-3 py-1">Close</button>
                </div>
              </div>
              <div className="p-4">
                <PostEditor initial={editing ?? undefined} onSave={onSave} onCancel={()=>{setEditorOpen(false); setEditing(null)}} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
