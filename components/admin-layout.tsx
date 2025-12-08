"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from './admin-sidebar'

const ADMIN_FLAG = 'iDarija_admin'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check admin flag from localStorage on mount
    try {
      const flag = localStorage.getItem(ADMIN_FLAG)
      setIsAdmin(!!flag)
      if (!flag) {
        // will redirect in the separate effect below
      }
    } catch (e) {
      setIsAdmin(false)
    }
  }, [])

  // If not admin, automatically redirect to the login page with a redirect back to /admin
  useEffect(() => {
    if (isAdmin === false) {
      try {
        router.replace(`/login?redirect=/admin`)
      } catch (e) {
        // ignore
      }
    }
  }, [isAdmin, router])

  // While checking auth, avoid rendering admin UI to prevent flicker
  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  if (!isAdmin) {
    // while redirect is in progress, render nothing to avoid flashing admin UI
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className={`z-40 h-screen transition-all duration-200 ${open ? 'w-60' : 'w-20'} bg-gray-800 text-gray-100`}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center font-bold">ED</div>
            {open && <div className="text-sm font-semibold">ExploreDarija</div>}
          </div>
          <button onClick={() => setOpen(s=>!s)} className="ml-auto text-gray-300 hover:text-white">{open ? '«' : '»'}</button>
        </div>

        <div className="p-3">
          <div className="mt-2">
            <AdminSidebar compact={!open} />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-4 py-2 bg-gray-900 text-gray-100 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen((s) => !s)} className="p-2 rounded-md bg-gray-800 hover:bg-gray-700">☰</button>
            <div className="text-sm">Dashboard</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-300">View site</div>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">+ New</button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full" />
              <div className="text-sm">Admin</div>
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('iDarija_admin')
                } catch (e) {}
                router.replace('/login?redirect=/admin')
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
