'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Product } from '../lib/shop-products'

const filters = ['All', 'PDF guides', 'Printables', 'Bundles']

export default function ShopClient() {
  const [filter, setFilter] = useState('All')
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { fetch('/api/products').then((response) => response.json()).then(setProducts).catch(() => setProducts([])) }, [])
  const visibleProducts = products.filter((product) => {
    if (filter === 'All') return true
    if (filter === 'PDF guides') return product.type.includes('PDF')
    if (filter === 'Printables') return product.type === 'Printable'
    return product.type === 'Bundle'
  })

  return (
    <main className="bg-[#fffaf5] text-[#171717]">
      <section className="relative overflow-hidden bg-black px-5 pb-20 pt-16 text-white md:px-10 md:pb-28 md:pt-24">
        <div className="absolute right-[-5rem] top-[-7rem] h-72 w-72 rounded-full border-[3rem] border-[#ff7aac]/30 md:h-96 md:w-96" />
        <div className="relative mx-auto grid max-w-6xl items-end gap-12 md:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.28em] text-[#ff7aac]">The Darija shelf</p>
            <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] tracking-tight md:text-8xl">Small guides.<br /><span className="text-[#ff7aac]">Big conversations.</span></h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-gray-300">Downloadable tools for speaking Moroccan Darija with more confidence, whether you are planning your first visit or deepening your connection.</p>
          </div>
          <div className="relative mx-auto w-full max-w-sm rotate-2 md:mb-2">
            <div className="absolute -left-3 -top-3 h-full w-full border border-[#ff7aac]" />
            <div className="relative bg-[#ff7aac] p-7 text-black shadow-2xl">
              <div className="flex items-start justify-between border-b border-black/30 pb-16"><span className="text-xs font-bold uppercase tracking-widest">ExploreDarija</span><span className="font-serif text-3xl">د</span></div>
              <div className="py-12"><p className="font-serif text-5xl leading-none">Speak<br />from the<br />heart.</p><p className="mt-6 text-sm font-bold uppercase tracking-widest">A practical Darija collection</p></div>
              <div className="flex justify-between text-xs font-bold uppercase"><span>PDF + audio-ready</span><span>2026 edition</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e76f51]">Learn at your pace</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">New tools for real life</h2></div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter products">
            {filters.map((item) => <button key={item} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item} className={`border px-4 py-2 text-sm font-semibold transition ${filter === item ? 'border-black bg-black text-white' : 'border-black/20 bg-transparent hover:border-black'}`}>{item}</button>)}
          </div>
        </div>
        <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-5"><p className="text-sm text-black/60">A fresh collection for your next conversation.</p><Link href="/shop/products" className="text-sm font-bold text-[#e76f51] underline underline-offset-4">Browse all products <span aria-hidden="true">↗</span></Link></div>
        <div className="grid gap-5 md:grid-cols-2">
          {visibleProducts.length === 0 ? <div className="border border-dashed border-black/30 bg-white py-20 text-center md:col-span-2"><h2 className="font-serif text-3xl">No products to show</h2><p className="mt-3 text-black/60">Check back soon for new Darija tools.</p></div> : visibleProducts.map((product) => <Link key={product.id} href={`/shop/products/${product.slug}`} className="group flex min-h-[290px] flex-col justify-between border border-black/10 bg-white p-6 shadow-[5px_5px_0_#171717] transition-transform hover:-translate-y-1 md:p-8">
            <div>
              <div className={`relative mb-8 flex h-32 items-start justify-between overflow-hidden p-5 text-white ${product.color}`}>{product.imageUrls[0] && <img src={product.imageUrls[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />}{product.imageUrls[0] && <div className="absolute inset-0 bg-black/20" />}<span className="relative text-xs font-bold uppercase tracking-widest">{product.type}</span><span className="relative font-serif text-5xl leading-none">{product.label}</span></div>
              <div className="flex items-start justify-between gap-4"><h3 className="font-serif text-3xl leading-tight">{product.title}</h3>{product.featured && <span className="shrink-0 bg-[#ff7aac] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">Popular</span>}</div>
              <p className="mt-3 max-w-md text-sm leading-6 text-black/65">{product.description}</p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5"><span className="text-2xl font-bold">{product.price}</span><span className="bg-black px-5 py-3 text-sm font-bold text-white transition group-hover:bg-[#e76f51]">View preview <span aria-hidden="true">↗</span></span></div>
          </Link>)}
        </div>
      </section>

      <section id="checkout" className="border-y border-black/10 bg-[#f4a261]/20 px-5 py-16 md:px-10 md:py-20"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e76f51]">More than a download</p><h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Language lives in the little things.</h2></div><div className="flex flex-col gap-5 text-lg leading-8 text-black/70 md:flex-row md:items-center"><img src="/hero.png" alt="Moroccan landscape" className="h-28 w-28 object-cover grayscale" /><p>Each guide is made to get you past memorizing words and into the rhythm of everyday Moroccan life. Instant access, clear examples, and no classroom required.</p></div></div></section>
      <section className="mx-auto max-w-6xl px-5 py-16 text-center md:px-10 md:py-24"><p className="font-serif text-3xl md:text-5xl">“Yallah, let&apos;s speak Darija.”</p><p className="mt-5 text-sm text-black/60">Already learning with us? <Link href="/translator" className="font-bold text-[#e76f51] underline underline-offset-4">Practice a phrase in the translator</Link>.</p></section>
    </main>
  )
}