"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import translations from '../lib/translations'

type Lang = string

type LangContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LangContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('iDarija_lang')
      if (stored) setLangState(stored)
    } catch (e) {}
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('iDarija_lang', l)
    } catch (e) {}
  }

  useEffect(() => {
    try {
      document.documentElement.lang = lang
    } catch (e) {}
  }, [lang])

  const t = (key: string) => {
    const parts = key.split('.')
    const dict = (translations as any)[lang] || (translations as any)['en']
    let cur: any = dict
    for (const p of parts) {
      cur = cur?.[p]
      if (cur === undefined) break
    }
    if (typeof cur === 'string') return cur
    // fallback to english
    const fallback: any = (translations as any)['en']
    let fcur: any = fallback
    for (const p of parts) {
      fcur = fcur?.[p]
      if (fcur === undefined) break
    }
    return typeof fcur === 'string' ? fcur : ''
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
