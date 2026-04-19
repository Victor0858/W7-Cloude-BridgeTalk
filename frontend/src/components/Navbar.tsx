'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-black">
            B
          </span>
          BridgeTalk
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#how" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            {t.nav.how_it_works}
          </Link>
          <Link href="/matching" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            {t.nav.matching}
          </Link>
          <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            {t.nav.pricing}
          </Link>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50 transition-colors"
          >
            {lang === 'en' ? '日本語' : 'English'}
          </button>
          <Link
            href="/onboarding"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            {t.nav.get_started}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/#how" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-700 py-2">
            {t.nav.how_it_works}
          </Link>
          <Link href="/matching" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-700 py-2">
            {t.nav.matching}
          </Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-700 py-2">
            {t.nav.pricing}
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => { setLang(lang === 'en' ? 'ja' : 'en'); setMenuOpen(false); }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-200 text-slate-600"
            >
              {lang === 'en' ? '日本語' : 'English'}
            </button>
            <Link
              href="/onboarding"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 text-white"
            >
              {t.nav.get_started}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
