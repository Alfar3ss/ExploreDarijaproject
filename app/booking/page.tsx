"use client"

import { useState } from 'react'

export default function BookingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [sessionsCount, setSessionsCount] = useState('1')
  const [availability, setAvailability] = useState<Array<{date: string; time: string}>>([])
  const PRICE_PER_SESSION = 9.99
  const [language, setLanguage] = useState('en')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setMessage('')
    let mainDate = date
    let mainTime = time
    if ((!mainDate || !mainTime) && availability.length > 0) {
      mainDate = availability[0].date
      mainTime = availability[0].time
    }
    try {
      const payload = { name, email, date: mainDate, time: mainTime, duration: '60', language, notes, sessionsCount, availability }
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Request failed')
      setStatus('success')
      setMessage('Booking request submitted. We will email you confirmation shortly.')
      setName(''); setEmail(''); setDate(''); setTime('')
      setSessionsCount('1'); setLanguage('en'); setNotes('')
      setAvailability([])
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong')
    }
  }

  const total = (Number(sessionsCount || '1') * PRICE_PER_SESSION).toFixed(2)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        .booking-root { font-family: 'DM Sans', sans-serif; }
        .booking-root h1 { font-family: 'Playfair Display', serif; }
        .slot-item { animation: fadeUp 0.2s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .input-field {
          width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb;
          border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          background: #fff; color: #111; transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .input-field:focus { border-color: #6C63FF; box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
        .label-text { font-size: 12px; font-weight: 500; color: #6b7280; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 6px; display: block; }
        .card { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 16px; padding: 24px; }
        .section-title { font-size: 13px; font-weight: 600; color: #374151; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }
        .add-slot-btn {
          padding: 9px 18px; background: #6C63FF; color: #fff; border: none;
          border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s, transform 0.1s;
        }
        .add-slot-btn:hover { background: #5a52e0; transform: translateY(-1px); }
        .submit-btn {
          width: 100%; padding: 14px; background: #111; color: #fff; border: none;
          border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;
          transition: background 0.15s, transform 0.1s;
        }
        .submit-btn:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: #f3f0ff; color: #6C63FF; border-radius: 8px; padding: 4px 10px; font-size: 13px; font-weight: 500; }
      `}</style>

      <div className="booking-root min-h-screen py-14 px-4" style={{background: 'linear-gradient(135deg, #fafafa 0%, #f3f0ff 100%)'}}>
        <div style={{maxWidth: 680, margin: '0 auto'}}>

          {/* Header */}
          <div style={{marginBottom: 36}}>
            <div className="badge" style={{marginBottom: 14}}>
              <span>🎙️</span> 1-on-1 Native Speaker
            </div>
            <h1 style={{fontSize: 32, fontWeight: 600, color: '#111', marginBottom: 8, lineHeight: 1.2}}>
              Book a Free Trial Darija Session
            </h1>
            <p style={{color: '#6b7280', fontSize: 15, fontWeight: 300}}>
              Practice real Moroccan Darija with a native speaker over Zoom. Pick your slot, and if you are satisfied, you can continue with a paid plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 20}}>

            {/* Personal Info */}
            <div className="card">
              <div className="section-title">Your info</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div>
                  <label className="label-text">Full name</label>
                  <input className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="Ahmed Benali" />
                </div>
                <div>
                  <label className="label-text">Email</label>
                  <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="card">
              <div className="section-title">Sessions & availability</div>
              <p style={{fontSize: 13, color: '#9ca3af', marginBottom: 16}}>Each session is 1 hour. Book a free trail now.</p>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16}}>
                <div>
                  <label className="label-text">Number of sessions</label>
                  <input className="input-field cursor-not-allowed" type="number" min={1} max={1000} value={sessionsCount}
                    onChange={e => setSessionsCount(e.target.value.replace(/[^0-9]/g, ''))} readOnly disabled />
                </div>
                <div>
                  <label className="label-text">Preferred date</label>
                  <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Start time</label>
                  <input className="input-field" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
                <button type="button" className="add-slot-btn" onClick={() => {
                  if (!date || !time) return alert('Please choose a date and time first')
                  setAvailability(prev => [...prev, { date, time }])
                }}>
                  + Add slot
                </button>
                <span style={{fontSize: 12, color: '#9ca3af'}}>Each slot is a 1-hour block</span>
              </div>

              {availability.length > 0 && (
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {availability.map((s, i) => (
                    <div key={i} className="slot-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', border: '1.5px solid #f0f0f0', borderRadius: 10, padding: '10px 14px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <span style={{fontSize: 16}}>📅</span>
                        <span style={{fontSize: 13, fontWeight: 500}}>{s.date}</span>
                        <span style={{color: '#9ca3af', fontSize: 12}}>•</span>
                        <span style={{fontSize: 13, color: '#6b7280'}}>{s.time} — 1h</span>
                      </div>
                      <button type="button" onClick={() => setAvailability(prev => prev.filter((_, idx) => idx !== i))}
                        style={{fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'}}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing summary */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '14px 16px', background: '#f3f0ff', borderRadius: 12}}>
                <div style={{fontSize: 13, color: '#6b7280'}}>${PRICE_PER_SESSION.toFixed(2)} × {sessionsCount} session{Number(sessionsCount) > 1 ? 's' : ''}</div>
                <div style={{fontSize: 18, fontWeight: 600, color: '#6C63FF'}}>${total}</div>
              </div>
            </div>

            {/* Language */}
            <div className="card">
              <div className="section-title">Session language</div>
              <div style={{display: 'flex', gap: 10}}>
                {[{val:'en', label:'🇬🇧 English'}, {val:'fr', label:'🇫🇷 Français'}, {val:'ar', label:'🇲🇦 العربية'}].map(l => (
                  <button key={l.val} type="button" onClick={() => setLanguage(l.val)}
                    style={{
                      padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      border: language === l.val ? '2px solid #6C63FF' : '1.5px solid #e5e7eb',
                      background: language === l.val ? '#f3f0ff' : '#fff',
                      color: language === l.val ? '#6C63FF' : '#6b7280',
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s'
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
              <p style={{fontSize: 12, color: '#9ca3af', marginTop: 8}}>Only English, French and Arabic are supported for now.</p>
            </div>

            {/* Notes */}
            <div className="card">
              <div className="section-title">What would you like to practice?</div>
              <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                placeholder="E.g., conversation practice, pronunciation, greetings, business vocabulary..."
                style={{resize: 'vertical'}} />
            </div>

            {/* Submit */}
            <div>
              <button type="submit" className="submit-btn" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending request...' : 'Request Booking →'}
              </button>
              <div style={{textAlign: 'center', marginTop: 12}}>
                <a href="/dashboard" style={{fontSize: 13, color: '#9ca3af', textDecoration: 'none'}}>← Back to dashboard</a>
              </div>
            </div>

            {message && (
              <div style={{
                padding: '14px 16px', borderRadius: 12, fontSize: 14,
                background: status === 'success' ? '#f0fdf4' : '#fef2f2',
                color: status === 'success' ? '#166534' : '#991b1b',
                border: `1.5px solid ${status === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                {status === 'success' ? '✅ ' : '❌ '}{message}
              </div>
            )}

          </form>
        </div>
      </div>
    </>
  )
}