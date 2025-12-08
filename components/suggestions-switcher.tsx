'use client'

import React, { useState } from 'react'
import type { Suggestion } from '../lib/suggestions'

type Props = {
  suggestions: Suggestion[]
  initialLang: string
}

const SUPPORTED = ['en', 'fr', 'es', 'it', 'de']

export default function SuggestionsSwitcher({ suggestions, initialLang }: Props) {
  const [lang, setLang] = useState<string>(initialLang || 'en')

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setLang(v)
    // persist preference as cookie for server renders
    try {
      document.cookie = `iDarija_lang=${v}; path=/; max-age=${60 * 60 * 24 * 365}`
    } catch (err) {
      // ignore
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">Recommended (language: {lang.toUpperCase()})</div>
        <select value={lang} onChange={onChange} className="border px-2 py-1 rounded text-sm">
          {SUPPORTED.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((w, i) => (
          <div key={i} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{w.darija}</div>
              <div className="text-sm text-gray-600">{(w.meanings as any)[lang] || w.meanings.en}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded text-sm">🔊</button>
              <button className="px-2 py-1 bg-primary text-white rounded text-sm">Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
