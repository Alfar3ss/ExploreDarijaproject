"use client"
import { useState, useEffect, Suspense } from "react"
import ReactDOM from "react-dom"
import { useSearchParams, useRouter } from "next/navigation"
import Script from "next/script"




    export default function UpgradePage() {
    return (
      <Suspense fallback={<div className="min-h-screen bg-white" />}> 
        <UpgradePageContent />
      </Suspense>
    )
}

function UpgradePageContent() {
  const [gumroadReady, setGumroadReady] = useState(false)
  const handleUpgradeClick = () => {
  if (typeof window !== 'undefined' && (window as any).GumroadOverlay) {
    (window as any).GumroadOverlay.show('upgrade.exploredarija.com')
  } else {
    // fallback: open as popup window (not full tab)
    window.open(
      'upgrade.exploredarija.com',
      'gumroad',
      'width=650,height=650,left=400,top=100'
    )
  }
}
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [loadingUpgrade, setLoadingUpgrade] = useState(false)
  useEffect(() => {
    let mounted = true
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const json = await res.json()
        if (json?.user) {
          if (mounted) setIsLoggedIn(true)
          if (mounted) setUser(json.user)
        } else {
          router.replace(`/login?redirect=/upgrade`)
        }
      } catch {
        router.replace(`/login?redirect=/upgrade`)
      } finally {
        if (mounted) setAuthChecked(true)
      }
    }
    checkAuth()
    return () => { mounted = false }
  }, [router])
  const params = useSearchParams()
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  // Selected plan (default = premium)
  const selectedPlan = params?.get("plan") || "premium"

  const plans = {
    premium: { monthly: 2.99, yearly: 25.11, label: "Premium Plan" },
    standard: { monthly: 5.99, yearly: 49.99, label: "Standard Plan" },
  }

  const plan = plans[selectedPlan as keyof typeof plans]

  return (
    <main className="min-h-screen bg-white text-gray-800 relative">
      <div className={`${!authChecked || !isLoggedIn ? 'blur-sm brightness-90 pointer-events-none select-none' : ''}`}>
        <section className="max-w-4xl mx-auto py-20 px-6">
          <h1 className="text-4xl font-bold text-center">Welcome to ExploreDarija Premium!</h1>
          

          {/* Plan card */}
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 mt-10">
            <h2 className="text-2xl font-semibold text-gray-900">
              {plan.label}
            </h2>

            {/* Billing Switch (disabled for free) */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-gray-600 text-sm">Billing:</span>
              <div className="relative inline-flex rounded-full bg-gray-100 p-1 w-40">
              <div  className={`absolute top-1 h-8 w-1/2 bg-white rounded-md shadow transition-all duration-200 ${
      billing === "yearly" ? "left-[50%]" : "left-1"
    }`}
  />
  <button
    onClick={() => setBilling("monthly")}
    className={`relative z-10 w-1/2 text-sm font-medium py-1 ${
      billing === "monthly" ? "text-gray-900" : "text-gray-500"
    }`}
  >
    Monthly
  </button>
  <button
    onClick={() => setBilling("yearly")}
    className={`relative z-10 w-1/2 text-sm font-medium py-1 ${
      billing === "yearly" ? "text-gray-900" : "text-gray-500"
    }`}
  >
    Yearly -30%
  </button>
</div>
</div>

            {/* Price */}
            <div className="text-4xl font-bold">
  ${billing === "monthly" ? plan.monthly : plan.yearly}
</div>
<div className="text-sm text-gray-500 mt-1">
  per {billing === "monthly" ? "month" : "year"}
</div>

            {/* Features */}
            <ul className="mt-8 text-gray-700 space-y-3 leading-relaxed">
              <li>✔ Unlimited translations</li>
              <li>✔ Full access to all lessons</li>
              <li>✔ Lhajja AI — native Darija chat</li>
              <li>✔ Culture, cooking, expressions</li>
            </ul>

            {/* Button */}
           
  
             <button
    onClick={handleUpgradeClick}
    className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
  >
    Upgrade to Premium
  </button>

  <Script
    src="https://gumroad.com/js/gumroad.js"
    strategy="afterInteractive"
    onLoad={() => setGumroadReady(true)}
  />

          </div>
        </section>
      </div>
      {/* Loading overlay while checking auth */}
      {(!authChecked || !isLoggedIn) && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-b-4 border-gray-200 mb-4"></div>
            <span className="text-white text-lg font-semibold"></span>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <h3 className="text-2xl font-bold text-primary mb-4">Invoice</h3>
            <table className="w-full mb-4 text-left border border-gray-200 rounded-lg overflow-hidden">
              <tbody>
                <tr className="border-b"><td className="py-2 px-4 font-semibold">User</td><td className="py-2 px-4">{user?.email}</td></tr>
                <tr className="border-b"><td className="py-2 px-4 font-semibold">Plan</td><td className="py-2 px-4">Premium</td></tr>
                <tr><td className="py-2 px-4 font-semibold">Total</td><td className="py-2 px-4 text-green-700 font-bold">${billing === "monthly" ? plan.monthly : plan.yearly}</td></tr>
              </tbody>
            </table>
            <button
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition mb-2"
              disabled={loadingUpgrade}
              onClick={async () => {
                setLoadingUpgrade(true)
                // Update Supabase user plan to premium
                try {
                  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
                  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
                  if (SUPABASE_URL && SUPABASE_KEY && user?.id) {
                    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
                      method: 'PATCH',
                      headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ plan: 'premium' })
                    })
                  }
                  setShowInvoice(false)
                  setShowCongrats(true)
                } catch {
                  alert('Upgrade failed. Please try again.')
                }
                setLoadingUpgrade(false)
              }}
            >
              {loadingUpgrade ? 'Processing...' : 'Pay Now'}
            </button>
            <button
              className="w-full mt-2 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
              onClick={() => setShowInvoice(false)}
              disabled={loadingUpgrade}
            >
              Cancel
            </button>
          </div>
        </div>, document.body)
      }

      {/* Congrats Modal */}
      {showCongrats && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[201] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <h3 className="text-2xl font-bold text-green-700 mb-2">Congratulations!</h3>
            <p className="mb-4 text-gray-700">You have successfully upgraded to the Premium Plan. Enjoy all the features!</p>
            <button
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition"
              onClick={() => { setShowCongrats(false); router.push('/dashboard') }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>, document.body)
      }
    </main>
  )
}

