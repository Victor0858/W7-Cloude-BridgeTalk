'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const PROMPTS = [
  'Describe your morning routine step by step.',
  'What did you have for lunch today? Describe it in detail.',
  'Talk about your neighborhood — what do you like about it?',
  'How do you usually spend your weekends?',
  'What is your favorite local restaurant and why?',
];

const PARTNER = {
  id: 'usr_yuki_006',
  name: 'Yuki T.',
  country: '🇯🇵',
  teaches: 'Japanese',
  learns: 'English',
  level: 'B1',
};

const ME = {
  id: 'usr_alex_001',
  name: 'Alex C.',
  country: '🇺🇸',
  teaches: 'English',
  learns: 'Japanese',
  level: 'B1',
};

// ─── Timer ────────────────────────────────────────────────────────────────────
function SessionTimer({ running, onExpire }: { running: boolean; onExpire: () => void }) {
  const [seconds, setSeconds] = useState(30 * 60);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { onExpire(); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, onExpire]);

  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  const pct = (seconds / (30 * 60)) * 100;
  const isLow = seconds < 5 * 60;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-3xl font-black tabular-nums ${isLow ? 'text-red-500' : 'text-slate-900'}`}>
        {m}:{s}
      </span>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-brand-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Language split indicator ─────────────────────────────────────────────────
function LangSplit({ jpPct }: { jpPct: number }) {
  const enPct = 100 - jpPct;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-brand-600">🇺🇸 EN {enPct}%</span>
        <span className="text-rose-500">🇯🇵 JP {jpPct}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 flex">
        <div className="bg-brand-500 transition-all" style={{ width: `${enPct}%` }} />
        <div className="bg-rose-500 transition-all" style={{ width: `${jpPct}%` }} />
      </div>
      <p className="text-xs text-slate-400 text-center">Target: 50/50</p>
    </div>
  );
}

// ─── Post-session Feedback ────────────────────────────────────────────────────
function FeedbackPanel({
  sessionId,
  onDone,
}: {
  sessionId: string;
  onDone: () => void;
}) {
  const [helpful, setHelpful] = useState(4);
  const [wantAgain, setWantAgain] = useState(true);
  const [punctual, setPunctual] = useState(true);
  const [polite, setPolite] = useState(true);
  const [engaged, setEngaged] = useState(true);
  const [notes, setNotes] = useState('');
  const [secondIntent, setSecondIntent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  async function handleSubmit() {
    setStatus('loading');
    try {
      await api.submitFeedback({
        session_id: sessionId,
        from_user_id: ME.id,
        to_user_id: PARTNER.id,
        was_helpful: helpful,
        want_again: wantAgain ? 1 : 0,
        was_punctual: punctual ? 1 : 0,
        was_polite: polite ? 1 : 0,
        was_engaged: engaged ? 1 : 0,
        improvement_notes: notes,
        second_session_interest: secondIntent ? 1 : 0,
      });
      await api.trackEvent('feedback_completed', ME.id, { session_id: sessionId });
      if (secondIntent) await api.trackEvent('second_session_interest_clicked', ME.id, { session_id: sessionId });
      setStatus('done');
      setTimeout(onDone, 2000);
    } catch {
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <div className="text-center py-12 animate-fade-up">
        <span className="text-5xl">🎯</span>
        <p className="font-bold text-slate-900 text-xl mt-4">Feedback saved!</p>
        <p className="text-slate-500 mt-1">Your partner&apos;s reliability score has been updated.</p>
        <Link href="/dashboard" className="mt-6 inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="font-semibold text-slate-900 mb-3">
          How helpful was today&apos;s session? (1–5)
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setHelpful(n)}
              className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all ${
                helpful >= n ? 'bg-amber-400 border-amber-400 text-white' : 'border-gray-200 text-slate-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-slate-900">About your partner</p>
        {[
          { label: 'Was on time', value: punctual, set: setPunctual },
          { label: 'Was polite and respectful', value: polite, set: setPolite },
          { label: 'Was engaged and prepared', value: engaged, set: setEngaged },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
            <span className="text-sm text-slate-700">{label}</span>
            <button
              onClick={() => set((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-brand-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
            </button>
          </label>
        ))}
      </div>

      <label className="flex items-center justify-between p-4 rounded-xl border-2 border-brand-100 bg-brand-50 cursor-pointer">
        <div>
          <p className="font-semibold text-slate-900 text-sm">Would you meet again?</p>
          <p className="text-xs text-slate-500 mt-0.5">This helps build your reliability record</p>
        </div>
        <button
          onClick={() => setWantAgain((v) => !v)}
          className={`w-12 h-6 rounded-full transition-colors relative ${wantAgain ? 'bg-brand-600' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${wantAgain ? 'left-6' : 'left-0.5'}`} />
        </button>
      </label>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          What would you improve next time? (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="More structure, different topic, practice pronunciation..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-100 bg-green-50 cursor-pointer">
        <input
          type="checkbox"
          checked={secondIntent}
          onChange={(e) => setSecondIntent(e.target.checked)}
          className="w-4 h-4 rounded accent-green-600"
        />
        <div>
          <p className="font-semibold text-slate-900 text-sm">I&apos;m interested in a second session</p>
          <p className="text-xs text-slate-500 mt-0.5">We&apos;ll send scheduling suggestions</p>
        </div>
      </label>

      <button
        onClick={handleSubmit}
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? 'Saving...' : 'Submit Feedback'}
      </button>
    </div>
  );
}

// ─── Main session room ────────────────────────────────────────────────────────
export default function SessionPage({ params }: { params: { id: string } }) {
  const sessionId = params.id;
  const [phase, setPhase] = useState<'waiting' | 'active' | 'feedback'>('waiting');
  const [promptIdx, setPromptIdx] = useState(0);
  const [quickNotes, setQuickNotes] = useState('');
  const [correction, setCorrection] = useState('');
  const [nextTopic, setNextTopic] = useState('');
  const [jpPct, setJpPct] = useState(48);

  async function handleComplete() {
    try {
      await api.completeSession(sessionId);
      await api.saveSessionNotes({
        session_id: sessionId,
        user_id: ME.id,
        quick_notes: quickNotes,
        correction_for_partner: correction,
        next_topic: nextTopic,
      });
    } catch {
      // continue to feedback even if API fails
    }
    setPhase('feedback');
  }

  // Simulate language split drifting
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setInterval(() => {
      setJpPct((p) => Math.max(30, Math.min(70, p + (Math.random() - 0.5) * 4)));
    }, 5000);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="font-black text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand-600 inline-flex items-center justify-center text-xs font-black">B</span>
          BridgeTalk
        </Link>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            phase === 'active' ? 'bg-green-900 text-green-400' :
            phase === 'feedback' ? 'bg-brand-900 text-brand-400' :
            'bg-slate-800 text-slate-400'
          }`}>
            {phase === 'waiting' ? 'Waiting to start' : phase === 'active' ? '● Live' : 'Complete'}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {phase === 'waiting' && (
          <div className="text-center py-20 animate-fade-up">
            <div className="text-6xl mb-6">🌉</div>
            <h1 className="text-3xl font-black mb-3">Session Ready</h1>
            <p className="text-slate-400 mb-8">
              Your 30-minute exchange with <strong className="text-white">{PARTNER.name}</strong> is about to begin.
              <br />Today&apos;s topic: <strong className="text-brand-400">Daily Life Conversations</strong>
            </p>
            <div className="flex justify-center gap-4 mb-10">
              {[ME, PARTNER].map((u) => (
                <div key={u.id} className="bg-slate-800 rounded-2xl p-4 text-center w-36">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                    {u.name[0]}
                  </div>
                  <p className="font-semibold text-sm">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.country} {u.teaches}</p>
                  <span className="text-xs bg-brand-900 text-brand-400 px-2 py-0.5 rounded-full mt-1 inline-block">{u.level}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPhase('active')}
              className="px-10 py-4 rounded-2xl bg-brand-600 text-white font-bold text-base hover:bg-brand-700 transition-all shadow-lg shadow-brand-900/50"
            >
              Start Session
            </button>
          </div>
        )}

        {phase === 'active' && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* ── Left: partner cards + timer ── */}
            <div className="space-y-4">
              {/* Partner mini card */}
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Your Partner</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {PARTNER.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{PARTNER.name}</p>
                    <p className="text-xs text-slate-400">{PARTNER.country} · {PARTNER.teaches} → {PARTNER.learns}</p>
                  </div>
                  <span className="ml-auto text-xs bg-brand-900 text-brand-400 px-2 py-0.5 rounded-full">{PARTNER.level}</span>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Session Time</p>
                <SessionTimer running={phase === 'active'} onExpire={() => setPhase('feedback')} />
              </div>

              {/* Language split */}
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Language Balance</p>
                <LangSplit jpPct={Math.round(jpPct)} />
              </div>

              {/* Me mini card */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">You</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {ME.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{ME.name}</p>
                    <p className="text-xs text-slate-400">{ME.country} · {ME.teaches} → {ME.learns}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Center: Topic card + prompts ── */}
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Today&apos;s Topic</p>
                    <p className="font-black text-lg mt-1">Daily Life Conversations</p>
                    <p className="text-xs text-brand-400">日常生活の会話 · Beginner</p>
                  </div>
                  <span className="text-3xl">🃏</span>
                </div>

                <div className="bg-brand-600/20 border border-brand-600/30 rounded-xl p-4 mb-4">
                  <p className="text-xs text-brand-400 font-semibold mb-2">
                    Prompt {promptIdx + 1} of {PROMPTS.length}
                  </p>
                  <p className="text-white font-semibold leading-relaxed">
                    {PROMPTS[promptIdx]}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPromptIdx((i) => Math.max(0, i - 1))}
                    disabled={promptIdx === 0}
                    className="flex-1 py-2 rounded-lg text-sm border border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPromptIdx((i) => Math.min(PROMPTS.length - 1, i + 1))}
                    disabled={promptIdx === PROMPTS.length - 1}
                    className="flex-1 py-2 rounded-lg text-sm bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-30 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">
                  Quick Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Can you say that again slowly?',
                    'How do you say ___ in Japanese?',
                    'Let me try to say it in Japanese...',
                    'I didn\'t quite catch that',
                    'That\'s a great expression!',
                  ].map((s) => (
                    <button key={s} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors text-left">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Notes panel ── */}
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Quick Notes</p>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  rows={4}
                  placeholder="New vocab, expressions to remember..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  1 Correction for Your Partner
                </p>
                <p className="text-xs text-slate-500 mb-3">Share at end of session — keep it constructive</p>
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  rows={2}
                  placeholder="e.g. 'Instead of X, try saying Y because...'"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Next Time, Let&apos;s Talk About…
                </p>
                <input
                  type="text"
                  value={nextTopic}
                  onChange={(e) => setNextTopic(e.target.value)}
                  placeholder="Travel plans, job interview practice..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors"
              >
                Complete Session ✓
              </button>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black mb-2">Session Complete! 🎌</h2>
              <p className="text-slate-400">
                Great work today. Take a moment to give feedback to <strong className="text-white">{PARTNER.name}</strong>.
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <FeedbackPanel sessionId={sessionId} onDone={() => window.location.href = '/dashboard'} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
