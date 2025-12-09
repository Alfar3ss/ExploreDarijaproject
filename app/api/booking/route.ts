
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Insert booking into Supabase
    const { error } = await supabase.from('bookings').insert([
      {
        name,
        email,
        date: date || null,
        time: time || null,
        duration: duration || '60',
        sessions_count: count,
        availability: avail,
        language: language || 'en',
        notes: notes || '',
      },
    ]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 500 })
  }
}
