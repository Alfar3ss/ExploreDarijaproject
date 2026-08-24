import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchProductBySlug, fetchProducts, productSlug } from '../../../../lib/shop-products'
import ProductPurchase from '../../../../components/product-purchase'

export async function generateStaticParams() {
  const products = await fetchProducts()
  return products.map((product) => ({ slug: product.slug || productSlug(product.title) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  return { title: product ? `${product.title} | ExploreDarija` : 'Product not found | ExploreDarija', description: product?.description }
}

export default async function ProductPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product) notFound()
  const previewImages = product.imageUrls.length ? product.imageUrls : [null]

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#171717]">
      <section className="border-b border-black/10 bg-white px-5 py-5 md:px-10"><div className="mx-auto max-w-6xl"><Link href="/shop/products" className="text-xs font-bold uppercase tracking-[0.18em] text-black/55 transition hover:text-[#e76f51]">Shop / {product.type} / {product.title}</Link></div></section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] md:gap-16 md:px-10 md:py-16 lg:gap-24">
        <div className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)]">
          <div className="order-2 grid grid-cols-4 gap-3 sm:order-1 sm:grid-cols-1">
            {previewImages.map((image, index) => <div key={image || 'fallback'} className={`flex aspect-square items-center justify-center overflow-hidden border border-black/15 bg-white ${index === 0 ? 'ring-2 ring-black ring-offset-2' : ''}`} aria-label={`Product image ${index + 1}`}>{image ? <img src={image} alt={`${product.title} preview ${index + 1}`} className="h-full w-full object-cover" /> : <span className={`flex h-[85%] w-[85%] items-center justify-center text-xl font-bold text-white ${product.color}`}>{product.label}</span>}</div>)}
          </div>
          <div className={`relative order-1 flex aspect-[4/5] min-h-[440px] flex-col justify-between overflow-hidden p-8 text-white shadow-[8px_8px_0_#171717] sm:order-2 md:p-12 ${product.color}`}>
            {product.imageUrls[0] && <><img src={product.imageUrls[0]} alt={product.title} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/45" /></>}
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[3rem] border-white/15" />
            <div className="relative flex justify-between border-b border-white/40 pb-6 text-xs font-bold uppercase tracking-widest"><span>ExploreDarija</span><span>{product.type}</span></div>
            <div className="relative"><span className="font-serif text-8xl leading-none">{product.label}</span><h2 className="mt-6 max-w-lg font-serif text-5xl leading-[0.95] md:text-6xl">{product.title}</h2></div>
            <span className="relative text-xs font-bold uppercase tracking-widest">Digital download / 2026 edition</span>
          </div>
        </div>
        <div className="md:sticky md:top-8 md:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e76f51]">{product.isNew ? 'New release' : product.type}</p>
          <h1 className="mt-4 font-serif text-5xl font-normal leading-[0.95] md:text-6xl">{product.title}</h1>
          <div className="mt-5 flex items-center gap-3"><span className="text-3xl font-bold">{product.price}</span><span className="text-sm text-black/50">USD</span></div>
          <p className="mt-6 text-base leading-7 text-black/65">{product.description}</p>
          <div className="mt-8 border-y border-black/15 py-6"><ProductPurchase token={product.whopToken} downloadUrl={product.digitalFileUrl || product.downloadUrl} slug={product.slug} /><p className="mt-3 text-center text-xs text-black/50">Digital product · Available immediately after checkout</p></div>
          <div className="divide-y divide-black/10 text-sm"><div className="flex justify-between gap-8 py-5"><span className="font-bold">What&apos;s included</span><span className="text-right text-black/65">{product.included}</span></div><div className="flex justify-between gap-8 py-5"><span className="font-bold">Format</span><span className="text-right text-black/65">{product.format}</span></div><div className="flex justify-between gap-8 py-5"><span className="font-bold">Language</span><span className="text-right text-black/65">{product.language}</span></div></div>
        </div>
      </section>
      <section id="checkout" className="border-t border-black/10 bg-[#f4a261]/20 px-5 py-16 md:px-10"><div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[.7fr_1.3fr] md:items-center"><p className="font-serif text-3xl md:text-4xl">Ready to start speaking?</p><p className="max-w-xl text-black/65">Your download will be ready right after secure checkout. Keep it nearby for your next conversation, trip, or coffee order.</p></div></section>
    </main>
  )
}