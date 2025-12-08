"use client"
import { MotionDiv } from "./motion-div"
import { useT } from "./use-t"
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginForm({ redirect = '', onSuccess }: { redirect?: string; onSuccess?: () => void }) {
  const t = useT()
  const router = useRouter()
  const search = useSearchParams()
  const searchRedirect = search?.get('redirect') || ''
  const finalRedirect = redirect || searchRedirect
  const isAdminLogin = finalRedirect?.startsWith('/admin')

  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setError(null)
  }, [password])

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || email.trim().length === 0) return setError('Please enter email')
    if (!password || password.trim().length === 0) return setError('Please enter password')
    ;(async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok) return setError(data?.error || 'Invalid credentials')
        if (data?.user) {
          localStorage.setItem('iDarija_user', JSON.stringify({ name: data.user.name, email: data.user.email }))
        }
        localStorage.setItem('iDarija_admin', JSON.stringify({ loggedAt: Date.now(), email }))
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace(finalRedirect || '/admin');
        }
      } catch (err) {
        setError('Failed to sign in')
      }
    })()
  }

  const handleNormalLogin = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)
        const email = String(formData.get('email') || '')
        const password = String(formData.get('password') || '')
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok) return setError(data?.error || 'Invalid credentials')
        if (data?.user) {
          localStorage.setItem('iDarija_user', JSON.stringify({ name: data.user.name, email: data.user.email }))
        }
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace(finalRedirect || '/dashboard');
        }
      } catch (err) {
        setError('Failed to sign in')
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <section className="max-w-md mx-auto py-20 px-6">
      <MotionDiv>
        {isAdminLogin ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">Login To Your Admin Panel</h1>
            <p className="text-gray-600 mb-6">Enter the administrator password to continue.</p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark">Login</button>
            </form>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4">{t('login.title')}</h1>
            <p className="text-gray-600 mb-6">{t('login.subtitle')}</p>

            <form onSubmit={handleNormalLogin} className="space-y-4">
              <input name="email" className="w-full border px-3 py-2 rounded" placeholder={t('login.email')} />
              <input name="password" className="w-full border px-3 py-2 rounded" placeholder={t('login.password')} type="password" />
              <button disabled={loading} className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark">{loading ? 'Signing in...' : t('login.sign_in')}</button>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </form>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="w-full mt-4 border border-primary text-primary py-2 rounded hover:bg-primary/10 transition font-semibold"
            >
              Create Account
            </button>
          </div>
        )}
      </MotionDiv>
    </section>
  )
}
