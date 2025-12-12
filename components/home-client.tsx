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
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="w-full pt-24 pb-32 px-6 md:px-16 text-center md:text-left">
        <MotionDiv className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {t('home.hero_title')} <br />
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600">{t('home.hero_sub')}</p>
            <div className="mt-8 flex justify-center md:justify-start gap-4">
              <a href="/pricing" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition">{t('home.cta_start')}</a>
              <ProtectedLink href="/dashboard/chat" className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition">Chat with Lhajja AI</ProtectedLink>
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
      <section className="py-20 bg-gray-50 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('home.features_title')}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <MotionDiv className="p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition flex flex-col items-center">
              <img src="/translator.png" alt={t('home.features_translator_icon_alt')} className="w-23 h-23 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">{t('home.features_translator_title')}</h3>
              <p className="text-gray-600">{t('home.features_translator_desc')}</p>
            </MotionDiv>

            <MotionDiv className="p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition flex flex-col items-center">
              <img src="/lhajja.png" alt={t('home.features_lhajja_icon_alt')} className="w-23 h-23 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">{t('home.features_lhajja_title')}</h3>
              <p className="text-gray-600">{t('home.features_lhajja_desc')}</p>
            </MotionDiv>

            <MotionDiv className="p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition flex flex-col items-center justify-center">
              <img src="/native.png" alt={t('home.features_native_icon_alt')} className="w-23 h-23 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-3 text-center">{t('home.features_native_title')}</h3>
              <p className="text-gray-600 text-center">{t('home.features_native_desc')}</p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 px-6 md:px-16 text-center">
        <MotionDiv className="max-w-2xl mx-auto">
          <blockquote className="text-2xl md:text-3xl font-light text-gray-700">{t('home.quote')}</blockquote>
        </MotionDiv>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t bg-gray-50 text-center text-gray-600">
      </footer>
    </main>
  );
}