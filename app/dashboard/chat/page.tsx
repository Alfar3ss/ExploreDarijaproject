
import { cookies, headers } from 'next/headers'
import loadable from 'next/dynamic'

export const dynamic = 'force-dynamic'

const ChatPageWrapper = loadable(() => import('./ChatPageWrapper'), { ssr: false })

export default function ChatPage() {
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

  return <ChatPageWrapper initialLang={initial} />
}
