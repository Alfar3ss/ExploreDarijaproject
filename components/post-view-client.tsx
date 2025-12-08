"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Post = { id: string; title: string; excerpt?: string; date?: string; category?: string; readingTime?: string; audioDarija?: string; content?: string; meta_title?: string; meta_description?: string; og_image?: string }

export default function PostViewClient({ post }: { post: Post }){
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null)
  const [comments, setComments] = useState<Array<any>>([])
  const [commentText, setCommentText] = useState('')

  useEffect(()=>{
    try{ const raw = localStorage.getItem('iDarija_user'); if (raw) setUser(JSON.parse(raw)) }catch(e){}
  }, [])

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?post_id=${encodeURIComponent(post.id)}`)
        const json = await res.json()
        console.log('Fetched comments:', json)
        if (json.comments) setComments(json.comments)
        else setComments([])
      } catch (e) { setComments([]) }
    }
    fetchComments()
  }, [post.id])

  useEffect(()=>{ try{ localStorage.setItem(`iDarija_comments_${post.id}`, JSON.stringify(comments)) }catch(e){} }, [comments, post.id])

  function playDarija(text?: string){
    if (!text) return
    try{ const u = new SpeechSynthesisUtterance(text); u.lang = 'ar-MA'; speechSynthesis.cancel(); speechSynthesis.speak(u) }catch(e){ console.warn(e) }
  }

  function addComment(){
    if (!user) { alert('Please log in to comment.'); return }
    const txt = commentText.trim(); if (!txt) return
    const c = { id: `${Date.now()}`, author: user, text: txt, createdAt: new Date().toISOString() }
    setComments(s=>[c,...s]); setCommentText('')
  }

  function removeComment(id: string){ setComments(s=>s.filter(c=>c.id!==id)) }

  return (
    <section className="max-w-4xl mx-auto mt-8 px-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Comments</h3>
        <p className="text-sm text-gray-600 mt-1">Share your thoughts — please be respectful. You must be logged in to comment.</p>

        <div className="mt-4">
          {user ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">Commenting as <strong>{user.name}</strong></div>
              <textarea value={commentText} onChange={(e)=>setCommentText(e.target.value)} rows={4} className="w-full p-3 border rounded-md" placeholder={'Write a helpful comment...'} />
              <div className="flex items-center gap-3">
                <button onClick={addComment} className="px-4 py-2 bg-primary text-white rounded-md">Post comment</button>
                <button onClick={()=>setCommentText('')} className="px-3 py-2 border rounded-md">Clear</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">You are not logged in. <a href="/login" className="text-primary">Login</a> to comment.</div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-gray-600">No comments yet — be the first to comment.</div>
          ) : (
            comments.map((c:any) => (
              <div key={c.id} className="p-3 border rounded-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{c.author_name} <span className="text-xs text-gray-500">· {new Date(c.created_at).toLocaleString()}</span></div>
                    <div className="mt-2 text-gray-700">{c.text}</div>
                  </div>
                  {user && user.email === c.author_email && (
                    <div className="flex-shrink-0">
                      <button onClick={()=>removeComment(c.id)} className="text-sm text-red-600">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  )
}
