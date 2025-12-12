"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MotionDiv } from "./motion-div"
import { useT } from "./use-t"
import TranslateWidget from "./translate-widget"
import ProtectedLink from "./protected-link"


type Lang = "en" | "fr" | "es" | "it" | "de" | "dar"

const PRIMARY = "#ff7aac"
const PRIMARY_50 = "rgba(255,122,172,0.08)" // subtle bg for accents

const LANG_LABEL: Record<Lang, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  de: "German",
  dar: "Darija",
}

export const dynamic = "force-dynamic"

// fallback translator function (keeps behavior unchanged)
function mockTranslate(text: string, from: Lang, to: Lang) {
  const key = text.trim().toLowerCase()
  const examples: Record<string, Partial<Record<Lang, string>>> = {
    "where are you?": {
      en: "Where are you?",
      fr: "Où es-tu ?",
      es: "¿Dónde estás?",
      it: "Dove sei?",
      dar: "Fin kayn?",
    },
    "how much is this?": {
      en: "How much is this?",
      fr: "Combien ça coûte ?",
      es: "¿Cuánto cuesta esto?",
      it: "Quanto costa?",
      dar: "Bsh7al hadshi?",
    },
    hello: {
      en: "Hello",
      fr: "Bonjour",
      es: "Hola",
      it: "Ciao",
      dar: "Salam",
    },
  }

  for (const ex in examples) {
    if (key === ex) {
      return (examples[ex][to] as string) || ""
    }
  }

  if (to === "dar") return `${text} — (Darija translation placeholder)`
  if (from === "dar") return `${text} — (English translation placeholder)`
  return `${text} — (translated to ${LANG_LABEL[to]})`
}

export default function TranslatorPage() {
  const t = useT()
  const [fromLang, setFromLang] = useState<Lang>("en")
  const [toLang, setToLang] = useState<Lang>("dar")
  const [otherPref, setOtherPref] = useState<Lang>("en")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [favorites, setFavorites] = useState<
    Array<{ id: string; from: Lang; to: Lang; input: string; output: string }>
  >([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("iDarija_favorites")
      if (raw) setFavorites(JSON.parse(raw))
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("iDarija_favorites", JSON.stringify(favorites))
    } catch (e) {}
  }, [favorites])

  const translate = () => {
    if (!input.trim()) return setOutput("")
    setOutput(mockTranslate(input, fromLang, toLang))
  }

  const swap = () => {
    const newFrom = toLang
    const newTo = fromLang
    if (newFrom !== "dar" && newTo !== "dar") {
      setFromLang(newFrom)
      setToLang("dar")
      setOtherPref(newFrom)
    } else if (newFrom === "dar" && newTo === "dar") {
      setFromLang("en")
      setToLang("dar")
      setOtherPref("en")
    } else {
      setFromLang(newFrom)
      setToLang(newTo)
      if (newFrom !== "dar") setOtherPref(newFrom)
      if (newTo !== "dar") setOtherPref(newTo)
    }
    setOutput("")
  }

  const playAudio = (text: string, lang: Lang) => {
    if (!text) return
    try {
      const utter = new SpeechSynthesisUtterance(text)
      const langMap: Record<Lang, string> = {
        en: "en-US",
        fr: "fr-FR",
        es: "es-ES",
        it: "it-IT",
        de: "de-DE",
        dar: "ar-MA",
      }
      utter.lang = langMap[lang] || "en-US"
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    } catch (e) {
      console.warn("Speech synthesis not available", e)
    }
  }

  const saveFavorite = () => {
    if (!input.trim() || !output.trim()) return
    const id = Date.now().toString()
    const item = { id, from: fromLang, to: toLang, input, output }
    setFavorites((s) => [item, ...s])
  }

  const removeFavorite = (id: string) =>
    setFavorites((s) => s.filter((f) => f.id !== id))

  const relatedWords = useMemo(() => {
    const words = input.trim().split(/\s+/).filter(Boolean)
    if (!words.length) return []
    const w = words[0].toLowerCase()
    return [w, `${w}s`, `${w}ing`].slice(0, 5)
  }, [input])

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <MotionDiv>
          <header className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold"> {t("translator.title")}</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">{t("translator.description")}</p>
          </header>
        </MotionDiv>

        {/* Grid: left = translator (takes 2/3 on desktop), right = sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: TRANSLATOR CARD */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Language row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-600 block mb-1">{t("translator.from")}</label>
                <select
                  value={fromLang}
                  onChange={(e) => {
                    const v = e.target.value as Lang
                    if (v !== "dar") {
                      setFromLang(v)
                      setToLang("dar")
                      setOtherPref(v)
                    } else {
                      setFromLang("dar")
                      setToLang(otherPref)
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)", outlineColor: PRIMARY }}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="it">Italian</option>
                  <option value="de">German</option>
                  <option value="dar">Darija</option>
                </select>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={swap}
                  aria-label="Swap languages"
                  title="Swap languages"
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h13M3 7l4-4M3 7l4 4M21 17H8M21 17l-4-4M21 17l-4 4" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-600 block mb-1">{t("translator.to")}</label>
                <select
                  value={toLang}
                  onChange={(e) => {
                    const v = e.target.value as Lang
                    if (v !== "dar") {
                      setToLang(v)
                      setFromLang("dar")
                      setOtherPref(v)
                    } else {
                      setToLang("dar")
                      setFromLang(otherPref)
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)", outlineColor: PRIMARY }}
                >
                  {fromLang !== "dar" ? (
                    <option value="dar">Darija</option>
                  ) : (
                    <>
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="it">Italian</option>
                      <option value="de">German</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* INPUT + TRANSLATE WIDGET */}
            <div className="mt-5">
              <label className="text-xs text-gray-600 block mb-2">{t("translator.enter_text")}</label>

              {/* TranslateWidget (keeps its UI) */}
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
                <TranslateWidget
                  initialFrom={fromLang}
                  initialTo={toLang}
                  autosuggest
                  onSave={(text, res) => {
                    setInput(text)
                    setOutput(res.translation || "")
                  }}
                />
              </div>

              {/* quick samples */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => { setInput("Where are you?"); setOutput(""); }}
                  className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                >
                  {t("translator.sample_where")}
                </button>
                <button
                  onClick={() => { setInput("How much is this?"); setOutput(""); }}
                  className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                >
                  {t("translator.sample_howmuch")}
                </button>
                <button
                  onClick={() => { setInput("Hello"); setOutput(""); }}
                  className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                >
                  {t("translator.sample_hello")}
                </button>
                <button
                  onClick={translate}
                  className="ml-auto px-4 py-2 rounded-xl text-white"
                  style={{ background: PRIMARY, boxShadow: "0 6px 18px rgba(255,122,172,0.18)" }}
                >
                  Translate
                </button>
              </div>
            </div>

            {/* TRANSLATION RESULT */}
            {/* Note: on mobile this sits directly below input (because of flow); on desktop it's still inside left column above */}
            <div className="mt-6">
              <label className="text-xs text-gray-600 block mb-2">Translation</label>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm min-h-[84px]">
                {output ? (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-black leading-snug">{output}</div>
                      <div className="mt-2 text-sm text-gray-600">Example: {mockTranslate("Where are you?", fromLang, toLang)}</div>
                    </div>

                    <div className="flex gap-2 items-start">
                      

                      <button
                        onClick={saveFavorite}
                        className="px-3 py-1 rounded-lg text-sm"
                        style={{ border: `1px solid ${PRIMARY}`, color: PRIMARY, background: "white" }}
                      >
                        {t("translator.save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">{t("translator.no_translation")}</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SIDEBAR (Related + Favorites + About) */}
          <aside className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold" style={{ color: PRIMARY }}>Related</h3>
              <div className="mt-3 space-y-2">
                {relatedWords.length ? relatedWords.map((r) => (
                  <div key={r} className="flex justify-between items-center">
                    <div className="text-sm text-black">{r}</div>
                    <button onClick={() => { setInput(r); setOutput("") }} className="text-sm" style={{ color: PRIMARY }}>Use</button>
                  </div>
                )) : <div className="text-sm text-gray-400">Type to see suggestions</div>}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold" style={{ color: PRIMARY }}>Favorites</h3>
              <div className="mt-3 space-y-3">
                {favorites.length ? favorites.map((f) => (
                  <div key={f.id} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="max-w-[60%]">
                      <div className="text-sm font-medium truncate">{f.input}</div>
                      <div className="text-sm text-gray-600 truncate">{f.output}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setInput(f.input); setOutput(f.output) }} className="px-2 py-1 text-xs border rounded-lg">Load</button>
                      <button onClick={() => removeFavorite(f.id)} className="px-2 py-1 text-xs text-red-600 border rounded-lg">Remove</button>
                    </div>
                  </div>
                )) : <div className="text-sm text-gray-400">No favorites yet</div>}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold" style={{ color: PRIMARY }}>About Darija</h3>
              <p className="mt-2 text-sm text-gray-600">Darija is a spoken Moroccan dialect. Spelling varies across regions. This service shows common romanized spellings used by locals.</p>
            </div>
          </aside>
        </div>

        {/* bottom CTAs */}
        <div className="mt-8 text-center">
          <a href="/pricing" className="inline-block px-4 py-2 rounded-lg border">Practice with a coach</a>
          <ProtectedLink href="/dashboard/chat" className="inline-block px-4 py-2 rounded-lg border ml-2 cursor-pointer">Try Lhajja AI</ProtectedLink>
        </div>
      </section>
    </main>
  )
}
