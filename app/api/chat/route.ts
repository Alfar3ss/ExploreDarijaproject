import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY

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

// Lightweight heuristic language detector — returns one of: en, fr, es, de, nl, it, ar
function detectLanguage(text: string | undefined | null) {
  if (!text) return 'en'
  const s = String(text).toLowerCase()
  if (s.trim().length < 3) return 'en'

  // Arabic script
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(s)) return 'ar'

  const scores: Record<string, number> = { en: 0, fr: 0, es: 0, de: 0, nl: 0, it: 0 }

  const words = s.split(/[^\p{L}]+/u).filter(Boolean)
  const wset = new Set(words)

  // strong indicators
  if (wset.has('bonjour') || wset.has('merci') || s.includes("s'il") || s.includes('svp') || s.includes('aujourd')) scores.fr += 2
  if (wset.has('hola') || wset.has('gracias') || s.includes('¿') || wset.has('buenos') || wset.has('buenas')) scores.es += 2
  if (wset.has('ich') || wset.has('nicht') || wset.has('danke') || wset.has('hallo')) scores.de += 2
  if (wset.has('ciao') || wset.has('grazie') || wset.has('perche') || s.includes('perché')) scores.it += 2
  if (wset.has('dankjewel') || wset.has('alstublieft') || wset.has('goed') || wset.has('hallo')) scores.nl += 2

  // weaker indicators
  if (wset.has('the') || wset.has('and') || wset.has('is')) scores.en += 1
  if (wset.has('le') || wset.has('la') || wset.has('et') || wset.has('est')) scores.fr += 1
  if (wset.has('que') || wset.has('por') || wset.has('para') || wset.has('el')) scores.es += 1
  if (wset.has('der') || wset.has('die') || wset.has('das') || wset.has('und')) scores.de += 1
  if (wset.has('de') || wset.has('het') || wset.has('een')) scores.nl += 1
  if (wset.has('che') || wset.has('sei') || wset.has('per')) scores.it += 1

  // select best score
  let best = 'en'
  let bestScore = -1
  for (const k of Object.keys(scores)) {
    const sc = scores[k as keyof typeof scores]
    if (sc > bestScore) { bestScore = sc; best = k }
  }

  // require at least 2 points to override English, otherwise default to English
  if (bestScore >= 2) return best
  return 'en'
}

async function getUserFromSessionToken(token: string | null) {
  if (!token) return null

  const sessionUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/sessions?select=user_id&token=eq.${encodeURIComponent(token)}&limit=1`
  const sRes = await fetch(sessionUrl, { headers: supabaseHeaders() })
  if (!sRes.ok) return null

  const sRows = await sRes.json()
  if (!sRows?.length) return null
  const userId = sRows[0].user_id

  const userUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/users?select=id,name,email,preferred_language,is_premium&limit=1&id=eq.${encodeURIComponent(userId)}`
  const uRes = await fetch(userUrl, { headers: supabaseHeaders() })
  if (!uRes.ok) return null

  const rows = await uRes.json()
  return rows?.[0] || null
}

async function getTodayUserMessageCount(userId: string) {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))
  const isoStart = start.toISOString()
  const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/chat_messages?select=role&user_id=eq.${encodeURIComponent(userId)}&role=eq.user&created_at=gte.${encodeURIComponent(isoStart)}&limit=1`
  const res = await fetch(url, { headers: { ...supabaseHeaders(), Prefer: 'count=exact' } })
  if (!res.ok) return 0
  const range = res.headers.get('content-range') || ''
  const total = range.includes('/') ? parseInt(range.split('/')[1], 10) : NaN
  if (!Number.isNaN(total)) return total
  try {
    const rows = await res.json()
    return Array.isArray(rows) ? rows.length : 0
  } catch {
    return 0
  }
}

/* -------------------------------------------------------------------------- */
/*                                SYSTEM PROMPT                               */
/* -------------------------------------------------------------------------- */
const SYSTEM_PROMPT = (lang: string) => `
You are LhajjaAI — an AI that ONLY discusses Morocco, Darija, culture, food, cities, lifestyle, traditions, and Moroccan expressions.

Rules:
1. Default: answer in English unless the user explicitly asks to chat in a different language.
  If the user requests a different language (either by UI selection or by asking), reply in that language.
2. Your tone must be Moroccan, friendly, correct, and culturally accurate.
3. You ALWAYS understand Moroccan Darija slang exactly like a real Moroccan.
4. You never confuse slang with literal meaning.
   - "sat" ALWAYS means "bro", "khouya", "sahbi" depending on context.
   - NEVER interpret "sat" as time, hour, or sa3a.
   - "wafin asat" MUST be interpreted as a friendly greeting.
   - "chi bousa" ALWAYS means "a kiss", NEVER money.
5. When user uploads an image, carefully analyze it and describe ONLY what you clearly see.
6. NEVER hallucinate or guess. If unsure, say: "Mashi mbayn mzyan — the image is unclear."
7. If asked about anything non-Moroccan (tech, world news, etc.), respond:
   "Sorry — I can only answer questions about Morocco and Darija."

Behavior:
- For Darija slang → give the exact meaning used by native Moroccans.
- For mixed spellings (“bosa/bousa/bwsa”) → infer the correct Darija meaning.
- If the user asked about direction or location → provide a friendly response but do NOT give exact coordinates.
- Always keep responses concise and relevant to Moroccan culture.
- No medical, legal, or professional advice.
`

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const rawMessage = body.message
    const attachment = body.attachment || null
    const conversationId = body.conversationId || null
    const langHint = body.lang || null

    let message = ''
    let isAttachment = false
    let attachmentObj: any = null

    /* ------------------------------- Auth user ------------------------------ */
    const cookies = parseCookies(req.headers.get('cookie'))
    const token = cookies['iDarija_session'] || null
    const user = await getUserFromSessionToken(token)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const isPremium = !!(user as any).is_premium
    if (!isPremium) {
      const usedToday = await getTodayUserMessageCount(user.id)
      const DAILY_FREE_LIMIT = 10
      if (usedToday >= DAILY_FREE_LIMIT) {
        return NextResponse.json({
          error: 'Free plan limit reached',
          message: 'You reached the free plan limit of 10 messages for today. Subscribe to Premium for unlimited Lhajja AI.',
          limit: DAILY_FREE_LIMIT,
          used: usedToday
        }, { status: 429 })
      }
    }

    if (attachment && attachment.url) {
      isAttachment = true
      attachmentObj = {
        type: attachment.type || 'image',
        url: attachment.url,
        alt: attachment.alt || ''
      }
      message = '[attachment uploaded]'

      // attachments handled as metadata; no server-side audio transcription here
    } else if (typeof rawMessage === 'string') {
      message = rawMessage.trim()
    }

    /* ----------------------------- Language logic ---------------------------- */
    // Default to English unless the client explicitly provides a language hint (`langHint`).
    // If `langHint` is present (user selected a language), use it; otherwise default to English.
    let lang = (langHint || 'en').slice(0, 5)

    // Save language if first time
    if (!user.preferred_language && langHint) {
      const uurl = `${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`
      await fetch(uurl, {
        method: 'PATCH',
        headers: supabaseHeaders(),
        body: JSON.stringify({ preferred_language: langHint })
      })
    }

    /* ----------------------------- Load history ------------------------------ */
    let history: Array<{ role: string; content: any }> = []
    if (conversationId) {
      const hurl = `${SUPABASE_URL}/rest/v1/chat_messages?select=role,content&conversation_id=eq.${conversationId}&order=created_at.asc&limit=60`
      const hRes = await fetch(hurl, { headers: supabaseHeaders() })
      if (hRes.ok) {
        const rows = await hRes.json()
        history = rows.map((r: any) => ({ role: r.role, content: r.content }))
      }
    }

    /* -------------------------- Composer for OpenAI -------------------------- */

    let userMessageContent: any = []

    // If image → send a short textual descriptor (OpenAI message.content must be a string)
    if (isAttachment) {
      userMessageContent = `Image: ${attachmentObj.url}\nUser message: ${message}`
    } else {
      userMessageContent = message
    }

    // Ensure history content items are strings (OpenAI expects message.content to be a string)
    const safeHistory = history.map(h => ({ role: h.role, content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content) }))

    // Guard against extremely long histories that exceed the model context window.
    const MAX_HISTORY_MESSAGES = 40
    const MAX_MESSAGE_CHARS = 20000 // truncate any single message to this many characters

    let trimmedHistory = safeHistory
    if (safeHistory.length > MAX_HISTORY_MESSAGES) {
      console.warn(`Trimming conversation history from ${safeHistory.length} to ${MAX_HISTORY_MESSAGES} messages to avoid context overflow`)
      trimmedHistory = safeHistory.slice(-MAX_HISTORY_MESSAGES)
    }

    const normalizedHistory = trimmedHistory.map(h => ({
      role: h.role,
      content: (typeof h.content === 'string' && h.content.length > MAX_MESSAGE_CHARS) ? h.content.slice(-MAX_MESSAGE_CHARS) : h.content
    }))

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT(lang) },
      ...normalizedHistory,
      { role: 'user', content: userMessageContent }
    ]

    if (!OPENAI_KEY) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

    const payload = {
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 900
    }

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    })

    if (!aiRes.ok) {
      const t = await aiRes.text()
      return NextResponse.json({ error: "OpenAI error", details: t }, { status: 500 })
    }

    const data = await aiRes.json()
    const assistant = data?.choices?.[0]?.message?.content || ""

    /* ---------------------------- Save messages ----------------------------- */
    const convId = conversationId || crypto.randomUUID()

    if (!conversationId) {
      const curl = `${SUPABASE_URL}/rest/v1/conversations`
      await fetch(curl, {
        method: 'POST',
        headers: supabaseHeaders(),
        body: JSON.stringify({ id: convId, user_id: user.id })
      })
    }

    const murl = `${SUPABASE_URL}/rest/v1/chat_messages`

    // insert user msg
    await fetch(murl, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        conversation_id: convId,
        user_id: user.id,
        role: 'user',
        content: isAttachment ? JSON.stringify(attachmentObj) : message
      })
    })

    // insert ai msg
    await fetch(murl, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        conversation_id: convId,
        user_id: user.id,
        role: 'assistant',
        content: assistant
      })
    })

    return NextResponse.json({ assistant, conversationId: convId })

  } catch (err: any) {
    console.error("CHAT ERROR:", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const conversationId = url.searchParams.get("conversationId")

    const cookies = parseCookies(req.headers.get("cookie"))
    const token = cookies["iDarija_session"] || null
    const user = await getUserFromSessionToken(token)
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    let convId = conversationId

    if (!convId) {
      const cu = `${SUPABASE_URL}/rest/v1/conversations?select=id&user_id=eq.${user.id}&order=created_at.desc&limit=1`
      const r = await fetch(cu, { headers: supabaseHeaders() })
      const rows = await r.json()
      if (!rows?.length) return NextResponse.json({ messages: [], conversationId: null })
      convId = rows[0].id
    }

    const msgUrl = `${SUPABASE_URL}/rest/v1/chat_messages?select=role,content,created_at&conversation_id=eq.${convId}&order=created_at.asc`
    const res = await fetch(msgUrl, { headers: supabaseHeaders() })
    const msgs = await res.json()

    return NextResponse.json({ messages: msgs, conversationId: convId })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
} 
