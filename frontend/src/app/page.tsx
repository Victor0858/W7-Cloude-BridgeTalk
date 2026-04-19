'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLang } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';

// ─── Waitlist form ────────────────────────────────────────────────────────────
function WaitlistForm({ inline = false }: { inline?: boolean }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await api.joinWaitlist({ email });
      await api.trackEvent('waitlist_submitted', undefined, { email });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <p className="text-green-600 font-semibold text-sm sm:text-base">
        {t.waitlist.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={inline ? 'flex gap-2 flex-col sm:flex-row' : 'space-y-3'}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.waitlist.placeholder}
        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors whitespace-nowrap"
      >
        {status === 'loading' ? '...' : t.waitlist.cta}
      </button>
      {status === 'error' && (
        <p className="text-red-500 text-xs col-span-full">Something went wrong. Try again.</p>
      )}
    </form>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 py-5">
      <button
        className="w-full flex justify-between items-start gap-4 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm sm:text-base font-semibold text-slate-900">{q}</span>
        <span className="text-brand-600 text-xl leading-none mt-0.5 flex-shrink-0">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <p className="mt-3 text-sm text-slate-600 leading-relaxed">{a}</p>}
    </div>
  );
}

// ─── Country flag helper ──────────────────────────────────────────────────────
const FLAG: Record<string, string> = { US: '🇺🇸', JP: '🇯🇵' };

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t, lang } = useLang();

  const painIcons = ['💔', '👻', '📶', '💬', '🚫', '📭'];
  const solutionIcons = ['🎯', '🔔', '🃏', '🛡️', '📝', '🔁'];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-sky-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            {t.hero.badge}
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 whitespace-pre-line animate-fade-up text-balance">
            {t.hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up animation-delay-100">
            {t.hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10 animate-fade-up animation-delay-200">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 text-white font-bold text-base hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              {t.hero.cta_primary}
            </Link>
            <a
              href="#how"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-gray-200 text-slate-700 font-semibold text-base hover:bg-gray-50 transition-colors"
            >
              {t.hero.cta_secondary} →
            </a>
          </div>

          {/* Social proof */}
          <p className="text-sm text-slate-500 animate-fade-up animation-delay-300">
            <span className="inline-flex gap-0.5 mr-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400">★</span>
              ))}
            </span>
            {t.hero.social_proof}
          </p>

          {/* Mock profile cards preview */}
          <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto animate-fade-up animation-delay-400">
            {[
              { name: 'Alex C.', country: 'US', teaches: 'English', learns: 'Japanese', level: 'B1', sessions: 12 },
              { name: 'Yuki T.', country: 'JP', teaches: 'Japanese', learns: 'English', level: 'B1', sessions: 9 },
            ].map((u) => (
              <div key={u.name} className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {u.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{FLAG[u.country]} {u.country}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                    {u.level}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>Teaches <strong>{u.teaches}</strong> · Learns <strong>{u.learns}</strong></p>
                  <p>{u.sessions} sessions completed · ★ 4.9</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 block">
              {t.pain.section_label}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              {t.pain.headline}
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              {t.pain.subheadline}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.pain.items.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mb-3 block">{painIcons[i]}</span>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 block">
              {t.solution.section_label}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              {t.solution.headline}
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              {t.solution.subheadline}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.solution.items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-gradient-to-br from-brand-50 to-white border border-brand-100 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mb-3 block">{solutionIcons[i]}</span>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3 block">
              {t.how.section_label}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              {t.how.headline}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.how.steps.map((step, i) => (
              <div key={i} className="relative">
                {i < t.how.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-slate-700 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-4">
                    <span className="text-white font-black text-sm">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/onboarding"
              className="inline-flex px-8 py-4 rounded-2xl bg-brand-600 text-white font-bold text-base hover:bg-brand-700 transition-all shadow-lg shadow-brand-900/50"
            >
              {lang === 'en' ? 'Start Your Profile' : 'プロフィールを作成する'} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOPIC TRACKS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 block">
              {t.tracks.section_label}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              {t.tracks.headline}
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">{t.tracks.subheadline}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.tracks.items.map((track, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm hover:shadow-md transition-shadow relative"
              >
                {track.free && (
                  <span className="absolute top-3 right-3 text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    {lang === 'en' ? 'Free' : '無料'}
                  </span>
                )}
                <p className="font-black text-slate-900 text-base">{track.name}</p>
                <p className="text-xs text-slate-500 mb-2">{track.name_jp}</p>
                <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full mb-3">
                  {track.level}
                </span>
                <p className="text-sm text-slate-600 leading-relaxed">{track.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 block">
              {t.testimonials.section_label}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.testimonials.headline}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {t.testimonials.items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-6 flex-1">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                    <p className="text-xs text-brand-600 font-medium">
                      {item.sessions} {lang === 'en' ? 'sessions' : 'セッション'} · {item.level}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 block">
              {t.for_who.section_label}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 whitespace-pre-line text-balance">
              {t.for_who.headline}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-green-100 bg-green-50 p-6">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                <span>✓</span>
                {lang === 'en' ? 'This is for you if…' : 'こんな方に向いています'}
              </h3>
              <ul className="space-y-3">
                {t.for_who.for_items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-green-800">
                    <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                <span>✗</span>
                {lang === 'en' ? 'Not the right fit if…' : 'こんな方には向いていません'}
              </h3>
              <ul className="space-y-3">
                {t.for_who.not_for_items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-red-800">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 block">
              {t.faq.section_label}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.faq.headline}
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 divide-y divide-gray-100">
            {t.faq.items.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            {t.waitlist.headline}
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            {t.waitlist.subheadline}
          </p>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <WaitlistForm inline />
            <p className="text-xs text-slate-500 mt-3">{t.waitlist.note}</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-brand-600 inline-flex items-center justify-center text-white text-xs font-black">B</span>
                BridgeTalk
              </p>
              <p className="text-sm">{t.footer.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {t.footer.links.map((link, i) => (
                <a key={i} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-600">
            {t.footer.copy}
          </div>
        </div>
      </footer>
    </div>
  );
}
