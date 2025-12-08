"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MotionDiv } from '../../components/motion-div'
import { useT } from '../../components/use-t'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const t = useT()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill all fields')
      return
    }
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
        })
        const data = await res.json()
        if (!res.ok) return setError(data?.error || 'Failed to create account')
        // server sets cookie; redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        setError('Failed to create account')
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <section className="max-w-md mx-auto py-20 px-6">
        <MotionDiv>
          <h1 className="text-2xl font-bold mb-4">{t('login.title') /* reuse Login title */}</h1>
          <p className="text-gray-600 mb-6">Create an account to post reviews and save progress.</p>

          <form onSubmit={submit} className="space-y-4">
            <input className="w-full border px-3 py-2 rounded" placeholder={t('contact.name')} value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full border px-3 py-2 rounded" placeholder={t('login.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full border px-3 py-2 rounded" placeholder={t('login.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button disabled={loading} className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark">{loading ? 'Creating...' : 'Create account'}</button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-primary font-semibold">Sign in</a>
          </div>
        </MotionDiv>
      </section>
    </main>
  )
}
