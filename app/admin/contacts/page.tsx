"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin-layout';
import { createClient } from '@supabase/supabase-js';



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      setMessages(data || []);
      setLoading(false);
    }
    fetchMessages();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="bg-white border rounded shadow">
          <div className="p-3 border-b font-semibold">Messages</div>
          <div className="divide-y">
            {messages.length === 0 && !loading && (
              <div className="p-4 text-gray-500">No messages found.</div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{msg.name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-600">{msg.email}</div>
                  <div className="text-xs text-gray-400 mt-1">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</div>
                </div>
                <button
                  className="px-3 py-1 bg-primary text-white rounded text-sm"
                  onClick={() => setSelected(msg)}
                >
                  Read
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for reading message */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
              <div className="mb-2 font-semibold text-lg">{selected.name || 'Anonymous'}</div>
              <div className="mb-2 text-sm text-gray-600">{selected.email}</div>
              <div className="mb-4 text-xs text-gray-400">{selected.created_at ? new Date(selected.created_at).toLocaleString() : ''}</div>
              <div className="whitespace-pre-line">{selected.message}</div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

