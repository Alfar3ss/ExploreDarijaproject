"use client"
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

function Icon({ children }: { children: React.ReactNode }){
  return <span className="w-5 h-5 inline-block align-middle">{children}</span>
}

export default function AdminSidebar({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(()=>{
    const update = ()=> setHash(window.location.hash || '')
    update()
    window.addEventListener('hashchange', update)
    return ()=> window.removeEventListener('hashchange', update)
  }, [])

  function linkClass(active: boolean){
    const base = 'flex items-center gap-3 px-3 py-2 rounded transition-colors'
    const act = active ? 'bg-gray-700 text-white border-l-4 border-primary' : 'text-gray-200 hover:bg-gray-700'
    return `${base} ${act}`
  }

  const isActive = (href: string)=>{
    if (href === '/admin') return pathname === '/admin' && !hash
    if (href.startsWith('/admin#')) return pathname === '/admin' && hash === href.slice('/admin'.length)
    return pathname === href
  }

  const Item = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => (
    <Link href={href} className={linkClass(isActive(href))} title={compact ? label : undefined}>
      <div className={`w-6 h-6 flex items-center justify-center ${compact ? 'mx-auto' : ''}`}>{icon}</div>
      <span className={`${compact ? 'hidden' : 'align-middle'}`}>{label}</span>
    </Link>
  )

  return (
    <nav className="space-y-1 text-sm">
      <Item href="/admin" label="Dashboard" icon={<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z" fill="currentColor"/></svg>} />
      <Item href="/admin/posts" label="Posts" icon={<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor"/></svg>} />
      <Item href="/admin/comments" label="Comments" icon={<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M21 6h-2V4a2 2 0 0 0-2-2H7v2H5a2 2 0 0 0-2 2v11l4-2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" fill="currentColor"/></svg>} />
      <Item href="/admin/users" label="Users" icon={<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5v2h18v-2c0-2.5-4-5-9-5z" fill="currentColor"/></svg>} />
    </nav>
  )
}
