'use client'

import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { WhopCheckoutEmbed } from '@whop/checkout/react'

export default function ProductPurchase({ token, downloadUrl, slug }: { token?: string; downloadUrl?: string; slug: string }) {
  const [open, setOpen] = useState(false)
  const [downloadError, setDownloadError] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('success') !== 'true') return
    if (downloadUrl) window.location.assign(`/api/products/download?slug=${encodeURIComponent(slug)}`)
    else setDownloadError(true)
  }, [downloadUrl, slug])

  if (!token) return <p className="mt-3 text-center text-xs text-black/50">Checkout is not available yet.</p>
  return <>
    <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-center bg-black px-6 py-4 font-bold text-white transition hover:bg-[#e76f51]">Get instant access <span className="ml-2" aria-hidden="true">↗</span></button>{downloadError && <p className="mt-3 text-center text-xs text-red-600">Payment succeeded, but no PDF is configured for this product.</p>}
    {open && typeof document !== 'undefined' && ReactDOM.createPortal(<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"><div className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Complete your purchase</h2><button type="button" onClick={() => setOpen(false)} className="text-2xl text-gray-400" aria-label="Close checkout">×</button></div><WhopCheckoutEmbed planId={token} returnUrl={`${window.location.origin}/shop/products/${slug}?success=true`} /></div></div>, document.body)}
  </>
}