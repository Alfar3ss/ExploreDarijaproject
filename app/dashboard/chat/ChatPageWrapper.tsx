"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChatWidget from "../../../components/chat-widget"
import ReactDOM from "react-dom"

export default function ChatPageWrapper({ initialLang }: { initialLang: string }) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    let mounted = true
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const json = await res.json()
        if (!json?.user) {
          router.replace(`/login?redirect=/dashboard/chat`)
          return
        }
        if (mounted) setUser(json.user)
        // Fetch user plan from Supabase
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
        const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
        if (SUPABASE_URL && SUPABASE_KEY && json.user.id) {
          const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${json.user.id}&select=plan`, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Accept: 'application/json',
            }
          })
          const userData = await userRes.json()
          const userPlan = userData?.[0]?.plan || 'free'
          if (mounted) setPlan(userPlan)
          if (userPlan === 'free') {
            setShowUpgradeModal(true)
          }
        } else {
          // fallback: treat as free
          setPlan('free')
          setShowUpgradeModal(true)
        }
      } catch {
        router.replace(`/login?redirect=/dashboard/chat`)
      } finally {
        if (mounted) setAuthChecked(true)
      }
    }
    checkAuth()
    return () => { mounted = false }
  }, [router])

    return (
      <div className="min-h-screen bg-white text-gray-900 relative">
        <div className={`max-w-4xl mx-auto px-6 py-8 ${!authChecked ? 'blur-sm brightness-90 pointer-events-none select-none' : ''}`}>
          <a href="/dashboard" className="text-sm text-primary">← Back</a>
          {user && plan === 'premium' && <ChatWidget initialLang={initialLang} />}
        </div>
        {/* Loading overlay while checking auth */}
        {!authChecked && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-b-4 border-gray-200 mb-4"></div>
              <span className="text-white text-lg font-semibold">Checking access...</span>
            </div>
          </div>
        )}
        {showUpgradeModal && typeof window !== 'undefined' && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">Premium Required</h3>
              <p className="text-gray-700 mb-4">This feature is available for Premium members only. Upgrade now to access the chat!</p>
              <a href="/upgrade" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition">Upgrade to Premium</a>
              <button onClick={() => window.location.href = '/dashboard'} className="ml-4 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>, document.body)
        }
      </div>
    )

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <a href="/dashboard" className="text-sm text-primary">← Back</a>
        {user && plan === 'premium' && <ChatWidget initialLang={initialLang} />}
      </div>
      {showUpgradeModal && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">Premium Required</h3>
            <p className="text-gray-700 mb-4">This feature is available for Premium members only. Upgrade now to access the chat!</p>
            <a href="/pricing" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition">Upgrade to Premium</a>
            <button onClick={() => window.location.href = '/dashboard'} className="ml-4 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          </div>
        </div>, document.body)
      }
    </div>
  )
}
