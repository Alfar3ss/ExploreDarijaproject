import React from 'react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white shadow-md rounded p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-gray-600">The page you are looking for does not exist.</p>
      </div>
    </div>
  )
}
