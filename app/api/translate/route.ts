import { NextResponse } from 'next/server'
import { normalizeText, applyOverrides, DEFAULT_OVERRIDES } from '../../../lib/normalize'

const OPENAI_KEY = process.env.OPENAI_API_KEY

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const serverCache = new Map<string, any>()

type UsageKey = string
type UsageVal = { date: string; count: number }
const usageCounter = new Map<UsageKey, UsageVal>()
const DAILY_FREE_LIMIT = 15

function supabaseHeaders() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase not configured')
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

function parseCookies(header: string | null) {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const pair of header.split(';')) {
    const [k, ...rest] = pair.split('=')
    if (!k) continue
    out[k.trim()] = decodeURIComponent((rest || []).join('=').trim())
  }
  return out
}

async function getUserFromSessionToken(token: string | null) {
  if (!token || !SUPABASE_URL) return null

  const sessionUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/sessions?select=user_id&token=eq.${encodeURIComponent(token)}&limit=1`
  const sRes = await fetch(sessionUrl, { headers: supabaseHeaders() })
  if (!sRes.ok) return null

  const sRows = await sRes.json()
  if (!sRows?.length) return null
  const userId = sRows[0].user_id

  const userUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/users?select=id,is_premium&limit=1&id=eq.${encodeURIComponent(userId)}`
  const uRes = await fetch(userUrl, { headers: supabaseHeaders() })
  if (!uRes.ok) return null

  const rows = await uRes.json()
  return rows?.[0] || null
}

export async function POST(req: Request) {
  try {
    if (!OPENAI_KEY)
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })

    const body = await req.json()
    const { text: rawText, sourceLang, targetLang, mode } = body || {}
    if (!rawText)
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })

    // Server-side quota enforcement (10/day) for non-premium users; anonymous allowed with anon id cookie
    const cookies = parseCookies(req.headers.get('cookie'))
    const token = cookies['iDarija_session'] || null
    const user = await getUserFromSessionToken(token)

    const today = new Date().toISOString().slice(0, 10)
    let usageKey: string
    let setCookieHeader: string | null = null

    if (user) {
      const isPremium = !!(user as any).is_premium
      if (!isPremium) {
        usageKey = `u:${user.id}`
      } else {
        usageKey = ''
      }
    } else {
      const anonId = cookies['iDarija_translator_anon'] || crypto.randomUUID()
      usageKey = `a:${anonId}`
      if (!cookies['iDarija_translator_anon']) {
        setCookieHeader = `iDarija_translator_anon=${anonId}; Path=/; Max-Age=31536000; SameSite=Lax`
      }
    }

    if (usageKey) {
      const existing = usageCounter.get(usageKey)
      const count = existing && existing.date === today ? existing.count : 0
      if (count >= DAILY_FREE_LIMIT) {
        const resp = NextResponse.json({
          error: 'Free plan limit reached',
          message: `You reached the free plan limit of ${DAILY_FREE_LIMIT} translations for today. Subscribe to Premium for unlimited access.`,
          limit: DAILY_FREE_LIMIT,
          used: count
        }, { status: 429 })
        if (setCookieHeader) resp.headers.set('Set-Cookie', setCookieHeader)
        return resp
      }
      usageCounter.set(usageKey, { date: today, count: count + 1 })
    }

    const normalized = normalizeText(String(rawText))
    const canonical = applyOverrides(normalized, DEFAULT_OVERRIDES)

    const cacheKey = `${mode || 'translate'}:${sourceLang || 'auto'}:${targetLang || 'darija'}:${canonical}`
    if (serverCache.has(cacheKey)) {
      const resp = NextResponse.json({ ok: true, result: serverCache.get(cacheKey) })
      if (setCookieHeader) resp.headers.set('Set-Cookie', setCookieHeader)
      return resp
    }

 // 🚀🚀🚀 EXTREME HARD-MODE MOROCCAN DARIJA TRANSLATOR
const systemPrompt = `
You are a Moroccan Darija native speaker and professional translator.
You MUST return ONLY JSON. NEVER return explanations, markdown, or any text outside the JSON.

=========================
ABSOLUTE TRANSLATION RULES
=========================

1. You ALWAYS understand Moroccan Darija slang exactly like a real Moroccan.
2. You never confuse slang with literal meaning.
   - "sat" ALWAYS means "bro", "khouya", "sahbi" depending on context.
   - NEVER interpret "sat" as time, hour, or sa3a.
   - "wafin asat" MUST be interpreted as a friendly greeting.
   - "chi bousa" ALWAYS means "a kiss", NEVER money.
3. If the user input is ONE word:
   → You MUST switch to DICTIONARY MODE automatically.
4. If the user input is a phrase:
   → Perform translation mode.
5. If the user writes Darija in weird phonetics, you MUST auto-correct using Moroccan intuition.

=========================
STRICT OUTPUT FORMATS
=========================

When in TRANSLATE MODE:
Return EXACT JSON:
{
  "translation": "...",    
  "transliteration": "...",
  "pronunciation": "...",
  "notes": "short cultural explanation"
}

When in DICTIONARY MODE:
Return EXACT JSON:
{
  "word": "...",
  "part_of_speech": "...",
  "meanings": [
    { "sense": "...", "english": "...", "darija_example": "...", "english_example": "..." }
  ],
  "synonyms": ["...", "..."],
  "notes": "short cultural usage"
}

=========================
STRICT LANGUAGE RULES
=========================

- Darija output MUST be in Latin script ONLY (3,7,9,kh,gh,sh…)
- NO Arabic script ever.
- NO Markdown.
- NO commentary.
- ONLY valid JSON.

=========================
SLANG PRIORITY MAPPING (DO NOT OVERRIDE)
=========================

These slang meanings override all other meanings ALWAYS:

- "sat" → "bro", "khouya", "sahbi"
- "asat" → "bro", "my guy"
- "wafin asat" → "what's up bro"
- "mzyan" → "good / fine"
- "zwin" → "beautiful"
- "bgha" → "want"
- "sbah lkhir" → "good morning"
- "3afak" → "please"
- "dir" → "do"
- "khoya" → "bro"
- "bghit" → "I want"

These are NOT allowed alternatives:
- DO NOT interpret "sat" as hour/time
- DO NOT interpret "bousa" as money
- DO NOT interpret "asat" as time
- DO NOT interpret slang literally

=========================
OUTPUT ENFORCEMENT
=========================
If your output is not valid JSON → You FAIL.
If you add anything outside JSON → You FAIL.

You MUST output ONLY JSON.`


    const userMessage = `
mode: ${mode || 'translate'}
sourceLang: ${sourceLang || 'auto'}
targetLang: ${targetLang || 'darija'}
original_text: ${rawText}
canonical_text: ${canonical}
`

    const payload = {
      model: 'gpt-4.1-mini',
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const text = await res.text()
      const resp = NextResponse.json(
        { error: `OpenAI error: ${res.status} ${text}` },
        { status: 502 }
      )
      if (setCookieHeader) resp.headers.set('Set-Cookie', setCookieHeader)
      return resp
    }

    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content || ''

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'Model did not return valid JSON', raw },
        { status: 502 }
      )
    }

    serverCache.set(cacheKey, parsed)

    const resp = NextResponse.json({ ok: true, result: parsed })
    if (setCookieHeader) resp.headers.set('Set-Cookie', setCookieHeader)
    return resp

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
