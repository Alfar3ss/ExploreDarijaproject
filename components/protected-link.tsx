"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import ReactDOM from "react-dom"

interface ProtectedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function ProtectedLink({ href, children, className, onClick }: ProtectedLinkProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const json = await res.json()
        setIsLoggedIn(!!json?.user)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (isLoggedIn === false) {
      e.preventDefault()
      setShowModal(true)
      setTimeout(() => setModalVisible(true), 10)
    } else if (onClick) {
      onClick()
    }
  }

  const closeModal = () => {
    setModalVisible(false)
    fadeTimeout.current = setTimeout(() => setShowModal(false), 250)
  }

  const handleLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(href)}`)
  }

  return (
    <>
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
      {showModal && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-250 ${modalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-10 transition-all duration-250" style={{ transform: modalVisible ? 'translateY(0)' : 'translateY(40px)', opacity: modalVisible ? 1 : 0 }}>
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Login Required
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-4">
                You need to be logged in to use this feature. Please log in to continue.
              </p>

              {/* Login Form */}
              <form
                className="w-full flex flex-col gap-3 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
                  const password = (form.elements.namedItem('password') as HTMLInputElement)?.value
                  if (!email || !password) {
                    setError('Please enter both email and password.')
                    return
                  }
                  setError('')
                  setLoading(true)
                  try {
                    const res = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, password })
                    })
                    const json = await res.json()
                    if (res.ok && json?.user) {
                      closeModal()
                      router.refresh()
                      router.push(href)
                    } else {
                      setError(json?.error || 'Login failed. Please try again.')
                    }
                  } catch {
                    setError('Login failed. Please try again.')
                  }
                  setLoading(false)
                }}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  autoComplete="email"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  autoComplete="current-password"
                  required
                />
                {error && <div className="text-red-500 text-sm text-left mt-1">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { closeModal(); router.push('/register') }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>, document.body)
      }
    </>
  )
}
