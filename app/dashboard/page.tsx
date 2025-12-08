import { cookies, headers } from 'next/headers'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { SUPPORTED_LANGS } from '../../lib/suggestions'

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

async function getUserFromSession(token: string) {
  const sessionUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/sessions?select=user_id&token=eq.${encodeURIComponent(token)}&limit=1`
  const sesRes = await fetch(sessionUrl, { headers: supabaseHeaders() })
  if (!sesRes.ok) return null
  const sesRows = await sesRes.json()
  if (!Array.isArray(sesRows) || !sesRows.length) return null
  const userId = sesRows[0].user_id
  const userUrl = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/users?select=id,name,email&limit=1&id=eq.${encodeURIComponent(userId)}`
  const userRes = await fetch(userUrl, { headers: supabaseHeaders() })
  if (!userRes.ok) return null
  const users = await userRes.json()
  if (!Array.isArray(users) || !users.length) return null
  return users[0]
}

// Static pool of suggestions. Each entry contains translations for supported languages.
type Suggestion = { darija: string; translit?: string; meanings: { en: string; fr: string; es?: string; de?: string; it?: string } }

const SUGGESTED_POOL: Suggestion[] = [
  { darija: 'salam', translit: 'salam', meanings: { en: 'Hello', fr: 'Salut', es: 'Hola', de: 'Hallo', it: 'Ciao' } },
  { darija: 'labas', translit: 'labas', meanings: { en: "How are you / I'm fine", fr: "Ça va / Je vais bien", es: '¿Qué tal? / Estoy bien', de: "Wie geht's? / Mir geht's gut", it: 'Come stai? / Sto bene' } },
  { darija: 'shukran', translit: 'shukran', meanings: { en: 'Thank you', fr: 'Merci', es: 'Gracias', de: 'Danke', it: 'Grazie' } },
  { darija: 'afak', translit: 'afak', meanings: { en: 'Please / Excuse me', fr: "S'il vous plaît / Excusez-moi", es: 'Por favor / Disculpe', de: 'Bitte / Entschuldigung', it: 'Per favore / Scusi' } },
  { darija: 'bslama', translit: 'bslama', meanings: { en: 'Goodbye', fr: 'Au revoir', es: 'Adiós', de: 'Auf Wiedersehen', it: 'Arrivederci' } },
  { darija: 'mzyan', translit: 'mzian', meanings: { en: 'Good / Fine', fr: 'Bien', es: 'Bien', de: 'Gut', it: 'Bene' } },
  { darija: 'khouya', translit: 'khouya', meanings: { en: 'Brother / bro', fr: 'Frère / mon frère', es: 'Hermano', de: 'Bruder', it: 'Fratello' } },
  { darija: 'khti', translit: 'khti', meanings: { en: 'Sister / sis', fr: 'Soeur / ma sœur', es: 'Hermana', de: 'Schwester', it: 'Sorella' } },
  { darija: 'inshallah', translit: 'inshallah', meanings: { en: 'God willing', fr: 'Si Dieu le veut', es: 'Si Dios quiere', de: 'So Gott will', it: 'Se Dio vuole' } },
  { darija: 'yallah', translit: 'yallah', meanings: { en: "Let's go / come on", fr: 'Allez / On y va', es: 'Vamos', de: 'Los gehts', it: 'Andiamo' } },
  { darija: 'bzaf', translit: 'bzaf', meanings: { en: 'A lot / very', fr: 'Beaucoup / très', es: 'Mucho / muy', de: 'Viel / sehr', it: 'Molto' } },
  { darija: 'smah lia', translit: 'smah lia', meanings: { en: 'Sorry / pardon me', fr: 'Pardon / Désolé', es: 'Perdón / Lo siento', de: 'Entschuldigung / Sorry', it: 'Scusa / Mi dispiace' } },
  { darija: 'wach', translit: 'wach', meanings: { en: 'Question marker (is/are/do?)', fr: 'Marqueur de question (est/êtes/faites?)', es: 'Marcador de pregunta', de: 'Fragewort', it: 'Indicatore di domanda' } },
  { darija: 'fin', translit: 'fin', meanings: { en: 'Where', fr: 'Où', es: 'Dónde', de: 'Wo', it: 'Dove' } },
  { darija: 'daba', translit: 'daba', meanings: { en: 'Now', fr: 'Maintenant', es: 'Ahora', de: 'Jetzt', it: 'Adesso' } },
  { darija: 'ghadi', translit: 'ghadi', meanings: { en: 'Going to / will', fr: 'Va / ira', es: 'Va a / irá', de: 'Wird', it: 'Andrà' } },
  { darija: 'bghit', translit: 'bghit', meanings: { en: 'I want', fr: "Je veux", es: 'Quiero', de: 'Ich will', it: 'Voglio' } },
  { darija: 'ma bghit sh', translit: 'ma bghitsh', meanings: { en: "I don't want", fr: "Je ne veux pas", es: 'No quiero', de: 'Ich will nicht', it: 'Non voglio' } },
  { darija: "ma'andich", translit: 'maandich', meanings: { en: "I don't have", fr: "Je n'ai pas", es: 'No tengo', de: 'Ich habe nicht', it: "Non ho" } },
  { darija: 'mashi', translit: 'mashi', meanings: { en: 'Not / isn’t', fr: 'Pas / n’est pas', es: 'No / no es', de: 'Nicht', it: 'Non' } },
  { darija: 'hna', translit: 'hna', meanings: { en: 'Here', fr: 'Ici', es: 'Aquí', de: 'Hier', it: 'Qui' } },
  { darija: 'ana', translit: 'ana', meanings: { en: 'I / me', fr: 'Je / moi', es: 'Yo / mí', de: 'Ich / mich', it: 'Io / me' } },
  { darija: 'nta', translit: 'nta', meanings: { en: 'You (m)', fr: 'Toi (m)', es: 'Tú (m)', de: 'Du (m)', it: 'Tu (m)' } },
  { darija: 'nti', translit: 'nti', meanings: { en: 'You (f)', fr: 'Toi (f)', es: 'Tú (f)', de: 'Du (f)', it: 'Tu (f)' } },
  { darija: 'huwa', translit: 'huwa', meanings: { en: 'He', fr: 'Il', es: 'Él', de: 'Er', it: 'Lui' } },
  { darija: 'hiya', translit: 'hiya', meanings: { en: 'She', fr: 'Elle', es: 'Ella', de: 'Sie', it: 'Lei' } },
  { darija: 'smiya', translit: 'smiya', meanings: { en: 'Name', fr: 'Nom', es: 'Nombre', de: 'Name', it: 'Nome' } },
  { darija: 'kulshi', translit: 'kulshi', meanings: { en: 'Everything', fr: 'Tout', es: 'Todo', de: 'Alles', it: 'Tutto' } },
  { darija: 'wld', translit: 'wld', meanings: { en: 'Boy / son', fr: 'Garçon / fils', es: 'Niño / hijo', de: 'Junge / Sohn', it: 'Ragazzo / figlio' } },
  { darija: 'bnt', translit: 'bnt', meanings: { en: 'Girl / daughter', fr: 'Fille / fille', es: 'Niña / hija', de: 'Mädchen / Tochter', it: 'Ragazza / figlia' } },
  { darija: 'lkhobz', translit: 'lkhobz', meanings: { en: 'Bread', fr: 'Pain', es: 'Pan', de: 'Brot', it: 'Pane' } },
  { darija: 'atay', translit: 'atay', meanings: { en: 'Tea', fr: 'Thé', es: 'Té', de: 'Tee', it: 'Tè' } },
  { darija: 'zwin', translit: 'zwin', meanings: { en: 'Beautiful / nice', fr: 'Beau / joli', es: 'Bonito', de: 'Schön', it: 'Bello' } },
  { darija: 'skhoun', translit: 'skhoun', meanings: { en: 'Hot', fr: 'Chaud', es: 'Caliente', de: 'Heiß', it: 'Caldo' } },
  { darija: 'bared', translit: 'bared', meanings: { en: 'Cold', fr: 'Froid', es: 'Frío', de: 'Kalt', it: 'Freddo' } },
  { darija: 'kifash', translit: 'kifash', meanings: { en: 'How', fr: 'Comment', es: 'Cómo', de: 'Wie', it: 'Come' } },
  { darija: 'shno', translit: 'shno', meanings: { en: 'What', fr: 'Quoi / Que', es: 'Qué', de: 'Was', it: 'Cosa' } },
  { darija: 'shhal', translit: 'shhal', meanings: { en: 'How much / how many', fr: 'Combien', es: 'Cuánto', de: 'Wie viel', it: 'Quanto' } },
  { darija: 'mashi mushkil', translit: 'mashi mushkil', meanings: { en: "No problem", fr: 'Pas de problème', es: 'No hay problema', de: 'Kein Problem', it: 'Nessun problema' } },
  { darija: 'safi', translit: 'safi', meanings: { en: "Enough / OK / done", fr: 'Assez / OK / terminé', es: 'Suficiente / OK', de: 'Genug / OK', it: 'Basta / OK' } },
  { darija: '3afak', translit: 'afak', meanings: { en: 'Please', fr: 'S’il vous plaît', es: 'Por favor', de: 'Bitte', it: 'Per favore' } },
  { darija: '3la rasi', translit: '3la rasi', meanings: { en: 'You’re welcome (lit. on my head)', fr: 'De rien', es: 'De nada', de: 'Gern geschehen', it: 'Prego' } },
  { darija: 'mabrouk', translit: 'mabrouk', meanings: { en: 'Congratulations', fr: 'Félicitations', es: 'Felicidades', de: 'Glückwunsch', it: 'Congratulazioni' } },
  { darija: 'hmdllah', translit: 'hamdullah', meanings: { en: 'Thanks be to God / I’m fine', fr: 'Grâce à Dieu / Je vais bien', es: 'Gracias a Dios', de: 'Gott sei Dank', it: 'Grazie a Dio' } },
  { darija: 'msemmi', translit: 'msemmi', meanings: { en: 'I am called / my name is', fr: "Je m'appelle", es: 'Me llamo', de: 'Ich heiße', it: 'Mi chiamo' } },
  { darija: 'qahwa', translit: 'qahwa', meanings: { en: 'Coffee', fr: 'Café', es: 'Café', de: 'Kaffee', it: 'Caffè' } },
  { darija: 'sbaH lkhir', translit: 'sabah el kheir', meanings: { en: 'Good morning', fr: 'Bonjour', es: 'Buenos días', de: 'Guten Morgen', it: 'Buongiorno' } },
  { darija: 'mssa lkhir', translit: 'msa el kheir', meanings: { en: 'Good evening', fr: 'Bonsoir', es: 'Buenas noches', de: 'Guten Abend', it: 'Buona sera' } },
  { darija: '3tini', translit: 'atini', meanings: { en: 'Give me', fr: 'Donne-moi', es: 'Dame', de: 'Gib mir', it: 'Dammi' } },
  { darija: 'kbir', translit: 'kbir', meanings: { en: 'Big', fr: 'Grand', es: 'Grande', de: 'Groß', it: 'Grande' } },
  { darija: 'sghir', translit: 'sghir', meanings: { en: 'Small', fr: 'Petit', es: 'Pequeño', de: 'Klein', it: 'Piccolo' } },
  { darija: 'salam 3likom', translit: 'salam 3likom', meanings: { en: 'Peace be upon you (greeting)', fr: 'Paix sur vous (salutation)', es: 'La paz sea contigo', de: 'Friede sei mit dir', it: 'La pace sia con te' } },
  { darija: 'walakin', translit: 'walakin', meanings: { en: 'But / however', fr: 'Mais / cependant', es: 'Pero', de: 'Aber', it: 'Ma / tuttavia' } },
  { darija: 'sahbi', translit: 'sahbi', meanings: { en: 'My friend (m)', fr: 'Mon ami', es: 'Mi amigo', de: 'Mein Freund', it: 'Il mio amico' } },
  { darija: 'sahbti', translit: 'sahbti', meanings: { en: 'My friend (f)', fr: 'Mon amie', es: 'Mi amiga', de: 'Meine Freundin', it: 'La mia amica' } },
  { darija: '3ndek', translit: 'andek', meanings: { en: 'You have', fr: 'Tu as', es: 'Tienes', de: 'Du hast', it: 'Hai' } },
  { darija: '3ndi', translit: 'andi', meanings: { en: 'I have', fr: 'J’ai', es: 'Tengo', de: 'Ich habe', it: 'Ho' } },
  { darija: 'bzzef', translit: 'bzzef', meanings: { en: 'A lot', fr: 'Beaucoup', es: 'Mucho', de: 'Viel', it: 'Molto' } },
  { darija: 'tlfoun', translit: 'telephone', meanings: { en: 'Phone', fr: 'Téléphone', es: 'Teléfono', de: 'Telefon', it: 'Telefono' } },
  { darija: 'dar', translit: 'dar', meanings: { en: 'House', fr: 'Maison', es: 'Casa', de: 'Haus', it: 'Casa' } },
  { darija: 'mskin', translit: 'mskin', meanings: { en: 'Poor person / unlucky', fr: 'Pauvre / malchanceux', es: 'Pobre / desafortunado', de: 'Armer / unglücklich', it: 'Povero / sfortunato' } },
  { darija: 'mzyan bzaf', translit: 'mzyan bzaf', meanings: { en: 'Very good', fr: 'Très bien', es: 'Muy bien', de: 'Sehr gut', it: 'Molto bene' } },
  { darija: '3la slamtk', translit: '3la slamtek', meanings: { en: 'Get well soon / Bless you', fr: 'Prompt rétablissement / À tes souhaits', es: 'Recupérate pronto', de: 'Gute Besserung', it: 'Guarisci presto' } },
  { darija: 'bssa7a', translit: 'bssa7a', meanings: { en: 'Cheers / to your health', fr: 'À ta santé', es: 'Salud', de: 'Prost', it: 'Salute' } },
  { darija: 'tbarakallah', translit: 'tbarakallah', meanings: { en: 'Blessings / well done', fr: 'Bénédictions / bravo', es: 'Bendiciones', de: 'Gesegnet', it: 'Benedizioni' } },
  { darija: 'ma-fhamtsh', translit: 'ma fhemtsh', meanings: { en: "I don't understand", fr: "Je ne comprends pas", es: 'No entiendo', de: 'Ich verstehe nicht', it: 'Non capisco' } },
  { darija: '3awd', translit: 'awd', meanings: { en: 'Repeat / again', fr: 'Répète / encore', es: 'Repite / otra vez', de: 'Wiederholen', it: 'Ripeti' } },
  { darija: 'shwiya', translit: 'shwiya', meanings: { en: 'A little / slowly', fr: 'Un peu / doucement', es: 'Un poco', de: 'Ein bisschen / langsam', it: 'Un po’' } },
  { darija: 'rani jay', translit: 'rani jay', meanings: { en: 'I am coming', fr: 'J’arrive', es: 'Voy', de: 'Ich komme', it: 'Sto arrivando' } },
  { darija: 'safi rah', translit: 'safi rah', meanings: { en: 'That’s it / done', fr: 'C’est tout / fini', es: 'Ya está / hecho', de: 'Das ist alles', it: 'Questo è tutto' } },
  { darija: 'khdam', translit: 'khdam', meanings: { en: 'Work / working', fr: 'Travail / en train de travailler', es: 'Trabajo / trabajando', de: 'Arbeit / arbeitet', it: 'Lavoro / lavorando' } },
  { darija: 'mrid', translit: 'mrid', meanings: { en: 'Sick', fr: 'Malade', es: 'Enfermo', de: 'Krank', it: 'Malato' } },
  { darija: 'msafrin', translit: 'msafrin', meanings: { en: 'Traveling', fr: 'Voyage', es: 'Viajando', de: 'Reisen', it: 'Viaggio' } },
  { darija: 'hadi', translit: 'hadi', meanings: { en: 'This (f)', fr: 'Celle-ci', es: 'Esta', de: 'Diese', it: 'Questa' } },
  { darija: 'hadak', translit: 'hadak', meanings: { en: 'That (m)', fr: 'Celui-là', es: 'Aquel', de: 'Jener', it: 'Quello' } },
  { darija: 'sahha', translit: 'sahha', meanings: { en: 'Health (as a toast)', fr: 'Santé', es: 'Salud', de: 'Gesundheit', it: 'Salute' } },
  { darija: '3ndek chi', translit: 'andek chi', meanings: { en: 'Do you have something?', fr: 'As-tu quelque chose?', es: '¿Tienes algo?', de: 'Hast du etwas?', it: 'Hai qualcosa?' } },
  { darija: 'shuf', translit: 'shuf', meanings: { en: 'Look / see', fr: 'Regarde', es: 'Mira', de: 'Schau', it: 'Guarda' } },
  { darija: 'mskina', translit: 'mskina', meanings: { en: 'Poor woman / pity', fr: 'Pauvre femme', es: 'Pobre mujer', de: 'Arme Frau', it: 'Povera donna' } },
  { darija: 'hmd', translit: 'hmd', meanings: { en: 'Thanks/ praise (short)', fr: 'Merci (court)', es: 'Gracias (corto)', de: 'Danke (kurz)', it: 'Grazie (breve)' } },
  { darija: 'salamti', translit: 'salamti', meanings: { en: 'Your greeting', fr: 'Ta salutation', es: 'Tu saludo', de: 'Dein Gruß', it: 'Il tuo saluto' } },
  { darija: 'bshwiya', translit: 'bshwiya', meanings: { en: 'Slowly / gently', fr: 'Doucement', es: 'Despacio', de: 'Langsam', it: 'Lentamente' } },
  { darija: 'rani m3ak', translit: 'rani m3ak', meanings: { en: 'I am with you', fr: 'Je suis avec toi', es: 'Estoy contigo', de: 'Ich bin bei dir', it: 'Sono con te' } },
  { darija: 'nti zwin(a)', translit: 'nti zwin', meanings: { en: 'You are beautiful', fr: 'Tu es belle', es: 'Eres hermosa', de: 'Du bist schön', it: 'Sei bella' } },
  { darija: 'tkllm', translit: 'tkllm', meanings: { en: 'Speak', fr: 'Parler', es: 'Hablar', de: 'Sprechen', it: 'Parlare' } },
  { darija: 'sowal', translit: 'sowal', meanings: { en: 'Question', fr: 'Question', es: 'Pregunta', de: 'Frage', it: 'Domanda' } },
]

function pickRandom<T>(arr: T[], n: number) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

async function callOpenAI(count = 6) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured')

  const prompt = `Return a JSON object with a single key "suggestions" which is an array of ${count} short Moroccan Darija words or short phrases suitable for beginner learners. Each suggestion must be an object with keys: "darija" (Latin romanization), "translit" (optional transliteration), and "meaning" (short English gloss). Return ONLY the JSON object, without extra commentary.`

  const payload = {
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'You are a JSON-only generator. Reply only with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400,
    temperature: 0.8,
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
    return parsed.suggestions || []
  } catch (err) {
    // try to extract JSON substring
    const m = content.match(/\{[\s\S]*\}/)
    if (m) {
      const parsed = JSON.parse(m[0])
      return parsed.suggestions || []
    }
    throw new Error('Failed to parse OpenAI response')
  }
}

async function translateMeanings(meanings: string[], target: string) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured')

  const prompt = `You are given a JSON array of short English glosses. Translate each item into ${target} (only the translation, concise). Return a JSON object: { "translations": ["...","...", ...] } where the order matches the input array. Respond with JSON only.`

  const payload = {
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'You are a JSON-only translator. Reply only with valid JSON.' },
      { role: 'user', content: JSON.stringify({ meanings }) + "\n\n" + prompt }
    ],
    max_tokens: 800,
    temperature: 0.3,
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
    return parsed.translations || []
  } catch (err) {
    const m = content.match(/\{[\s\S]*\}/)
    if (m) {
      const parsed = JSON.parse(m[0])
      return parsed.translations || []
    }
    throw new Error('Failed to parse OpenAI translation response')
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const cookie = cookieStore.get('iDarija_session')
  if (!cookie) redirect('/login?redirect=/dashboard')
  const token = cookie.value

  const user = await getUserFromSession(token)
  if (!user) redirect('/login?redirect=/dashboard')
  // pick base suggestions from the static pool (server chooses which 6 to show)
  const serverSuggestions = pickRandom(SUGGESTED_POOL, 6)

  // detect preferred language: prefer explicit site cookie, fall back to request headers
  const cookieStoreLang = cookieStore.get('iDarija_lang')
  let preferred = ''
  if (cookieStoreLang && typeof cookieStoreLang.value === 'string') {
    preferred = cookieStoreLang.value.split(',')[0].split('-')[0].toLowerCase()
  } else {
    const hdrs = headers()
    const accept = hdrs.get('accept-language') || ''
    const first = accept.split(',')[0] || 'en'
    preferred = first.split('-')[0].toLowerCase()
  }
  const supported = SUPPORTED_LANGS as readonly string[]
  const targetLang = supported.includes(preferred) ? preferred : 'en'

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user.name || user.email}!</h1>
            <p className="text-gray-600">Ready to explore Darija today?</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard/chat" className="px-4 py-2 bg-primary text-white rounded">Ask Lhajja</a>
            <a href="/translator" className="px-4 py-2 border rounded">Translator</a>
            <a href="/dashboard/chat" className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat with LhajjaAI
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1 bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/dictionary/saved" className="text-primary">My Saved Words</a></li>
              <li><a href="/booking" className="text-primary">Book a Native Speaker Session</a></li>
              <li><a href="/dashboard/chat" className="text-primary">Chat with LhajjaAI</a></li>
            </ul>
          </aside>

          <main className="md:col-span-3 space-y-6">
            

            <section className="p-4 border rounded bg-white">
              <h2 className="text-lg font-semibold mb-3">Recommended Words & Phrases</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serverSuggestions.map((w, i) => (
                  <div key={i} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{w.darija}</div>
                      <div className="text-sm text-gray-600">{(w.meanings as any)[targetLang] || w.meanings.en}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 border rounded text-sm">🔊</button>
                      <button className="px-2 py-1 bg-primary text-white rounded text-sm">Save</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

           

            <section className="p-4 border rounded bg-white">
              <h2 className="text-lg font-semibold mb-3">Book a Native Speaker</h2>
              <div className="flex items-center gap-4">
                <a href="/booking" className="px-4 py-2 bg-primary text-white rounded">Book a Zoom session</a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}