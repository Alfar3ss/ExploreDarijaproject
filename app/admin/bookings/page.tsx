"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin-layout';
import { createClient } from '@supabase/supabase-js';



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      setBookings(data || []);
      setLoading(false);
    }
    fetchBookings();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>
        <p className="text-sm text-gray-600 mb-6">View and manage all lesson or session bookings here.</p>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">Recent Bookings</h2>
          {loading ? (
            <div className="text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-gray-500">No bookings to display yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Time</th>
                    <th className="p-2 border">Language</th>
                    <th className="p-2 border">Sessions</th>
                    <th className="p-2 border">Notes</th>
                    <th className="p-2 border">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="p-2 border">{b.name}</td>
                      <td className="p-2 border">{b.email}</td>
                      <td className="p-2 border">{b.date || '-'}</td>
                      <td className="p-2 border">{b.time || '-'}</td>
                      <td className="p-2 border">{b.language}</td>
                      <td className="p-2 border">{b.sessions_count}</td>
                     
                      <td className="p-2 border">{b.notes}</td>
                      <td className="p-2 border">{b.created_at ? new Date(b.created_at).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
