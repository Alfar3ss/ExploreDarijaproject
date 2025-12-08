import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const OPENAI_KEY = process.env.OPENAI_API_KEY

async function callOpenAI(count = 6) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured')

  const prompt = `You are a helpful assistant that returns a JSON array of ${count} short Moroccan Darija words or short phrases suitable for beginner learners. For each item return an object with keys: "darija" (the word in Latin romanization), "translit" (a simple phonetic transliteration, optional), and "meaning" (short English gloss). Respond with a single JSON object: { "suggestions": [ ... ] } and do not include any extra text.`

  const payload = {
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'You generate concise JSON responses only.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400,
    temperature: 0.7,
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${t}`)
  }

  const j = await res.json()
  const content = j?.choices?.[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(content)
    return parsed
  } catch (e) {
    // try to extract JSON substring
    const m = content.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('Failed to parse OpenAI response as JSON')
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const count = Number(url.searchParams.get('count') || '6')
    try {
      const result = await callOpenAI(count)
      return NextResponse.json({ ok: true, suggestions: result.suggestions || [] })
    } catch (err) {
      console.warn('OpenAI suggestions failed', err)
      return NextResponse.json({ ok: false, error: (err as Error).message })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'unexpected' }, { status: 500 })
  }
}
