"use client";
import { useState } from "react";
import { MotionDiv } from "./motion-div";
import { useT } from "./use-t";
import ProtectedLink from "./protected-link";
import { useRouter } from "next/navigation";
import LoginForm from "./login-form";

const steps = [
  ['01', 'Find your phrase', 'Start with practical Darija for the places and conversations that matter to you.'],
  ['02', 'Practice with Lhajja', 'Get natural examples, gentle corrections, and cultural context whenever you need it.'],
  ['03', 'Build your rhythm', 'Return to your saved words and grow a confident everyday vocabulary.'],
  ['04', 'Speak with ease', 'Take your Darija into real conversations, travel, and life in Morocco.'],
]

export default function HomeClient() {
  const t = useT();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);


    return (
      <main className="bg-[#f8f6f0] text-[#17211d]">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:pb-28 md:pt-24">
          <MotionDiv>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Moroccan Darija, made human</p>
            <h1 className="max-w-xl text-5xl font-normal leading-[1.03] md:text-7xl">{t('home.hero_title')}<br /><em className="text-primary">with confidence.</em></h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#17211d]/65">{t('home.hero_sub')}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="/pricing" className="bg-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-dark">{t('home.cta_start')} <span aria-hidden="true">↗</span></a>
              <ProtectedLink href="/dashboard/chat" className="border border-[#17211d]/25 px-6 py-3.5 text-sm font-bold transition hover:border-primary hover:text-primary">{t('home.cta_dictionary')}</ProtectedLink>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-[#17211d]/60"><span className="text-lg tracking-widest text-primary">★★★★★</span><span><strong className="text-[#17211d]">4.9/5</strong> from Darija learners</span></div>
          </MotionDiv>
          <MotionDiv className="relative">
            <div className="absolute -right-3 top-6 hidden h-24 w-24 rounded-full border border-primary/30 md:block" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[#f1d9c9] px-4 pt-8 md:px-10 md:pt-12"><img src="/hero.png" alt="Students learning Moroccan Darija together" className="relative z-10 w-full object-contain" width={660} height={450} /></div>
            <div className="absolute -bottom-5 left-5 z-20 border border-[#17211d]/10 bg-[#f8f6f0] px-5 py-4 shadow-sm"><p className="font-serif text-2xl">1000+</p><p className="text-xs uppercase tracking-wider text-[#17211d]/55">curious learners</p></div>
          </MotionDiv>
        </section>

        <section className="border-y border-[#17211d]/10 bg-[#17211d] px-5 py-8 text-[#f8f6f0] md:px-10"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center md:grid-cols-4"><div><p className="font-serif text-3xl">Translator</p><p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/60">instant Darija help</p></div><div><p className="font-serif text-3xl">Lhajja AI</p><p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/60">practice conversations</p></div><div><p className="font-serif text-3xl">Dictionary</p><p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/60">words in context</p></div><div><p className="font-serif text-3xl">Shop</p><p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/60">guides for real life</p></div></div></section>

        <section className="mx-auto max-w-7xl px-5 py-24 md:px-10"><div className="mb-14 max-w-2xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">A simple way forward</p><h2 className="text-4xl font-normal md:text-5xl">Your path to everyday Darija</h2></div><div className="grid gap-0 border-t border-[#17211d]/15 md:grid-cols-4">{steps.map(([number, title, description]) => <article key={number} className="border-b border-[#17211d]/15 py-8 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><p className="mb-8 text-sm font-bold text-primary">{number}</p><h3 className="text-2xl font-normal">{title}</h3><p className="mt-4 text-sm leading-6 text-[#17211d]/60">{description}</p></article>)}</div></section>

        <section className="bg-[#e9eee7] px-5 py-24 md:px-10"><div className="mx-auto max-w-7xl"><div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Made for real life</p><h2 className="text-4xl font-normal md:text-5xl">Everything you need<br />to keep speaking.</h2></div><p className="max-w-sm text-sm leading-6 text-[#17211d]/60">Learn the words people actually use, with tools that help you remember them and context that helps you use them well.</p></div><div className="grid gap-5 md:grid-cols-3"><article className="bg-[#f8f6f0] p-7"><img src="/translator.png" alt="" className="mb-8 h-14 w-14 object-contain" /><h3 className="text-2xl font-normal">Translate naturally</h3><p className="mt-3 text-sm leading-6 text-[#17211d]/60">Go beyond word-for-word translations with everyday Moroccan meaning and tone.</p><a href="/translator" className="mt-8 inline-block text-sm font-bold text-primary">Try the translator ↗</a></article><article className="bg-[#f8f6f0] p-7"><img src="/lhajja.png" alt="" className="mb-8 h-14 w-14 object-contain" /><h3 className="text-2xl font-normal">Chat with Lhajja</h3><p className="mt-3 text-sm leading-6 text-[#17211d]/60">Practice without pressure. Lhajja helps you find the right expression for every moment.</p><ProtectedLink href="/dashboard/chat" className="mt-8 inline-block text-sm font-bold text-primary">Meet Lhajja ↗</ProtectedLink></article><article className="bg-[#f8f6f0] p-7"><img src="/native.png" alt="" className="mb-8 h-14 w-14 object-contain" /><h3 className="text-2xl font-normal">Learn the culture</h3><p className="mt-3 text-sm leading-6 text-[#17211d]/60">Explore expressions, stories, and small details that make Darija feel alive.</p><a href="/blog" className="mt-8 inline-block text-sm font-bold text-primary">Read the journal ↗</a></article></div></div></section>

        <section className="mx-auto max-w-7xl px-5 py-24 text-center md:px-10"><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Start where you are</p><h2 className="mx-auto max-w-3xl font-serif text-4xl font-normal leading-tight md:text-6xl">Darija is a rhythm, a feeling, a piece of Morocco you carry with you.</h2><button onClick={() => setLoginOpen(true)} className="mt-10 bg-[#17211d] px-7 py-4 text-sm font-bold text-white transition hover:bg-primary">Begin your journey ↗</button></section>

        {loginOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17211d]/70 p-5"><div className="relative w-full max-w-md bg-[#f8f6f0] p-7"><button onClick={() => setLoginOpen(false)} className="absolute right-4 top-3 text-2xl" aria-label="Close login">×</button><LoginForm onSuccess={() => { setLoginOpen(false); router.push('/dashboard/chat') }} /></div></div>}
      </main>
    )

}