"use client"
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function UserSession() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; name?: string; email?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
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
    <div ref={menuRef} className="relative block">
      <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17211d] text-white transition hover:bg-primary" aria-label="Open profile menu" aria-expanded={menuOpen}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>
      </button>
      {menuOpen && <div className="absolute right-0 top-full z-50 mt-3 w-44 border border-[#17211d]/10 bg-[#f8f6f0] p-2 shadow-lg">
        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2.5 text-sm font-semibold text-[#17211d] transition hover:bg-[#e9eee7] hover:text-primary">Dashboard</Link>
        <button type="button" onClick={handleLogout} className="block w-full rounded px-3 py-2.5 text-left text-sm font-semibold text-[#17211d] transition hover:bg-[#e9eee7] hover:text-primary">Logout</button>
      </div>}
    </div>
  )
}
