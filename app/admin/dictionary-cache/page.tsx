import React from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function Page() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Dictionary Cache (Admin)</h1>
        <p className="mt-4 text-red-600">Supabase is not configured. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment.</p>
      </main>
    )
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await supabase
    .from('dictionary_cache')
    .select('id, cache_key, source_lang, query_text, entry, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Dictionary Cache (Admin)</h1>
        <p className="mt-4 text-red-600">Failed to read from Supabase: {error.message}</p>
      </main>
    )
  }

  const entries: any[] = data || []

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dictionary Cache (Admin)</h1>
      <p className="text-sm text-gray-600 mb-6">Showing latest {entries.length} entries</p>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2 border">Created</th>
              <th className="px-3 py-2 border">Cache Key</th>
              <th className="px-3 py-2 border">Source</th>
              <th className="px-3 py-2 border">Query</th>
              <th className="px-3 py-2 border">Entry (JSON)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="align-top hover:bg-gray-50">
                <td className="px-3 py-2 border text-sm">{new Date(e.created_at).toLocaleString()}</td>
                <td className="px-3 py-2 border text-sm break-words max-w-xs">{e.cache_key}</td>
                <td className="px-3 py-2 border text-sm">{e.source_lang}</td>
                <td className="px-3 py-2 border text-sm break-words max-w-xs">{e.query_text}</td>
                <td className="px-3 py-2 border text-sm font-mono whitespace-pre-wrap max-w-2xl">{JSON.stringify(e.entry, null, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
