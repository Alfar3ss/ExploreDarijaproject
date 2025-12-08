export const metadata = {
  title: 'Contact — ExploreDarija',
}

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>
      <p className="text-gray-700 mb-4">Have questions or feedback? Drop us a message at <a href="mailto:contact@exploredarija.com" className="text-primary">contact@exploredarija.com</a>.</p>
      <div className="mt-6">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea className="mt-1 block w-full border rounded-md px-3 py-2" rows={6} />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Send</button>
        </form>
      </div>
    </main>
  )
}
