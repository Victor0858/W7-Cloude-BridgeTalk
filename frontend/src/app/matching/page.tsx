'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { api, type Profile } from '@/lib/api';

const FLAG: Record<string, string> = { US: '🇺🇸', JP: '🇯🇵' };
const LEVEL_COLOR: Record<string, string> = {
  A1: 'bg-sky-50 text-sky-700',
  A2: 'bg-green-50 text-green-700',
  B1: 'bg-brand-50 text-brand-700',
  B2: 'bg-purple-50 text-purple-700',
  C1: 'bg-orange-50 text-orange-700',
};

interface Filters {
  learning: string;
  native: string;
  level: string;
}

function ProfileCard({
  profile,
  onSave,
  onInvite,
  saved,
}: {
  profile: Profile;
  onSave: (id: string) => void;
  onInvite: (profile: Profile) => void;
  saved: boolean;
}) {
  const interests: string[] = JSON.parse(profile.interests || '[]');
  const availability: { day: string; time: string }[] = JSON.parse(profile.availability || '[]');
  const levelStyle = LEVEL_COLOR[profile.proficiency_level] ?? 'bg-gray-100 text-gray-700';

  const availSummary = availability.length
    ? availability.slice(0, 3).map((a) => `${a.day} ${a.time}`).join(', ') +
      (availability.length > 3 ? ` +${availability.length - 3}` : '')
    : 'Flexible';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {profile.display_name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 truncate">{profile.display_name}</span>
            <span className="text-base">{FLAG[profile.country_code] ?? '🌐'}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${levelStyle}`}>
              {profile.proficiency_level}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaches <strong>{profile.native_language === 'ja' ? 'Japanese' : 'English'}</strong>
            {' · '}Learns <strong>{profile.learning_language === 'ja' ? 'Japanese' : 'English'}</strong>
          </p>
        </div>
      </div>

      {/* Bio */}
      {profile.short_intro && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{profile.short_intro}</p>
      )}

      {/* Interests */}
      <div className="flex flex-wrap gap-1.5">
        {interests.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full capitalize">
            {tag}
          </span>
        ))}
        {interests.length > 4 && (
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
            +{interests.length - 4}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-gray-50 pt-3">
        <span>
          ★ <strong className="text-slate-700">{profile.reliability_score?.toFixed(1)}</strong>
        </span>
        <span>
          📅 <strong className="text-slate-700">{availSummary}</strong>
        </span>
        <span>
          💬 <strong className="text-slate-700">{profile.total_sessions}</strong> sessions
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onSave(profile.id)}
          title={saved ? 'Saved' : 'Save for later'}
          className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${
            saved
              ? 'bg-brand-50 border-brand-200 text-brand-600'
              : 'border-gray-200 text-slate-500 hover:bg-gray-50'
          }`}
        >
          {saved ? '★' : '☆'}
        </button>
        <button
          onClick={() => onInvite(profile)}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors"
        >
          Send Trial Invite
        </button>
        <Link
          href={`/matching/${profile.id}`}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors text-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

// ─── Trial Invite Modal ───────────────────────────────────────────────────────
function TrialInviteModal({
  profile,
  onClose,
  onSent,
}: {
  profile: Profile;
  onClose: () => void;
  onSent: () => void;
}) {
  const [proposedTime, setProposedTime] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const currentUserId = typeof window !== 'undefined'
    ? localStorage.getItem('bt_user_id') ?? 'usr_alex_001'
    : 'usr_alex_001';

  async function handleSend() {
    if (!proposedTime) return;
    setStatus('loading');
    try {
      await api.createTrialInvite({
        from_user_id: currentUserId,
        to_user_id: profile.id,
        proposed_time: proposedTime,
        message,
      });
      await api.trackEvent('trial_invite_sent', currentUserId, { to_user_id: profile.id });
      setStatus('done');
      setTimeout(onSent, 1500);
    } catch {
      setStatus('idle');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-lg">Send Trial Invite</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        {status === 'done' ? (
          <div className="text-center py-8">
            <span className="text-4xl">🎉</span>
            <p className="font-semibold text-slate-900 mt-3">Invite sent!</p>
            <p className="text-sm text-slate-500 mt-1">We&apos;ll notify {profile.display_name}.</p>
          </div>
        ) : (
          <>
            {/* 15-min trial format info */}
            <div className="bg-brand-50 rounded-xl p-4 mb-5 text-sm">
              <p className="font-semibold text-brand-800 mb-1">15-Minute Trial Format</p>
              <ul className="text-brand-700 space-y-1 text-xs">
                <li>· 5 min — Introductions</li>
                <li>· 5 min — Topic card discussion</li>
                <li>· 5 min — Feedback & next steps</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Propose a time *
                </label>
                <input
                  type="datetime-local"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Short message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder={`Hey ${profile.display_name}! I'd love to do a trial session...`}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!proposedTime || status === 'loading'}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {status === 'loading' ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MatchingPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [inviteTarget, setInviteTarget] = useState<Profile | null>(null);
  const [filters, setFilters] = useState<Filters>({ learning: '', native: '', level: '' });
  const [inviteSentId, setInviteSentId] = useState('');

  const currentUserId = typeof window !== 'undefined'
    ? localStorage.getItem('bt_user_id') ?? 'usr_alex_001'
    : 'usr_alex_001';

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProfiles({
        learning: filters.learning || undefined,
        native: filters.native || undefined,
        level: filters.level || undefined,
      });
      setProfiles(res.profiles);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  async function handleSave(userId: string) {
    try {
      if (savedIds.has(userId)) return;
      await api.saveMatch(currentUserId, userId);
      setSavedIds((prev) => new Set([...prev, userId]));
      await api.trackEvent('match_saved', currentUserId, { target_user_id: userId });
    } catch {
      // silent
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Find Your Partner</h1>
          <p className="text-slate-600">
            Browse compatible language exchange partners. Save profiles and send trial invites.
          </p>
        </div>

        <div className="flex gap-8">
          {/* ── Filters sidebar ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5 sticky top-24">
              <p className="font-bold text-slate-900 text-sm">Filters</p>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  They teach
                </label>
                <div className="space-y-1.5">
                  {[{ code: '', label: 'Any' }, { code: 'ja', label: '🇯🇵 Japanese' }, { code: 'en', label: '🇺🇸 English' }].map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => setFilters((f) => ({ ...f, native: opt.code }))}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        filters.native === opt.code
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  They learn
                </label>
                <div className="space-y-1.5">
                  {[{ code: '', label: 'Any' }, { code: 'ja', label: '🇯🇵 Japanese' }, { code: 'en', label: '🇺🇸 English' }].map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => setFilters((f) => ({ ...f, learning: opt.code }))}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        filters.learning === opt.code
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Level
                </label>
                <div className="space-y-1.5">
                  {['', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setFilters((f) => ({ ...f, level: lvl }))}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        filters.level === lvl
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:bg-gray-50'
                      }`}
                    >
                      {lvl || 'Any level'}
                    </button>
                  ))}
                </div>
              </div>

              {(filters.native || filters.learning || filters.level) && (
                <button
                  onClick={() => setFilters({ learning: '', native: '', level: '' })}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Profile grid ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile filters */}
            <div className="lg:hidden flex gap-2 mb-5 overflow-x-auto pb-1">
              {[
                { label: 'Teaches JP', active: filters.native === 'ja', action: () => setFilters(f => ({ ...f, native: f.native === 'ja' ? '' : 'ja' })) },
                { label: 'Teaches EN', active: filters.native === 'en', action: () => setFilters(f => ({ ...f, native: f.native === 'en' ? '' : 'en' })) },
                { label: 'B1', active: filters.level === 'B1', action: () => setFilters(f => ({ ...f, level: f.level === 'B1' ? '' : 'B1' })) },
                { label: 'A2', active: filters.level === 'A2', action: () => setFilters(f => ({ ...f, level: f.level === 'A2' ? '' : 'A2' })) },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={chip.action}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    chip.active ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-200 text-slate-600 bg-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-semibold">No profiles found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-4">{profiles.length} partner{profiles.length !== 1 ? 's' : ''} found</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      saved={savedIds.has(profile.id)}
                      onSave={handleSave}
                      onInvite={setInviteTarget}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Trial invite modal */}
      {inviteTarget && (
        <TrialInviteModal
          profile={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSent={() => {
            setInviteSentId(inviteTarget.id);
            setInviteTarget(null);
          }}
        />
      )}

      {/* Toast */}
      {inviteSentId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl animate-fade-up z-50">
          Trial invite sent!
          <button onClick={() => setInviteSentId('')} className="ml-3 text-slate-400 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}
