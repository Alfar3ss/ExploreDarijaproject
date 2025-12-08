"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type RawMessage = { role: 'user' | 'assistant'; content: string; created_at?: string }

type Message =
  | { role: 'user' | 'assistant'; type: 'text'; content: string }
  | { role: 'user' | 'assistant'; type: 'image'; url: string; alt?: string }

function parseRaw(r: RawMessage): Message {
  try {
    const maybe = JSON.parse(r.content)
    if (maybe && maybe.type === 'image' && maybe.url) {
      return { role: r.role as any, type: 'image', url: maybe.url, alt: maybe.alt }
    }
  } catch (e) {
    // not JSON
  }
  return { role: r.role as any, type: 'text', content: r.content }
}

export default function ChatWidget({ initialLang = 'en' }: { initialLang?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [lang, setLang] = useState(initialLang)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [showQuotaModal, setShowQuotaModal] = useState(false)
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    // load cookie lang if exists
    try {
      const cookie = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('iDarija_lang='))
      if (cookie) setLang(cookie.split('=')[1])
    } catch (e) {}

    // Load conversationId from localStorage and fetch history
    ;(async () => {
      try {
        const stored = localStorage.getItem('iDarija_chat_conv')
        if (stored) {
          setConversationId(stored)
          const res = await fetch(`/api/chat?conversationId=${encodeURIComponent(stored)}`)
          if (res.ok) {
            const j = await res.json()
            const msgs = Array.isArray(j.messages) ? j.messages.map(parseRaw) : []
            setMessages(msgs)
          }
        } else {
          // ask server for latest conversation for this user (if authenticated)
          const res = await fetch('/api/chat')
          if (res.ok) {
            const j = await res.json()
            if (j?.conversationId) {
              setConversationId(j.conversationId)
              localStorage.setItem('iDarija_chat_conv', j.conversationId)
            }
            const msgs = Array.isArray(j.messages) ? j.messages.map(parseRaw) : []
            setMessages(msgs)
          }
        }
      } catch (e) {
        console.warn('Failed to load chat history', e)
      } finally {
        setLoadingHistory(false)
      }
      // after history loads, if no lang cookie present and no messages, prompt user to choose
      try {
        const cookie = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('iDarija_lang='))
        if (!cookie) {
          // show language picker only when there are no previous messages
          const stored = localStorage.getItem('iDarija_chat_conv')
          if (!stored) setShowLangPicker(true)
        }
      } catch (e) {}
    })()
  }, [])

  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typingText])

  const typeMessage = (text: string) => {
    setIsTyping(true)
    setTypingText('')
    let i = 0
    const speed = 20
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypingText((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(timer)
        setIsTyping(false)
        setMessages((m) => [...m, { role: 'assistant', type: 'text', content: text }])
        setTypingText('')
      }
    }, speed)
  }

  // Check premium status (server authoritative)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const json = await res.json()
        setIsPremium(!!json?.user?.is_premium)
      } catch {}
    })()
  }, [])

  async function sendText() {
    const trimmed = text.trim()
    // allow sending when there's text or a pending attachment
    if (!trimmed && !pendingAttachment) return
    const userMsg = trimmed
    setText('')
    setSending(true)

    try {
      let attachmentUrl: string | null = null
      let attachmentAlt: string | undefined = undefined

      if (pendingAttachment) {
        // convert to data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(String(fr.result))
          fr.onerror = reject
          fr.readAsDataURL(pendingAttachment)
        })

        // upload to /api/uploads (returns url)
        const upRes = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl }) })
        const upJson = await upRes.json()
        if (!upRes.ok || !upJson.url) throw new Error(upJson?.error || 'Upload failed')
        attachmentUrl = upJson.url
        attachmentAlt = pendingAttachment.name
      }

      // append user text locally if any
      if (userMsg) setMessages((m) => [...m, { role: 'user', type: 'text', content: userMsg }])
      // append image locally if uploaded
      if (attachmentUrl) setMessages((m) => [...m, { role: 'user', type: 'image', url: attachmentUrl, alt: attachmentAlt }])

      // send payload
      const body: any = { message: userMsg, conversationId, lang }
      if (attachmentUrl) body.attachment = { type: 'image', url: attachmentUrl, alt: attachmentAlt }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (res.status === 429) {
        setQuotaMessage(j?.message || 'Daily free limit reached. Subscribe to Premium for unlimited access.')
        setShowQuotaModal(true)
        return
      }
      if (j?.assistant) {
        typeMessage(j.assistant)
        if (j.conversationId) {
          setConversationId(j.conversationId)
          try { localStorage.setItem('iDarija_chat_conv', j.conversationId) } catch (e) {}
        }
      } else if (j?.error) {
        const details = j?.details ? `\n
Details: ${String(j.details).slice(0,2000)}` : ''
        setMessages((m) => [...m, { role: 'assistant', type: 'text', content: 'Sorry, there was an error: ' + j.error + details }])
      }

      // cleanup pending attachment
      if (pendingPreview) {
        try { URL.revokeObjectURL(pendingPreview) } catch (e) {}
      }
      setPendingAttachment(null)
      setPendingPreview(null)
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'assistant', type: 'text', content: 'Send failed: ' + (err?.message || err) }])
    } finally {
      setSending(false)
    }
  }

  // keep function in case of future use, but file input will not auto-upload
  async function sendAttachment(file: File) {
    // This helper is no longer used for immediate upload; logic moved into sendText()
    return sendText()
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendText()
    }
  }

  function onChangeLang(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setLang(v)
    document.cookie = `iDarija_lang=${v}; path=/; max-age=${60*60*24*365}`
    try {
      // try inform server by saving preferred language via chat POST if conversation exists
      if (conversationId) fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '', conversationId, lang: v }) })
    } catch (e) {}
  }

  function triggerFile() {
    fileRef.current?.click()
  }

  const LANG_OPTIONS: { code: string; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'de', label: 'German' },
    { code: 'nl', label: 'Dutch' },
    { code: 'it', label: 'Italian' },
  ]

  const GREETINGS: Record<string, string> = {
    en: 'Welcome! I am LhajjaAI — your Morocco-only assistant. Which language would you like to set as your default?',
    fr: 'Bienvenue! Je suis LhajjaAI — votre assistant pour le Maroc. Quelle langue souhaitez-vous définir par défaut?',
    es: '¡Bienvenido! Soy LhajjaAI — tu asistente solo para Marruecos. ¿Qué idioma quieres establecer como predeterminado?',
    de: 'Willkommen! Ich bin LhajjaAI — dein Marokko-Assistent. Welche Sprache möchtest du als Standard festlegen?',
    nl: 'Welkom! Ik ben LhajjaAI — je Marokko-assistent. Welke taal wil je als standaard instellen?',
    it: 'Benvenuto! Sono LhajjaAI — il tuo assistente per il Marocco. Quale lingua vuoi impostare come predefinita?'
  }

  async function handleSelectLang(code: string) {
    try {
      setLang(code)
      document.cookie = `iDarija_lang=${code}; path=/; max-age=${60*60*24*365}`
      setShowLangPicker(false)
      // local assistant greeting
      setMessages((m) => [...m, { role: 'assistant', type: 'text', content: GREETINGS[code] || GREETINGS.en }])

      // inform server to persist preferred language (server patches user.preferred_language when lang provided)
      try {
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '', conversationId, lang: code }) })
        const j = await res.json()
        if (j?.conversationId) {
          setConversationId(j.conversationId)
          try { localStorage.setItem('iDarija_chat_conv', j.conversationId) } catch (e) {}
        }
      } catch (e) {}
    } catch (e) {
      console.warn('Failed to set language', e)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Quota Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-250 opacity-100">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQuotaModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-10 transition-all duration-250">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan Limit Reached</h3>
              <p className="text-gray-600 mb-6">{quotaMessage || 'You have reached today\'s free limit. Subscribe to Premium for unlimited access to Lhajja AI.'}</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowQuotaModal(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={() => router.push('/pricing')} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-white/70 via-sky-50 to-white/60 shadow-lg rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6ea3] to-[#ff6ea3] flex items-center justify-center text-white font-bold shadow">LH</div>
            <div>
              <div className="text-lg font-semibold">LhajjaAI</div>
              <div className="text-sm text-gray-500">Morocco-only assistant · Darija & cultural help</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            <button onClick={() => { localStorage.removeItem('iDarija_chat_conv'); setConversationId(null); setMessages([]) }} className="text-sm px-3 py-1 border rounded-md">Reset</button>
          </div>
        </div>

        <div className="md:flex">
          <div className="md:flex-1 p-6 h-[68vh] overflow-auto bg-white">
            {loadingHistory && <div className="text-sm text-gray-400">Loading conversation…</div>}
            {!loadingHistory && messages.length === 0 && !showLangPicker && <div className="text-sm text-gray-500">No messages yet — start by saying hi.</div>}

            {/* First-time language picker */}
            {showLangPicker && (
              <div className="p-6 bg-white border rounded-lg shadow-sm max-w-xl mx-auto">
                <div className="text-lg font-semibold mb-2">Welcome to LhajjaAI</div>
                <div className="text-sm text-gray-700 mb-4">Which language would you like to set as your default?</div>
                <div className="grid grid-cols-2 gap-2">
                  {LANG_OPTIONS.map(opt => (
                    <button key={opt.code} onClick={() => handleSelectLang(opt.code)} className="px-3 py-2 border rounded hover:bg-gray-50">{opt.label}</button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-3">You can change this later via the language selector.</div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.role === 'user' ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white' : 'bg-gray-50 text-gray-900'} p-3 rounded-2xl max-w-[80%] shadow-sm transform transition-all`}> 
                    {m.type === 'text' ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      <img src={m.url} alt={(m as any).alt || 'image'} className="max-w-full h-auto rounded-lg border" />
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />LhajjaAI is typing…</div>
                  </div>
                </div>
              )}

              {isTyping && typingText && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 text-gray-900 p-3 rounded-2xl max-w-[80%] shadow-sm">
                    <div className="whitespace-pre-wrap">{typingText}<span className="animate-pulse">▋</span></div>
                  </div>
                </div>
              )}

              <div ref={listRef} />
            </div>
          </div>

         
        </div>

        <div className="px-6 py-4 border-t bg-white">
          <form onSubmit={(e) => { e.preventDefault(); sendText() }} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} className="w-full border rounded-xl p-3 resize-none focus:ring-2 focus:ring-sky-200" rows={2} placeholder="Ask about Darija, Moroccan food, cities, or attach an image to discuss..." />

              {pendingPreview && (
                <div className="mt-3 flex items-center gap-3 bg-gray-50 p-2 rounded-md border">
                  <img src={pendingPreview} alt={pendingAttachment?.name || 'preview'} className="w-20 h-20 object-cover rounded-md border" />
                  <div className="flex-1">
                    <div className="text-sm">{pendingAttachment?.name}</div>
                    <div className="text-xs text-gray-500">Will upload when you send your message</div>
                  </div>
                  <button type="button" onClick={() => { if (pendingPreview) try { URL.revokeObjectURL(pendingPreview) } catch (e) {}; setPendingPreview(null); setPendingAttachment(null) }} className="px-2 py-1 border rounded-md text-sm">Remove</button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div>
                  <button type="button" onClick={triggerFile} title="Attach image" className="p-2 rounded-full hover:bg-gray-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600">
                      <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H12M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17.5 21L17.5 15M17.5 15L20 17.5M17.5 15L15 17.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0]
                      try { setPendingAttachment(f) } catch (err) {}
                      try {
                        const url = URL.createObjectURL(f)
                        setPendingPreview(url)
                      } catch (err) {}
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }} />
                  
                </div>
              </div>
              <button type="submit" disabled={sending} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full">{sending ? 'Sending…' : 'Send'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}