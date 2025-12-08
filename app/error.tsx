"use client"
import React from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white shadow-md rounded p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
        <div>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
