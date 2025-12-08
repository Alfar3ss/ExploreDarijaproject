"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UserSession() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; name?: string; email?: string } | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const json = await res.json()
        if (!mounted) return
        setUser(json?.user || null)
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    // refresh UI
    setUser(null)
    // full refresh to update server-rendered areas if needed
    window.location.href = '/'
  }


  if (loading) return <div className="inline-block md:inline-block px-4 py-2 text-white">...</div>

  if (!user) {
    return <Link href="/login" className="inline-block md:inline-block px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary-dark transition">Login</Link>
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link href="/dashboard" className="text-sm text-white">{user.name || user.email}</Link>
      <button onClick={handleLogout} className="px-3 py-2 bg-white text-primary rounded-md text-sm font-semibold">Logout</button>
    </div>
  )
}
