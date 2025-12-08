"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Testimonial = {
  id: string
  name: string
  text: string
  rating: number
  date: string
}

const STORAGE_KEY = 'iDarija_testimonials'
const USER_KEY = 'iDarija_user'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [text, setText] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [name, setName] = useState('')
  const [userPresent, setUserPresent] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTestimonials(JSON.parse(raw))
    } catch (e) {}

    try {
      const u = localStorage.getItem(USER_KEY)
      if (u) {
        const parsed = JSON.parse(u)
        if (parsed?.name) setName(parsed.name)
        setUserPresent(true)
      }
    } catch (e) {}
  }, [])

  const saveAll = (next: Testimonial[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (e) {}
    setTestimonials(next)
  }

  const submit = () => {
    if (!userPresent) return
    if (!text.trim()) return alert('Please enter feedback')
    const t: Testimonial = {
      id: String(Date.now()),
      name: name || 'Anonymous',
      text: text.trim(),
      rating,
      date: new Date().toISOString(),
    }
    saveAll([t, ...testimonials])
    setText('')
    setRating(5)
  }

  return (
    <div>
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Learner reviews</h4>
          <div className="text-sm text-gray-500">{testimonials.length} reviews</div>
        </div>

        {userPresent ? (
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">{(name || 'U').charAt(0).toUpperCase()}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold">{name || 'You'}</div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: rating }).map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>
                    ))}
                  </div>
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full mt-2 border border-gray-200 rounded-md p-2 text-sm" placeholder="Share your experience..." />

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Rating</span>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="text-sm border rounded px-2 py-1">
                      {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r}★</option>)}
                    </select>
                  </div>
                  <div>
                    <button onClick={submit} className="px-3 py-1 bg-primary text-white rounded-md text-sm font-semibold">Post review</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">Want to add a review? Please <Link href="/login" className="text-primary font-semibold">log in</Link> first.</div>
            <Link href="/login" className="px-3 py-1 bg-primary text-white rounded-md text-sm font-semibold">Log in</Link>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {testimonials.length === 0 && (
          <div className="text-sm text-gray-500">No reviews yet — be the first to add one.</div>
        )}

        {testimonials.map((t) => (
          <div key={t.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">{t.name.charAt(0).toUpperCase()}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>
                    ))}
                  </div>
                </div>
                <div className="text-gray-700 mt-2">{t.text}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
