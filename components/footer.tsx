"use client"
import Link from "next/link"
import { useT } from "./use-t"
import { useState } from "react"
import ProtectedLink from "./protected-link"
import { useRouter } from "next/navigation"
import { usePathname, useSearchParams } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const search = useSearchParams()
  const redirect = search?.get('redirect')
  if (pathname?.startsWith('/admin')) return null
  if (pathname === '/login' && redirect?.startsWith('/admin')) return null
  const t = useT()
  return (
    <footer className="w-full bg-black text-gray-200 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-3 no-underline">
              <img src="/MainLogo.png" alt={t('site.name')} className="w-6 h-6 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-white">{t('site.name')}</span>
              <span className="text-xs text-gray-400">{t('site.slogan')}</span>
            </div>
          </Link>

          <p className="mt-4 text-sm text-gray-400 max-w-sm">
            {t('footer.description')}
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.title_site')}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-primary transition">{t('nav.pricing')}</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-primary transition">{t('nav.blog')}</Link>
              </li>
              <li>
                <ProtectedLink href="/dashboard/chat" className="text-gray-300 hover:text-primary transition cursor-pointer">{t('nav.dictionary')}</ProtectedLink>
              </li>
              <li>
                <Link href="/translator" className="text-gray-300 hover:text-primary transition">{t('nav.translator')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">{t('footer.title_legal')}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-primary transition">{t('footer.privacy')}</Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-primary transition">{t('footer.terms')}</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary transition">{t('footer.contact')}</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">© {new Date().getFullYear()} {t('site.name')} — All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="https://twitter.com" className="text-gray-400 hover:text-white" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 19c7 0 10.8-6 10.8-11v-.5A7.8 7.8 0 0021 4.8a7.5 7.5 0 01-2.1.6 3.7 3.7 0 001.6-2 7.4 7.4 0 01-2.3.9A3.7 3.7 0 0013.5 4c-2 0-3.4 1.8-3 3.6A10.5 10.5 0 015 5.6a3.7 3.7 0 001.1 4.9 3.6 3.6 0 01-1.7-.5v.1c0 1.7 1.2 3.2 2.8 3.6a3.7 3.7 0 01-1.7.1c.5 1.6 2 2.8 3.7 2.8A7.4 7.4 0 015 17.6 10.4 10.4 0 008 19z" fill="currentColor"/></svg>
            </Link>
            <Link href="https://facebook.com" className="text-gray-400 hover:text-white" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.5 9.9v-7h-2.5v-3h2.5v-2.3c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 3h-2.4v7C18.3 21.1 22 17 22 12z" fill="currentColor"/></svg>
            </Link>
            <Link href="https://instagram.com" className="text-gray-400 hover:text-white" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="currentColor"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
