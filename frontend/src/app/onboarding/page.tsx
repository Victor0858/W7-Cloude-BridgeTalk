'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  // Step 1
  learning_language: string;
  // Step 2
  proficiency_level: string;
  // Step 3
  native_language: string;
  // Step 4
  interests: string[];
  // Step 5
  availability: { day: string; time: string }[];
  // Step 6
  preferred_exchange_format: string;
  // Step 7
  partner_preference: { style: string; frequency: string };
  // Step 8
  avoid_scenarios: string[];
  // User info
  display_name: string;
  email: string;
  short_intro: string;
}

const LEVELS = [
  { code: 'A1', label: 'A1 — Beginner', jp: '完全初心者', en: 'I know a few words.' },
  { code: 'A2', label: 'A2 — Elementary', jp: '基礎レベル', en: 'I can handle simple conversations.' },
  { code: 'B1', label: 'B1 — Intermediate', jp: '中級レベル', en: 'I can express myself on familiar topics.' },
  { code: 'B2', label: 'B2 — Upper Intermediate', jp: '中上級', en: 'I can discuss most topics with some effort.' },
  { code: 'C1', label: 'C1 — Advanced', jp: '上級', en: 'I speak fluently with occasional errors.' },
];

const INTERESTS = [
  { id: 'anime', label: 'Anime & Manga', emoji: '🎌' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'food', label: 'Food & Cooking', emoji: '🍱' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'movies', label: 'Movies & Drama', emoji: '🎬' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'books', label: 'Books & Literature', emoji: '📚' },
  { id: 'art', label: 'Art & Design', emoji: '🎨' },
  { id: 'business', label: 'Business & Career', emoji: '💼' },
  { id: 'health', label: 'Health & Wellness', emoji: '🧘' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];

const AVOID_ITEMS = [
  { id: 'dating_vibes', label: 'Romantic or flirtatious messages' },
  { id: 'politics', label: 'Heavy political discussions' },
  { id: 'religion', label: 'Religious debates' },
  { id: 'off_topic', label: 'Purely off-topic chats (no language focus)' },
  { id: 'no_prep', label: 'Partners who never prepare' },
  { id: 'irregular', label: 'Partners who cancel frequently' },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

// ─── Step wrapper ─────────────────────────────────────────────────────────────
function StepCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{title}</h2>
      {subtitle && <p className="text-slate-500 mb-8">{subtitle}</p>}
      {children}
    </div>
  );
}

// ─── Choice pill ─────────────────────────────────────────────────────────────
function ChoicePill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
        selected
          ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
          : 'bg-white border-gray-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const TOTAL_STEPS = 9; // 8 data steps + 1 summary
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [savedUserId, setSavedUserId] = useState('');

  const [form, setForm] = useState<FormData>({
    learning_language: '',
    proficiency_level: '',
    native_language: '',
    interests: [],
    availability: [],
    preferred_exchange_format: '',
    partner_preference: { style: '', frequency: '' },
    avoid_scenarios: [],
    display_name: '',
    email: '',
    short_intro: '',
  });

  function update(patch: Partial<FormData>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function toggleInterest(id: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(id)
        ? f.interests.filter((x) => x !== id)
        : [...f.interests, id],
    }));
  }

  function toggleAvailability(day: string, time: string) {
    setForm((f) => {
      const exists = f.availability.some((a) => a.day === day && a.time === time);
      return {
        ...f,
        availability: exists
          ? f.availability.filter((a) => !(a.day === day && a.time === time))
          : [...f.availability, { day, time }],
      };
    });
  }

  function toggleAvoid(id: string) {
    setForm((f) => ({
      ...f,
      avoid_scenarios: f.avoid_scenarios.includes(id)
        ? f.avoid_scenarios.filter((x) => x !== id)
        : [...f.avoid_scenarios, id],
    }));
  }

  async function handleFinish() {
    setStatus('loading');
    try {
      const result = await api.upsertProfile({
        email: form.email,
        display_name: form.display_name,
        native_language: form.native_language,
        learning_language: form.learning_language,
        proficiency_level: form.proficiency_level,
        short_intro: form.short_intro,
        interests: form.interests,
        availability: form.availability,
        preferred_exchange_format: form.preferred_exchange_format,
        partner_preference: form.partner_preference,
        avoid_scenarios: form.avoid_scenarios,
      });
      setSavedUserId(result.user_id);
      localStorage.setItem('bt_user_id', result.user_id);
      setStatus('done');
      setStep(TOTAL_STEPS);
    } catch {
      setStatus('error');
    }
  }

  const canProceed: Record<number, boolean> = {
    1: !!form.learning_language,
    2: !!form.proficiency_level,
    3: !!form.native_language,
    4: form.interests.length >= 2,
    5: form.availability.length >= 1,
    6: !!form.preferred_exchange_format,
    7: !!form.partner_preference.style,
    8: true,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black text-slate-900 text-lg flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-black">B</span>
            BridgeTalk
          </Link>
          {step < TOTAL_STEPS && (
            <span className="text-sm text-slate-500">Step {step} of {TOTAL_STEPS - 1}</span>
          )}
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {step < TOTAL_STEPS && (
            <div className="mb-8">
              <ProgressBar step={step} total={TOTAL_STEPS - 1} />
            </div>
          )}

          {/* ── Step 1: Learning language ── */}
          {step === 1 && (
            <StepCard title="What language do you want to learn?" subtitle="This determines which partners we match you with.">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { code: 'ja', label: '🇯🇵 Japanese', sub: '日本語' },
                  { code: 'en', label: '🇺🇸 English', sub: 'English' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      update({
                        learning_language: lang.code,
                        native_language: lang.code === 'ja' ? 'en' : 'ja',
                      });
                    }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      form.learning_language === lang.code
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-brand-200'
                    }`}
                  >
                    <p className="text-2xl mb-2">{lang.label.split(' ')[0]}</p>
                    <p className="font-bold text-slate-900">{lang.label.slice(3)}</p>
                    <p className="text-sm text-slate-500">{lang.sub}</p>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {/* ── Step 2: Proficiency level ── */}
          {step === 2 && (
            <StepCard title="What's your current level?" subtitle="Be honest — a good match depends on level compatibility.">
              <div className="space-y-3">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => update({ proficiency_level: lvl.code })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      form.proficiency_level === lvl.code
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                        form.proficiency_level === lvl.code ? 'bg-brand-600 text-white' : 'bg-gray-100 text-slate-600'
                      }`}>
                        {lvl.code}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{lvl.label}</p>
                        <p className="text-xs text-slate-500">{form.learning_language === 'ja' ? lvl.jp : lvl.en}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {/* ── Step 3: Native language (auto-filled but confirm) ── */}
          {step === 3 && (
            <StepCard title="What language can you offer?" subtitle="Your partner will learn from you in exchange.">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { code: 'en', label: '🇺🇸 English', sub: 'Native or near-native' },
                  { code: 'ja', label: '🇯🇵 Japanese', sub: 'ネイティブまたはそれに近い' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => update({ native_language: lang.code })}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      form.native_language === lang.code
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-brand-200'
                    }`}
                  >
                    <p className="text-2xl mb-2">{lang.label.split(' ')[0]}</p>
                    <p className="font-bold text-slate-900">{lang.label.slice(3)}</p>
                    <p className="text-sm text-slate-500">{lang.sub}</p>
                  </button>
                ))}
              </div>
              {form.native_language === form.learning_language && (
                <p className="mt-4 text-sm text-red-500">
                  Your offered language must be different from the one you are learning.
                </p>
              )}
            </StepCard>
          )}

          {/* ── Step 4: Interests ── */}
          {step === 4 && (
            <StepCard title="What are your interests?" subtitle="We use these to match you with compatible partners. Pick at least 2.">
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((item) => (
                  <ChoicePill
                    key={item.id}
                    selected={form.interests.includes(item.id)}
                    onClick={() => toggleInterest(item.id)}
                  >
                    {item.emoji} {item.label}
                  </ChoicePill>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {form.interests.length} selected
              </p>
            </StepCard>
          )}

          {/* ── Step 5: Availability ── */}
          {step === 5 && (
            <StepCard title="When are you usually free?" subtitle="Select all time slots that work for you.">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="w-24" />
                      {TIMES.map((t) => (
                        <th key={t} className="pb-2 font-semibold text-slate-600 text-center px-2">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr key={day}>
                        <td className="py-1.5 font-semibold text-slate-700 pr-3">{day}</td>
                        {TIMES.map((time) => {
                          const selected = form.availability.some(
                            (a) => a.day === day && a.time === time
                          );
                          return (
                            <td key={time} className="py-1 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => toggleAvailability(day, time)}
                                className={`w-10 h-8 rounded-lg transition-all text-xs font-semibold ${
                                  selected
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-gray-100 text-slate-400 hover:bg-brand-100'
                                }`}
                              >
                                {selected ? '✓' : ''}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {form.availability.length} slot{form.availability.length !== 1 ? 's' : ''} selected
              </p>
            </StepCard>
          )}

          {/* ── Step 6: Exchange format ── */}
          {step === 6 && (
            <StepCard title="How do you prefer to exchange?" subtitle="You can change this later.">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: 'video', label: 'Video Call', emoji: '📹', desc: 'Best for natural conversation flow' },
                  { id: 'audio', label: 'Audio Only', emoji: '🎙️', desc: 'Less pressure, still spoken' },
                  { id: 'text', label: 'Text Chat', emoji: '💬', desc: 'For written practice' },
                  { id: 'mixed', label: 'Mixed', emoji: '🔀', desc: 'Video + text notes together' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update({ preferred_exchange_format: opt.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.preferred_exchange_format === opt.id
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-brand-200'
                    }`}
                  >
                    <span className="text-xl mb-1 block">{opt.emoji}</span>
                    <p className="font-semibold text-slate-900 text-sm">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {/* ── Step 7: Partner preference ── */}
          {step === 7 && (
            <StepCard title="What kind of partner are you looking for?" subtitle="Helps us find the best match for your style.">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Learning style preference</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { id: 'structured', label: 'Structured', desc: 'Follows topic packs, stays focused' },
                      { id: 'casual', label: 'Casual', desc: 'Free conversation, flexible topics' },
                      { id: 'either', label: 'Either works', desc: 'Flexible, adapt to partner' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          update({
                            partner_preference: { ...form.partner_preference, style: opt.id },
                          })
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.partner_preference.style === opt.id
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 bg-white hover:border-brand-200'
                        }`}
                      >
                        <p className="font-semibold text-slate-900 text-sm">{opt.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Session frequency</p>
                  <div className="flex flex-wrap gap-2">
                    {['Weekly', 'Bi-weekly', 'Flexible'].map((freq) => (
                      <ChoicePill
                        key={freq}
                        selected={form.partner_preference.frequency === freq}
                        onClick={() =>
                          update({
                            partner_preference: { ...form.partner_preference, frequency: freq },
                          })
                        }
                      >
                        {freq}
                      </ChoicePill>
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Step 8: Avoid scenarios + user info ── */}
          {step === 8 && (
            <StepCard title="Almost there — a few more details" subtitle="This helps us keep BridgeTalk safe and relevant for everyone.">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    What would you prefer to avoid? (optional)
                  </p>
                  <div className="space-y-2">
                    {AVOID_ITEMS.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={form.avoid_scenarios.includes(item.id)}
                          onChange={() => toggleAvoid(item.id)}
                          className="w-4 h-4 rounded accent-brand-600"
                        />
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <p className="text-sm font-semibold text-slate-700">Create your profile</p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Display name *</label>
                    <input
                      type="text"
                      value={form.display_name}
                      onChange={(e) => update({ display_name: e.target.value })}
                      placeholder="How you appear to partners"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Short intro (shown to potential partners)
                    </label>
                    <textarea
                      value={form.short_intro}
                      onChange={(e) => update({ short_intro: e.target.value })}
                      rows={3}
                      placeholder="Tell potential partners a bit about yourself and why you want to practice..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Summary / Done ── */}
          {step === TOTAL_STEPS && status === 'done' && (
            <div className="text-center animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-6">
                🎉
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3">Your profile is ready!</h2>
              <p className="text-slate-600 mb-8">
                Welcome to BridgeTalk, {form.display_name}. Here&apos;s your profile summary.
              </p>

              {/* Profile summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left max-w-sm mx-auto mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                    {form.display_name[0] ?? '?'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{form.display_name}</p>
                    <p className="text-xs text-slate-500">{form.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Learning</span>
                    <span className="font-semibold">{form.learning_language === 'ja' ? '🇯🇵 Japanese' : '🇺🇸 English'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Offers</span>
                    <span className="font-semibold">{form.native_language === 'en' ? '🇺🇸 English' : '🇯🇵 Japanese'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Level</span>
                    <span className="font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs">{form.proficiency_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format</span>
                    <span className="font-semibold capitalize">{form.preferred_exchange_format}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Interests</span>
                    <div className="flex flex-wrap gap-1">
                      {form.interests.slice(0, 5).map((id) => {
                        const item = INTERESTS.find((i) => i.id === id);
                        return (
                          <span key={id} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            {item?.emoji} {item?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/matching"
                  className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
                >
                  Browse Partners →
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl border border-gray-200 text-slate-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < TOTAL_STEPS && (
            <div className="mt-8 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                disabled={step === 1}
              >
                ← Back
              </button>

              {step < 8 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed[step]}
                  className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={
                    !form.display_name || !form.email || status === 'loading'
                  }
                  className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'loading' ? 'Saving...' : 'Complete Profile ✓'}
                </button>
              )}
            </div>
          )}

          {status === 'error' && (
            <p className="mt-4 text-sm text-red-500 text-center">
              Something went wrong. Please check your details and try again.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
