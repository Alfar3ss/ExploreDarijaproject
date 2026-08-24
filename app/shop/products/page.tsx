'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../../../lib/shop-products'

const filters = ['All', 'PDF guides', 'Printables', 'Bundles']

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { fetch('/api/products').then((response) => response.json()).then(setProducts).catch(() => setProducts([])) }, [])
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.title} ${product.description} ${product.type}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All' || (filter === 'PDF guides' && product.type.includes('PDF')) || (filter === 'Printables' && product.type === 'Printable') || (filter === 'Bundles' && product.type === 'Bundle')
    return matchesQuery && matchesFilter
  }), [filter, query])

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#171717]">
      <section className="border-b border-black/10 bg-[#f4a261]/20 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl"><Link href="/shop" className="text-sm font-bold text-[#e76f51] underline underline-offset-4">← Back to the shop</Link><p className="mt-12 text-sm font-bold uppercase tracking-[0.25em] text-[#e76f51]">The complete collection</p><h1 className="mt-3 max-w-3xl font-serif text-5xl font-normal leading-[0.95] md:text-8xl">Find your next<br /><span className="text-[#e76f51]">Darija download.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-black/65">Browse every guide, printable, and bundle created to help you speak Moroccan Darija in everyday life.</p></div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-20">
        <div className="mb-10 flex flex-col gap-5 border-b border-black/10 pb-8 md:flex-row md:items-center md:justify-between"><label className="relative block md:w-96"><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guides, travel, verbs..." className="w-full border border-black/20 bg-white px-4 py-3 pr-10 outline-none transition focus:border-black" />{query && <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-3 text-lg text-black/50">×</button>}</label><div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter products">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item} className={`border px-4 py-2 text-sm font-semibold transition ${filter === item ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}>{item}</button>)}</div></div>
        <p className="mb-6 text-sm font-bold uppercase tracking-widest text-black/45">{visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}</p>
        {visibleProducts.length === 0 ? <div className="border border-dashed border-black/30 py-20 text-center"><h2 className="font-serif text-3xl">No products to show</h2><p className="mt-3 text-black/60">Try another search or check back soon.</p><button onClick={() => { setQuery(''); setFilter('All') }} className="mt-6 bg-black px-5 py-3 text-sm font-bold text-white">Show everything</button></div> : <div className="grid gap-5 md:grid-cols-2">{visibleProducts.map((product) => <Link key={product.id} href={`/shop/products/${product.slug}`} className="flex min-h-[290px] flex-col justify-between border border-black/10 bg-white p-6 shadow-[5px_5px_0_#171717] transition hover:-translate-y-1 md:p-8"><div><div className={`mb-8 flex h-32 items-start justify-between p-5 text-white ${product.color}`}><span className="text-xs font-bold uppercase tracking-widest">{product.type}</span><span className="font-serif text-5xl leading-none">{product.label}</span></div><div className="flex items-start justify-between gap-4"><h2 className="font-serif text-3xl leading-tight">{product.title}</h2>{product.isNew && <span className="shrink-0 bg-[#ff7aac] px-2 py-1 text-[10px] font-bold uppercase tracking-wider">New</span>}</div><p className="mt-3 max-w-md text-sm leading-6 text-black/65">{product.description}</p></div><div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5"><span className="text-2xl font-bold">{product.price}</span><span className="bg-black px-5 py-3 text-sm font-bold text-white">View preview <span aria-hidden="true">↗</span></span></div></Link>)}</div>}
      </section>
    </main>
  )
}