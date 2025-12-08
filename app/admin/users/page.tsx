"use client"
import React, { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin-layout'


const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function supabaseHeaders() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
  }
}


export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users')
        const json = await res.json()
        if (json.users) {
          setUsers(json.users)
        } else {
          setUsers([])
          console.error('API error:', json.error)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Handlers for actions (should call Supabase API in production)
  const banUser = async (id: string) => {
    setUsers(users => users.map(u => u.id === id ? { ...u, is_active: false } : u))
    // TODO: call Supabase PATCH to set is_active=false
  }
  const unbanUser = async (id: string) => {
    setUsers(users => users.map(u => u.id === id ? { ...u, is_active: true } : u))
    // TODO: call Supabase PATCH to set is_active=true
  }
  const deleteUser = async (id: string) => {
    setUsers(users => users.filter(u => u.id !== id))
    // TODO: call Supabase DELETE to remove user
  }
  const changePlan = async (id: string, plan: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, plan })
      })
      if (!res.ok) {
        const err = await res.text()
        console.error('Failed to update plan:', err)
      } else {
        setUsers(users => users.map(u => u.id === id ? { ...u, plan } : u))
      }
    } catch (err) {
      console.error('Failed to update plan:', err)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <p className="text-sm text-gray-600 mb-6">Manage registered users and roles.</p>
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Plan</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={!user.is_active ? 'bg-red-50' : ''}>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">
                    <select value={user.plan || 'free'} onChange={e => changePlan(user.id, e.target.value)} className="border rounded px-2 py-1">
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="p-2 border">{user.is_active ? 'Active' : 'Banned'}</td>
                  <td className="p-2 border flex gap-2 items-center">
                    <span className={
                      user.plan === 'premium'
                        ? 'px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold'
                        : 'px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs font-semibold'
                    }>
                      {user.plan === 'premium' ? 'Premium Member' : 'Free Plan Member'}
                    </span>
                    {!user.is_active ? (
                      <button onClick={() => unbanUser(user.id)} className="px-2 py-1 bg-green-500 text-white rounded">Unban</button>
                    ) : (
                      <button onClick={() => banUser(user.id)} className="px-2 py-1 bg-yellow-500 text-white rounded">Ban</button>
                    )}
                    <button onClick={() => deleteUser(user.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
