"use client";
import { useState } from "react";
import { MotionDiv } from "./motion-div";
import { useT } from "./use-t";
import ProtectedLink from "./protected-link";
import { useRouter } from "next/navigation";
import LoginForm from "./login-form";

export default function HomeClient() {
  const t = useT();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    router.push("/dashboard/chat");
  };

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#171717]">
      {/* Hero Section */}
      <section className="w-full overflow-hidden bg-black px-6 pb-24 pt-20 text-center text-white md:px-16 md:pb-32 md:pt-28 md:text-left">
        <MotionDiv className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="flex-1">
            <h1 className="text-5xl font-normal leading-[0.95] md:text-8xl">
              {t('home.hero_title')} <br />
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 md:text-xl">{t('home.hero_sub')}</p>
            <div className="mt-8 flex justify-center md:justify-start gap-4">
              <a href="/pricing" className="bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark">{t('home.cta_start')} <span aria-hidden="true">↗</span></a>
              <ProtectedLink href="/dashboard/chat" className="border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">Chat with Lhajja AI</ProtectedLink>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="/hero.png"
              alt="Darija Hero"
              className="w-full max-w-2xl h-auto object-contain bg-transparent"
              style={{ background: "transparent" }}
              loading="eager"
              width={600}
              height={450}
            />
          </div>
        </MotionDiv>
      </section>

      {/* Features Section */}
      <section className="border-b border-black/10 bg-[#f4a261]/15 px-6 py-20 md:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="mb-12 text-center text-4xl font-normal md:text-5xl">{t('home.features_title')}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <MotionDiv className="flex flex-col items-center border border-black/10 bg-white p-8 shadow-[4px_4px_0_#171717] transition hover:-translate-y-1">
              <img src="/translator.png" alt={t('home.features_translator_icon_alt')} className="w-23 h-23 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">{t('home.features_translator_title')}</h3>
              <p className="text-gray-600">{t('home.features_translator_desc')}</p>
            </MotionDiv>

            <MotionDiv className="flex flex-col items-center border border-black/10 bg-white p-8 shadow-[4px_4px_0_#171717] transition hover:-translate-y-1">
              <img src="/lhajja.png" alt={t('home.features_lhajja_icon_alt')} className="w-23 h-23 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">{t('home.features_lhajja_title')}</h3>
              <p className="text-gray-600">{t('home.features_lhajja_desc')}</p>
            </MotionDiv>

            <MotionDiv className="flex flex-col items-center justify-center border border-black/10 bg-white p-8 shadow-[4px_4px_0_#171717] transition hover:-translate-y-1">
              <img src="/native.png" alt={t('home.features_native_icon_alt')} className="w-23 h-23 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-3 text-center">{t('home.features_native_title')}</h3>
              <p className="text-gray-600 text-center">{t('home.features_native_desc')}</p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="px-6 py-24 text-center md:px-16">
        <MotionDiv className="max-w-2xl mx-auto">
          <blockquote className="font-serif text-3xl font-normal leading-tight text-black/75 md:text-5xl">{t('home.quote')}</blockquote>
        </MotionDiv>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t bg-gray-50 text-center text-gray-600">
      </footer>
    </main>
  );
}