"use client"

import { useState } from 'react'
export default function BookingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [sessionsCount, setSessionsCount] = useState('1')
  const [availability, setAvailability] = useState<Array<{date: string; time: string}>>([])
  const PRICE_PER_SESSION = 15.99
  const [language, setLanguage] = useState('en')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setMessage('')

    // Use the first slot in availability as the main date/time if not set
    let mainDate = date;
    let mainTime = time;
    if ((!mainDate || !mainTime) && availability.length > 0) {
      mainDate = availability[0].date;
      mainTime = availability[0].time;
    }

    try {
      const payload = { name, email, date: mainDate, time: mainTime, duration, language, notes, sessionsCount, availability }
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Request failed')
      setStatus('success')
      setMessage('Booking request submitted. We will email you confirmation shortly.')
      setName('')
      setEmail('')
      setDate('')
      setTime('')
      setDuration('30')
      setLanguage('en')
      setNotes('')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-2xl font-bold mb-2">Book a Native Speaker Session</h1>
        <p className="text-gray-600 mb-2">Choose a convenient time for a Zoom session with a native Darija speaker. Fill out the form below and we will confirm via email.</p>
        <div className="mb-6 inline-flex items-center gap-3">
          <div className="text-sm text-gray-600">Price per session</div>
          <div className="px-2 py-1 bg-gray-100 rounded font-semibold">${PRICE_PER_SESSION.toFixed(2)} / session</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Full name</span>
              <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 p-2 border rounded" placeholder="Your name" />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium">Email</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 p-2 border rounded" placeholder="you@example.com" />
            </label>
          </div>

          

          <div className="p-4 bg-white border rounded">
            <h3 className="font-medium mb-2">Sessions & Availability</h3>
            <p className="text-sm text-gray-600 mb-3">Sessions are 1 hour each. Add one or more preferred 1-hour slots when you're available.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Number of sessions</span>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    step={1}
                    value={sessionsCount}
                    onChange={e => setSessionsCount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="mt-1 p-2 border rounded max-w-xs"
                    aria-label="Number of sessions"
                  />
                </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Preferred date</span>
                <input
                  type="date"
                  className="mt-1 p-2 border rounded"
                  id="avail-date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Preferred start time</span>
                <input
                  type="time"
                  className="mt-1 p-2 border rounded"
                  id="avail-time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => {
                if (!date || !time) return alert('Please choose date and time for availability');
                setAvailability(prev => [...prev, { date, time }]);
              }} className="px-3 py-2 bg-secondary text-white rounded">Add slot</button>
              <div className="text-sm text-gray-600">Each slot is a 1-hour block starting at the time you choose.</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">Price per session</div>
              <div className="font-semibold">${PRICE_PER_SESSION.toFixed(2)}</div>
              <div className="text-sm">Total: <span className="font-semibold">${(Number(sessionsCount || '1') * PRICE_PER_SESSION).toFixed(2)}</span></div>
            </div>

            {availability.length > 0 && (
              <ul className="mt-3 space-y-2">
                {availability.map((s, i) => (
                  <li key={i} className="flex items-center justify-between border p-2 rounded">
                    <div>{s.date} • {s.time} — 1h</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setAvailability(prev => prev.filter((_, idx) => idx !== i))} className="text-sm text-red-600">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium">Preferred language for the session</span>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="mt-1 p-2 border rounded max-w-xs">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
            <div className="text-sm text-gray-600">Note: Only English, French and Arabic are currently supported for now.</div>

          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">Notes / What would you like to practice?</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 p-2 border rounded" placeholder="E.g., conversation practice, pronunciation, business vocabulary" />
          </label>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={status === 'sending'} className="px-4 py-2 bg-primary text-white rounded">
              {status === 'sending' ? 'Sending...' : 'Request Booking'}
            </button>
            <a href="/dashboard" className="text-sm text-gray-600">Back to dashboard</a>
          </div>

          {message && (
            <div className={`mt-3 p-3 rounded ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
