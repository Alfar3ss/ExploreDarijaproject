
import ChatWidget from '../../components/chat-widget'
import { cookies, headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  // determine initial language (cookie or header)
  const cookieStore = cookies()
  const cookieLang = cookieStore.get('iDarija_lang')?.value
  let initial = 'en'
  if (cookieLang) initial = cookieLang.split('-')[0]
  else {
    const hdrs = headers()
    const accept = hdrs.get('accept-language') || ''
    const first = accept.split(',')[0] || 'en'
    initial = first.split('-')[0]
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <a href="/dashboard" className="text-sm text-primary">← Back</a>
        <ChatWidget initialLang={initial} />
      </div>
    </div>
  )
}
