"use client"
import { useState, useEffect } from "react"
import ProtectedLink from "./protected-link"
import { MotionDiv } from "./motion-div"
import { useT } from "./use-t"
import Testimonials from "./testimonials"

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [user, setUser] = useState<any>(null)
  const [toast, setToast] = useState<string|null>(null)
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const json = await res.json()
        if (json?.user) setUser(json.user)
      } catch {}
    }
    fetchUser()
  }, [])

  const YEARLY_DISCOUNT = 0.3
  const plans = {
    free: { monthly: 0 },
    standard: { monthly: 5.99 },
    premium: { monthly: 29.99 },
  }

  const getYearlyPrice = (plan: keyof typeof plans) => {
    const p = plans[plan]
    const yearly = Math.round(p.monthly * 12 * (1 - YEARLY_DISCOUNT) * 100) / 100
    return yearly
  }

  const priceLabel = (plan: keyof typeof plans) => {
    const p = plans[plan]
    if (billing === "monthly") return `$${p.monthly}`
    const yearly = getYearlyPrice(plan)
    const perMonth = Math.round((yearly / 12) * 10) / 10
    return `$${yearly} / year (${perMonth}/mo)`
  }

  const CheckIcon = ({ className = "w-5 h-5 text-green-500" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.07 7.07a1 1 0 01-1.414 0l-3.182-3.182a1 1 0 111.414-1.414l2.475 2.475 6.363-6.364a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
  
  const FeatureIcon = ({ name }: { name: string }) => {
    // simple icon set by name
    if (name === "lessons") return (
      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>
    )
    if (name === "quiz") return (
      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 6h8M8 12h8M8 18h8"/></svg>
    )
    if (name === "zoom") return (
      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 10l4-2v8l-4-2"/><rect x="3" y="6" width="12" height="12" rx="2" strokeWidth="1.5"/></svg>
    )
    return (<svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" strokeWidth="1.5"/></svg>)
  }

  const savingsPercent = (_plan: keyof typeof plans) => {
    // Use a flat yearly discount percentage across plans
    return Math.round(YEARLY_DISCOUNT * 100)
  }

  // FAQ state for accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i)
  const t = useT()
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <section className="max-w-6xl mx-auto py-20 px-6">
        <MotionDiv className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">{t('pricing.title')}</h1>
              <p className="mt-2 text-gray-600 max-w-2xl">{t('pricing.subtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">{t('pricing.billing')}</div>
                <div className="relative inline-flex rounded-full bg-gray-100 p-1 w-40">
                <div className={`absolute top-1 left-1 w-1/2 h-8 bg-white rounded-md shadow transition-transform ${billing === 'yearly' ? 'translate-x-full' : 'translate-x-0'}`} />
                <button onClick={() => setBilling("monthly")} className={`relative z-10 w-1/2 text-sm font-medium py-1 ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-600'}`}>{t('pricing.monthly')}</button>
                <button onClick={() => setBilling("yearly")} className={`relative z-10 w-1/2 text-sm font-medium py-1 ${billing === 'yearly' ? 'text-gray-900' : 'text-gray-600'}`}>{t('pricing.yearly')}</button>
              </div>
              {billing === 'yearly' && (
                <div className="ml-2 text-sm text-green-600 font-semibold">Save {savingsPercent('standard')}%</div>
              )}
            </div>
          </div>
        </MotionDiv>

       {/* Choose Your Plan */}
<div className="max-w-5xl mx-auto">
  <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
    Choose Your Plan
  </h2>
  <p className="text-center text-gray-600 mb-10">
    Learn Darija your way — from basics to full cultural immersion.
  </p>

  {/* Pricing cards */}
  <div className="grid gap-6 md:grid-cols-3 mb-10">

    {/* FREE */}
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900">Free Plan</h3>
      <p className="text-sm text-gray-500 mt-1">Start learning Darija basics.</p>

      <div className="mt-6">
        <div className="text-3xl font-bold text-gray-900">$0</div>
        <div className="text-sm text-gray-500">Forever</div>
      </div>

      <ul className="mt-6 space-y-3 text-gray-700 flex-1 leading-relaxed">
        <li className="flex gap-2"><CheckIcon /> Limited lessons</li>
        <li className="flex gap-2"><CheckIcon /> Limited translations</li>
      </ul>

      <a href="/register" className="mt-6 block text-center px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50 transition">
        Get Started
      </a>
    </div>

    {/* PREMIUM */}
    <div className="relative bg-white border-2 border-primary rounded-2xl p-8 shadow-lg flex flex-col md:scale-105 overflow-hidden">
      {/* Ribbon badge (top-right) */}
      <div className="absolute top-0 right-0">
        <span className="inline-block bg-gradient-to-r from-orange-400 via-yellow-500 to-white-500 text-white text-[11px] font-bold tracking-wide px-3 py-1 rounded-bl-lg shadow-lg translate-x-1 -translate-y-1 ring-1 ring-white/40 backdrop-blur-sm">
          FREE • 3 MONTHS
        </span>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Premium Plan</h3>
        <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
      </div>

      <p className="text-sm text-gray-500 mt-1">
        Full access to lessons, tools & Lhajja AI.
      </p>

      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-gray-400 line-through">$4.99</span>
          <span className="text-3xl font-extrabold text-primary">$0</span>
        </div>
        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
          We're offering the Premium Plan free for 3 months as we launch!
        </span>
      </div>

      <div className="text-sm text-gray-500 mt-2">
        Limited time offer — no payment required
      </div>

      <ul className="mt-6 space-y-3 text-gray-800 flex-1 leading-relaxed">
        <li className="flex gap-2"><CheckIcon /> Unlimited translations</li>
        <li className="flex gap-2"><CheckIcon /> Access to Lhajja AI:</li>
        <ul className="ml-6 text-sm text-gray-600 space-y-1">
          <li>• Natural native Darija chat</li>
          <li>• Learn Moroccan culture</li>
          <li>• Cooking lessons: Tajine, Couscous, etc.</li>
          <li>• Instant help & explanations</li>
        </ul>
      </ul>

      <div className="mt-6">
        <button
          className="block text-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition w-full"
          onClick={async () => {
            // Always fetch latest user before action
            let latestUser = user
            try {
              const res = await fetch('/api/auth/me', { cache: 'no-store' })
              const json = await res.json()
              if (json?.user) latestUser = json.user
            } catch {}
            if (latestUser?.plan === 'premium') {
              setToast('You Already A Premium Member')
              setTimeout(() => setToast(null), 3000)
            } else {
              window.location.href = '/upgrade'
            }
          }}
        >
          Choose Plan
        </button>
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-[9999] font-semibold text-lg transition">
            {toast}
          </div>
        )}
      </div>
    </div>

    {/* 1-ON-1 PLAN */}
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900">1-on-1 Coaching</h3>
      <p className="text-sm text-gray-500 mt-1">
        Practice Darija live with a native Moroccan.
      </p>

      <div className="mt-6">
        <div className="text-3xl font-bold text-gray-900">$19.99</div>
        <div className="text-sm text-gray-500">per session</div>
      </div>

      <ul className="mt-6 space-y-3 text-gray-700 flex-1 leading-relaxed">
        <li className="flex gap-2"><CheckIcon /> Live Zoom conversation</li>
        <li className="flex gap-2"><CheckIcon /> Learn real-life Darija</li>
        <li className="flex gap-2"><CheckIcon /> Culture & travel help</li>
        <li className="flex gap-2"><CheckIcon /> Learn Moroccan food basics</li>
        <li className="flex gap-2"><CheckIcon /> Includes Premium for 3 months</li>
      </ul>

      <a href="/booking" className="mt-6 block text-center px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50 transition">
        Book a Session
      </a>
    </div>

  </div>
</div>

{/* 1-on-1 Coaching Section */}
<div className="max-w-4xl mx-auto mt-20">
  <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
    1-on-1 Darija Coaching
  </h2>
  <p className="text-center text-gray-600 mb-10">
    Learn Darija directly from a native speaker — real conversations, real progress.
  </p>

  <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-200">
    <h3 className="text-2xl font-semibold text-gray-900 mb-2">What You Get</h3>

    <ul className="space-y-3 text-gray-700 leading-relaxed">
      <li className="flex gap-3"><CheckIcon /> 1-on-1 Zoom lessons with a native Moroccan</li>
      <li className="flex gap-3"><CheckIcon /> Build real-life Darija confidence</li>
      <li className="flex gap-3"><CheckIcon /> Learn culture, expressions, and cooking skills</li>
      <li className="flex gap-3"><CheckIcon /> Personalized homework</li>
      <li className="flex gap-3"><CheckIcon /> Includes Premium access for 3 months</li>
    </ul>

    <a
      href="/booking"
      className="mt-8 block text-center px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
    >
      Book Your Session — $19.99
    </a>
  </div>
</div>

        {/* Compare Plans */}
<div className="max-w-5xl mx-auto mt-20">
  <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Compare Plans</h2>

  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-100 text-gray-900">
          <th className="p-4 font-semibold">Features</th>
          <th className="p-4 font-semibold text-center">Free</th>
          <th className="p-4 font-semibold text-center">Premium</th>
          <th className="p-4 font-semibold text-center">1-on-1 Coaching</th>
        </tr>
      </thead>

      <tbody className="text-gray-700">

        <tr className="border-t">
          <td className="p-4">Darija Lessons</td>
          <td className="p-4 text-center">Limited</td>
          <td className="p-4 text-center">Full Access</td>
          <td className="p-4 text-center">Full Access + Live Coaching</td>
        </tr>

        <tr className="border-t">
          <td className="p-4">Text Translation</td>
          <td className="p-4 text-center">Limited</td>
          <td className="p-4 text-center">Unlimited</td>
          <td className="p-4 text-center">Unlimited</td>
        </tr>

        <tr className="border-t">
          <td className="p-4">Lhajja AI (Darija AI)</td>
          <td className="p-4 text-center">Limited</td>
          <td className="p-4 text-center">✔</td>
          <td className="p-4 text-center">✔</td>
        </tr>

        <tr className="border-t">
          <td className="p-4">1-on-1 Zoom Sessions</td>
          <td className="p-4 text-center">✖</td>
          <td className="p-4 text-center">✖</td>
          <td className="p-4 text-center">✔</td>
        </tr>

        <tr className="border-t">
          <td className="p-4">3-Month Premium Included</td>
          <td className="p-4 text-center">✖</td>
          <td className="p-4 text-center">✖</td>
          <td className="p-4 text-center">✔</td>
        </tr>

      </tbody>
    </table>
  </div>
</div>


        {/* Guarantee */}
        <MotionDiv className="mb-10">
          <div className="p-6 rounded-xl bg-green-50 border border-green-100 shadow-sm">
            <h4 className="font-semibold text-gray-800">Refund & Guarantee</h4>
            <p className="text-gray-700 mt-2">7-day money-back guarantee. Cancel anytime. No hidden fees.</p>
          </div>
        </MotionDiv>

        {/* Testimonials */}
        <MotionDiv className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">What learners say</h3>
          <Testimonials />
        </MotionDiv>

        {/* FAQ */}
        <MotionDiv className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">{t('pricing.faq_title')}</h3>
          <div className="space-y-2">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes — cancel anytime from your account settings. No long-term lock-ins.' },
              { q: 'Is there a free trial?', a: 'We offer a free plan with limited access and occasional trial promotions for paid plans.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-panel-${i}`}
                  className="w-full text-left px-4 py-3 flex items-center justify-between"
                >
                  <span className="font-semibold">{item.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${openFaq === i ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div id={`faq-panel-${i}`} className="px-4" style={{ maxHeight: openFaq === i ? '200px' : '0px', transition: 'max-height 300ms ease' }}>
                  <div className={`text-gray-600 pb-3 ${openFaq === i ? 'pt-0' : 'pt-0'}`}>{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </MotionDiv>

        {/* Final CTA */}
          <div className="text-center py-10">
          <h3 className="text-2xl font-bold">Start Learning Darija Today</h3>
          <p className="text-gray-600 mt-2">Choose a plan and begin your journey.</p>
          <div className="mt-6">
            <a href="/login" className="inline-block px-6 py-3 bg-primary text-white rounded-md font-semibold">Choose a Plan and Begin</a>
          </div>
        </div>
      </section>
    </main>
  )
}
