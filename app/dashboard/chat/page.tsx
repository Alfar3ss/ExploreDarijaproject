
'use client'

import loadable from 'next/dynamic'

const ChatPageWrapper = loadable(() => import('./ChatPageWrapper'), { ssr: false })

export default function ChatPage() {
  // determine initial language from browser
  let initial = 'en'
  
  if (typeof window !== 'undefined') {
    const lang = navigator.language || navigator.languages?.[0] || 'en'
    initial = lang.split('-')[0]
  }

  return <ChatPageWrapper initialLang={initial} />
}
