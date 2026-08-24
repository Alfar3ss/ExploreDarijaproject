'use client'

import { FormEvent, useEffect, useState } from 'react'
import type { Product } from '../lib/shop-products'

type ProductForm = Omit<Product, 'id' | 'slug' | 'price' | 'imageUrl'> & { price: string }
const blankForm: ProductForm = { title: '', description: '', price: '', type: 'Digital download', included: 'Examples, exercises, quick-reference pages', format: 'PDF guide, made for phone or print', language: 'Moroccan Darija + English', label: '', color: '', imageUrls: [''], checkoutUrl: '', whopToken: '', downloadUrl: '', digitalFileUrl: '', isNew: false, featured: false }

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return fallback
}

function formFromProduct(product: Product): ProductForm {
  return { ...blankForm, title: product.title, description: product.description, price: product.price.replace(/[^0-9.]/g, ''), type: product.type, included: product.included, format: product.format, language: product.language, label: product.label, color: product.color, imageUrls: product.imageUrls.length ? product.imageUrls : [''], checkoutUrl: product.checkoutUrl || '', whopToken: product.whopToken || '', downloadUrl: product.downloadUrl || '', digitalFileUrl: product.digitalFileUrl || '', isNew: Boolean(product.isNew), featured: Boolean(product.featured) }
}

export default function AdminShop() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductForm>(blankForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  async function loadProducts() {
    const response = await fetch('/api/admin/products', { cache: 'no-store' })
    const data = await response.json()
    setProducts(data.products || [])
    if (!response.ok) setMessage(errorMessage(data.error, 'Unable to load products'))
  }
  useEffect(() => { loadProducts() }, [])

  function updateField(field: keyof ProductForm, value: string | boolean) { setForm((current) => ({ ...current, [field]: value })) }
  function updateImage(index: number, value: string) { setForm((current) => ({ ...current, imageUrls: current.imageUrls.map((image, imageIndex) => imageIndex === index ? value : image) })) }

  async function upload(index: number, file: File, kind: 'image' | 'file') {
    setUploadingIndex(index)
    const body = new FormData(); body.append('file', file); body.append('kind', kind)
    const response = await fetch('/api/uploads', { method: 'POST', body }); const data = await response.json(); setUploadingIndex(null)
    if (!response.ok) return setMessage(errorMessage(data.error, 'Unable to upload file'))
    if (kind === 'image') updateImage(index, data.url); else updateField('digitalFileUrl', data.url)
    setMessage(kind === 'image' ? `Image ${index + 1} uploaded` : 'PDF uploaded')
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage('Saving...')
    const response = await fetch('/api/admin/products', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingId ? { id: editingId, ...form } : form) })
    const data = await response.json()
    if (!response.ok) return setMessage(errorMessage(data.error, 'Unable to save product'))
    setForm(blankForm); setEditingId(null); setMessage('Product saved'); loadProducts()
  }

  async function removeProduct(id: string) {
    if (!window.confirm('Delete this product?')) return
    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) { setMessage('Product deleted'); loadProducts() } else setMessage('Unable to delete product')
  }

  const inputClass = 'mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary'
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold text-gray-900">Shop products</h1><p className="mt-1 text-sm text-gray-500">Manage the products shown in the public shop.</p></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-gray-200 px-5 py-4"><h2 className="font-semibold">Catalog <span className="ml-2 text-sm font-normal text-gray-500">{products.length}</span></h2><button type="button" onClick={() => { setForm(blankForm); setEditingId(null); setMessage('') }} className="rounded bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200">New product</button></div>{products.length === 0 ? <div className="px-5 py-16 text-center text-sm text-gray-500">No products to show.</div> : <div className="divide-y divide-gray-100">{products.map((product) => <div key={product.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><h3 className="truncate font-medium text-gray-900">{product.title}</h3><p className="mt-1 truncate text-sm text-gray-500">{product.type} · {product.price}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setForm(formFromProduct(product)); setEditingId(product.id); setMessage('') }} className="rounded border border-gray-300 px-3 py-1.5 text-sm">Edit</button><button type="button" onClick={() => removeProduct(product.id)} className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600">Delete</button></div></div>)}</div>}</section>
      <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><h2 className="mb-5 font-semibold">{editingId ? 'Edit product' : 'Add product'}</h2><div className="space-y-4">
        <label className="block text-sm font-medium">Title<input required value={form.title} onChange={(event) => updateField('title', event.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium">Description<textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} className={`${inputClass} min-h-24`} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Price<input type="number" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} className={inputClass} /></label><label className="block text-sm font-medium">Type<input value={form.type} onChange={(event) => updateField('type', event.target.value)} className={inputClass} /></label></div>
        <label className="block text-sm font-medium">What&apos;s included<input value={form.included} onChange={(event) => updateField('included', event.target.value)} className={inputClass} /></label><label className="block text-sm font-medium">Format<input value={form.format} onChange={(event) => updateField('format', event.target.value)} className={inputClass} /></label><label className="block text-sm font-medium">Language<input value={form.language} onChange={(event) => updateField('language', event.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium">Whop product token<input value={form.whopToken} onChange={(event) => updateField('whopToken', event.target.value)} className={inputClass} placeholder="plan_..." /></label>
        <div><span className="block text-sm font-medium">Digital PDF</span><label className="mt-1 flex cursor-pointer items-center justify-between rounded border border-dashed border-gray-300 p-3 text-sm hover:border-primary"><span className="truncate text-gray-600">{form.digitalFileUrl ? 'PDF uploaded. Choose another to replace it.' : 'Choose the PDF to deliver after payment.'}</span><input type="file" accept="application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(0, file, 'file'); event.currentTarget.value = '' }} className="sr-only" /></label></div>
        <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">Product images</span><span className="text-xs text-gray-500">1–4 images. First is the main image.</span></div><div className="space-y-3">{form.imageUrls.map((image, index) => <div key={index} className="flex items-center gap-2"><label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded border border-dashed border-gray-300 p-2 hover:border-primary"><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(index, file, 'image'); event.currentTarget.value = '' }} className="sr-only" /><span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 text-xs text-gray-500">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : uploadingIndex === index ? '...' : `Image ${index + 1}`}</span><span className="truncate text-sm text-gray-600">{uploadingIndex === index ? 'Uploading...' : image ? 'Replace image' : 'Choose image'}</span></label><button type="button" onClick={() => setForm((current) => ({ ...current, imageUrls: current.imageUrls.filter((_, imageIndex) => imageIndex !== index) }))} disabled={form.imageUrls.length === 1 || uploadingIndex === index} className="px-2 text-gray-500 disabled:opacity-30" aria-label={`Remove image ${index + 1}`}>×</button></div>)}</div>{form.imageUrls.length < 4 && <button type="button" onClick={() => setForm((current) => ({ ...current, imageUrls: [...current.imageUrls, ''] }))} className="mt-2 text-sm font-medium text-primary">+ Add image slot</button>}</div>
        <div className="flex gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.isNew)} onChange={(event) => updateField('isNew', event.target.checked)} /> New</label><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => updateField('featured', event.target.checked)} /> Featured</label></div>
        <button disabled={uploadingIndex !== null} className="w-full rounded bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-primary disabled:opacity-50">{editingId ? 'Update product' : 'Add product'}</button>{message && <p className="text-center text-sm text-gray-500">{message}</p>}
      </div></form>
    </div>
  </div>
}
