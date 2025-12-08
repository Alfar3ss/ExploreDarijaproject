"use client"
import React, { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin-layout'

export default function AdminCommentsPage(){
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch('/api/comments')
        const json = await res.json()
        console.log('Admin comments API response:', json)
        setComments(json.comments || [])
      } catch (e) {
        setComments([])
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [])

  const deleteComment = async (id: string) => {
    // TODO: call API to delete comment in Supabase
    setComments(comments => comments.filter(c => c.id !== id))
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Comments</h1>
        <p className="text-sm text-gray-600 mb-6">Review and moderate comments from visitors.</p>
        {loading ? (
          <div>Loading comments...</div>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Author</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Post ID</th>
                <th className="p-2 border">Text</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c.id}>
                  <td className="p-2 border">{c.author_name}</td>
                  <td className="p-2 border">{c.author_email}</td>
                  <td className="p-2 border">{c.post_id}</td>
                  <td className="p-2 border">{c.text}</td>
                  <td className="p-2 border">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="p-2 border">
                    <button onClick={() => deleteComment(c.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
