"use client"
import { useEffect, useRef, useState } from "react"
import { useLanguage } from "./language-provider"

export default function LanguageSwitcher({ className = "", mobile = false }: { className?: string; mobile?: boolean }) {
  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "fr", label: "FR", name: "French" },
    { code: "es", label: "ES", name: "Spanish" },
    { code: "it", label: "IT", name: "Italian" },
    { code: "de", label: "DE", name: "German" },
    { code: "nl", label: "NL", name: "Dutch" },
  ]

  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!(e.target instanceof Node)) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  const select = (code: string) => {
    setLang(code)
    setOpen(false)
  }

  const current = languages.find((l) => l.code === lang) || languages[0]

  const dark = className.includes('text-white') || className.includes('text-gray-50')

  if (mobile) {
    return (
      <div className={`inline-block ${className}`} ref={ref}>
        <label className={`sr-only`}>Language</label>
        <select
          value={lang}
          onChange={(e) => select(e.target.value)}
          style={{ backgroundColor: dark ? '#0b1220' : '#ffffff', color: dark ? '#ffffff' : '#111827' }}
          className={`px-3 py-1 rounded-md border text-sm ${dark ? 'border-gray-700' : 'bg-white text-gray-900'}`}
        >
          {languages.map((l) => (
            <option
              key={l.code}
              value={l.code}
              style={{ backgroundColor: dark ? '#0b1220' : '#ffffff', color: dark ? '#ffffff' : '#111827' }}
            >
              {l.label} — {l.name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-3 py-1 rounded-md border text-sm flex items-center gap-2 ${dark ? 'text-white border-gray-700 bg-transparent' : 'text-gray-900 bg-white'}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Language: ${current.name}`}
      >
        <span className="font-medium">{current.label}</span>
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-40 ${dark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border'} rounded-md shadow-lg z-50`}>
          <ul role="menu" className="py-1">
            {languages.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => select(l.code)}
                  role="menuitem"
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${l.code === current.code ? 'font-semibold' : 'font-normal'} ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <span className="w-7">{l.label}</span>
                  <span className={`${dark ? 'text-gray-300' : 'text-gray-600'}`}>{l.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
