'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { api, type Session, type Profile } from '@/lib/api';

const FLAG: Record<string, string> = { US: '🇺🇸', JP: '🇯🇵' };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
    in_progress: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function SessionCard({ session }: { session: Session }) {
  const date = new Date(session.scheduled_at);
  const isUpcoming = session.status === 'scheduled';
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-brand-600 uppercase">{date.toLocaleDateString('en', { month: 'short' })}</span>
        <span className="text-lg font-black text-brand-700 leading-none">{date.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm text-slate-900 truncate">
            with {session.partner_name}
          </span>
          <span className="text-sm">{FLAG[session.partner_country] ?? '🌐'}</span>
          <StatusBadge status={session.status} />
        </div>
        <p className="text-xs text-slate-500">
          {date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
          {' · '}{session.duration_minutes}min
          {session.topic_name && ` · ${session.topic_name}`}
          {' · '}Session #{session.session_number}
        </p>
      </div>
      {isUpcoming && (
        <Link
          href={`/session/ses_001`}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
        >
          Join
        </Link>
      )}
    </div>
  );
}

function SavedMatchCard({ profile }: { profile: Profile }) {
  const interests: string[] = JSON.parse(profile.interests || '[]');
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {(profile.display_name ?? '?')[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-900 truncate">{profile.display_name}</p>
          <p className="text-xs text-slate-500">
            {FLAG[profile.country_code] ?? '🌐'} {profile.native_language === 'ja' ? 'JP→EN' : 'EN→JP'}
          </p>
        </div>
        <span className="text-xs font-bold px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded-md">
          {profile.proficiency_level}
        </span>
      </div>
      {profile.short_intro && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{profile.short_intro}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {interests.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full capitalize">{tag}</span>
        ))}
      </div>
      <button className="mt-3 w-full py-1.5 rounded-xl text-xs font-semibold border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors">
        Send Invite
      </button>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<{
    upcoming: Session[];
    saved: Profile[];
    completed_sessions: number;
    profile: { proficiency_level: string; native_language: string; learning_language: string; reliability_score: number } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = typeof window !== 'undefined'
    ? localStorage.getItem('bt_user_id') ?? 'usr_alex_001'
    : 'usr_alex_001';

  useEffect(() => {
    api.getDashboard(currentUserId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [currentUserId]);

  const RECOMMENDED_TOPICS = [
    { name: 'Describing your hometown', level: 'A2', emoji: '🏙️' },
    { name: 'Job interview in Japanese', level: 'B1', emoji: '💼' },
    { name: 'Food and cooking culture', level: 'A2', emoji: '🍱' },
    { name: 'Weekend plans and hobbies', level: 'A2', emoji: '🎨' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm">
              {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            href="/matching"
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Browse Partners →
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Sessions Completed',
              value: loading ? '—' : String(data?.completed_sessions ?? 0),
              icon: '🎯',
              color: 'bg-brand-50 border-brand-100',
            },
            {
              label: 'Saved Partners',
              value: loading ? '—' : String(data?.saved?.length ?? 0),
              icon: '★',
              color: 'bg-amber-50 border-amber-100',
            },
            {
              label: 'Reliability Score',
              value: loading ? '—' : `${data?.profile?.reliability_score?.toFixed(1) ?? '5.0'} / 5`,
              icon: '🛡️',
              color: 'bg-green-50 border-green-100',
            },
            {
              label: 'Current Level',
              value: loading ? '—' : (data?.profile?.proficiency_level ?? '—'),
              icon: '📈',
              color: 'bg-purple-50 border-purple-100',
            },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
              <span className="text-2xl block mb-1">{stat.icon}</span>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Streak banner */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-5 mb-8 flex items-center gap-4 text-white">
          <span className="text-4xl">🔥</span>
          <div>
            <p className="font-black text-xl">3-week streak!</p>
            <p className="text-brand-200 text-sm">You&apos;ve practiced 3 weeks in a row. Keep it going!</p>
          </div>
          <Link href="/matching" className="ml-auto flex-shrink-0 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-colors">
            Book Session
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Upcoming sessions ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Upcoming Sessions</h2>
              <Link href="/matching" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
                + Schedule
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : data?.upcoming && data.upcoming.length > 0 ? (
              <div className="space-y-3">
                {data.upcoming.map((s) => <SessionCard key={s.id} session={s} />)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-3xl mb-3">📅</p>
                <p className="font-semibold text-slate-700">No upcoming sessions</p>
                <p className="text-sm text-slate-500 mt-1">Find a partner and book your first session.</p>
                <Link href="/matching" className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
                  Browse Partners
                </Link>
              </div>
            )}

            {/* Demo session (always shown for MVP) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 border-l-4 border-l-brand-500">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-brand-600 uppercase">Apr</span>
                <span className="text-lg font-black text-brand-700 leading-none">20</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-slate-900">with Yuki T. 🇯🇵</span>
                  <StatusBadge status="scheduled" />
                </div>
                <p className="text-xs text-slate-500">9:00 AM · 30min · Daily Life · Session #3</p>
              </div>
              <Link href="/session/ses_001" className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors">
                Join
              </Link>
            </div>

            {/* Recommended topics */}
            <div className="mt-6">
              <h2 className="font-bold text-slate-900 mb-3">Recommended Next Topics</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {RECOMMENDED_TOPICS.map((topic) => (
                  <div key={topic.name} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                    <span className="text-xl">{topic.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{topic.name}</p>
                      <span className="text-xs text-brand-600 font-medium bg-brand-50 px-1.5 py-0.5 rounded-full">
                        {topic.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            {/* Progress summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 mb-4">Progress Summary</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Sessions this month</span>
                    <span className="font-bold text-slate-900">4 / 8</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Feedback given</span>
                    <span className="font-bold text-slate-900">3 / 4</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Session #2 rate</span>
                    <span className="font-bold text-slate-900">100%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                {/* TODO: wire to real stats once session volume grows */}
                Based on your last 30 days
              </p>
            </div>

            {/* Saved matches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-900">Saved Matches</h2>
                <Link href="/matching" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
                  Browse more
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
                </div>
              ) : data?.saved && data.saved.length > 0 ? (
                <div className="space-y-3">
                  {data.saved.slice(0, 3).map((p) => (
                    <SavedMatchCard key={p.id} profile={p} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-slate-500">
                  <p className="text-2xl mb-2">☆</p>
                  Save partners from the matching page
                </div>
              )}
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-br from-slate-900 to-brand-900 rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">BridgeTalk Plus</p>
              <p className="font-black text-lg mb-2">Unlock more partners & tracks</p>
              <p className="text-xs text-slate-400 mb-4">Career conversations, session history, priority matching</p>
              <Link href="/pricing" className="block text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
                See Plans →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
