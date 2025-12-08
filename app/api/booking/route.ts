import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, date, time, duration, language, notes, sessionsCount, availability } = body || {}

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields: name or email' }, { status: 400 })
    }

    // sessionsCount should be a positive integer
    const count = parseInt(String(sessionsCount || '1'), 10) || 1

    // availability is optional but if provided should be an array of {date,time}
    let avail: Array<{date: string; time: string}> = []
    if (Array.isArray(availability)) {
      avail = availability.map((a: any) => ({ date: String(a.date || ''), time: String(a.time || '') })).filter(a => a.date && a.time)
    }

    // Placeholder: in production you would persist this to a DB or send an email
    // For now we just echo back the booking and pretend it's accepted.
    const booking = {
      id: crypto.randomUUID(),
      name,
      email,
      date: date || null,
      time: time || null,
      duration: duration || '60',
      sessions_count: count,
      availability: avail,
      language: language || 'en',
      notes: notes || '',
      created_at: new Date().toISOString()
    }

    return NextResponse.json({ ok: true, booking }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 500 })
  }
}
