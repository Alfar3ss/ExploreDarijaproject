"use client"
import { useEffect, useMemo, useState } from 'react'
import { normalizeText, applyOverrides, DEFAULT_OVERRIDES } from '../lib/normalize'

type Lang = 'en' | 'fr' | 'es' | 'it' | 'de' | 'dar'

const LANG_LABEL: Record<Lang, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  de: 'German',
  dar: 'Darija',
}

type Result = {
  translation?: string
  transliteration?: string
  pronunciation?: string
  notes?: string
}

const CACHE_KEY = 'iDarija_translate_cache_v1'

function loadCache(): Record<string, Result> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function saveCache(cache: Record<string, Result>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch (e) {}
}

export default function TranslateWidget({ initialFrom = 'en', initialTo = 'dar', autosuggest = true, onSave }: { initialFrom?: Lang; initialTo?: Lang; autosuggest?: boolean; onSave?: (text: string, result: Result) => void }) {
  // Use the page-level language selectors (passed in as props) instead of an in-widget selector.
  const from = initialFrom as Lang
  const to = initialTo as Lang
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [typed, setTyped] = useState('')
  const [showQuotaModal, setShowQuotaModal] = useState(false)
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null)
  const cache = useMemo(() => loadCache(), [])

  useEffect(() => { saveCache(cache) }, [cache])

  // debounce user typing for autosuggest
  useEffect(() => {
    if (!autosuggest) return
    const id = setTimeout(() => {
      if (typed.trim().length >= 2) doTranslate(typed)
    }, 500)
    return () => clearTimeout(id)
  }, [typed])

  function cacheKey(text: string, fromL: string, toL: string) {
    return `${fromL}:${toL}:${text}`.toLowerCase()
  }

  async function doTranslate(text?: string) {
    const raw = (text ?? input)
    const txt = applyOverrides(normalizeText(String(raw)), DEFAULT_OVERRIDES)
    if (!txt) return
    const key = cacheKey(txt, from, to)
    const existing = loadCache()[key]
    if (existing) {
      setResult(existing)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: String(raw), sourceLang: from === 'dar' ? 'darija' : from, targetLang: to === 'dar' ? 'darija' : to, mode: 'translate' })
      })
      const json = await res.json()
      if (res.status === 429) {
        setQuotaMessage(json?.message || 'Daily free limit reached. Subscribe to Premium for unlimited translations or try again tomorrow.')
        setShowQuotaModal(true)
        return
      }
      if (!res.ok) throw new Error(json?.error || 'Translation failed')
      const parsed = json.result || {}
      const out: Result = { translation: parsed.translation || parsed.translations?.[0]?.text || parsed.translation_text || parsed.text, transliteration: parsed.transliteration || parsed.transliteration_text, pronunciation: parsed.pronunciation, notes: parsed.notes }
      const c = loadCache()
      c[key] = out
      saveCache(c)
      setResult(out)
      if (onSave) onSave(txt, out)
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  function playAudio(text?: string) {
    const t = text || result?.translation || ''
    if (!t) return
    try {
      const utter = new SpeechSynthesisUtterance(t)
      const langMap: Record<Lang, string> = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', it: 'it-IT', de: 'de-DE', dar: 'ar-MA' }
      utter.lang = langMap[to] || 'en-US'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    } catch (e) { console.warn('TTS error', e) }
  }


  function handleSave() {
    if (!input.trim() || !result) return
    try {
      const key = 'iDarija_translations_saved'
      const raw = localStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift({ id: Date.now().toString(), input, from, to, result })
      localStorage.setItem(key, JSON.stringify(arr))
      if (onSave) onSave(input, result)
    } catch (e) {}
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative">
      {showQuotaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-250 opacity-100">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQuotaModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-10 transition-all duration-250">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan Limit Reached</h3>
              <p className="text-gray-600 mb-6">{quotaMessage || 'You reached today\'s free limit of 15 translations. Subscribe to Premium for unlimited usage or try again tomorrow.'}</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowQuotaModal(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Close</button>
                <button onClick={() => window.location.href = '/pricing'} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-start">
        <div className="flex-1">
          <div className="flex gap-2 items-center">
            <div className="text-sm text-gray-600">{`${LANG_LABEL[from]} → ${LANG_LABEL[to]}`}</div>
          </div>

          <textarea value={input} onChange={(e) => { setInput(e.target.value); setTyped(e.target.value) }} rows={3} className="w-full mt-3 border rounded px-3 py-2" placeholder="Type text to translate"></textarea>
          <div className="flex gap-2 mt-3">
            <button onClick={() => doTranslate()} disabled={loading} className="px-4 py-2 bg-primary text-white rounded">{loading ? 'Translating...' : 'Translate'}</button>
            <button onClick={() => { setInput(''); setResult(null); setError(null) }} className="px-4 py-2 border rounded">Clear</button>
            <button onClick={handleSave} className="px-4 py-2 bg-white border rounded">Save</button>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>

        <div className="w-full lg:w-56">
          <div className="text-sm text-gray-600">Result</div>
          <div className="mt-2 p-3 border rounded min-h-[80px] bg-gray-50">
            {result ? (
              <div>
                <div className="font-medium mb-1">{result.translation}</div>
                {result.transliteration && <div className="text-sm text-gray-600">{result.transliteration}</div>}
                {result.pronunciation && <div className="mt-2 text-sm text-gray-600">{result.pronunciation}</div>}
                {result.notes && <div className="mt-2 text-sm text-gray-600">{result.notes}</div>}
                <div className="mt-3 flex gap-2">
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No translation yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
