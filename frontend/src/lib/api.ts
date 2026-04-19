const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  display_name: string;
  country_code: string;
  profile_id: string;
  native_language: string;
  learning_language: string;
  proficiency_level: string;
  short_intro: string | null;
  interests: string; // JSON
  availability: string; // JSON
  preferred_exchange_format: string;
  reliability_score: number;
  reply_rate: number;
  total_sessions: number;
}

export interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_number: number;
  topic_name: string | null;
  topic_name_jp: string | null;
  partner_id: string;
  partner_name: string;
  partner_country: string;
}

export interface TopicPack {
  id: string;
  name: string;
  name_jp: string | null;
  category: string;
  difficulty: string;
  prompts: string; // JSON
  is_free: number;
}

// ─── API methods ─────────────────────────────────────────────────────────────
export const api = {
  getProfiles: (params?: {
    learning?: string;
    native?: string;
    level?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.learning) qs.set('learning', params.learning);
    if (params?.native)   qs.set('native', params.native);
    if (params?.level)    qs.set('level', params.level);
    if (params?.limit)    qs.set('limit', String(params.limit));
    if (params?.offset)   qs.set('offset', String(params.offset));
    return apiFetch<{ profiles: Profile[] }>(`/profiles?${qs}`);
  },

  getProfile: (id: string) =>
    apiFetch<{ profile: Profile }>(`/profiles/${id}`),

  upsertProfile: (data: Record<string, unknown>) =>
    apiFetch<{ user_id: string; profile_id: string }>('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSavedMatches: (userId: string) =>
    apiFetch<{ saved: Profile[] }>(`/matches/saved?user_id=${userId}`),

  saveMatch: (userId: string, targetUserId: string) =>
    apiFetch<{ success: boolean }>('/matches/save', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, target_user_id: targetUserId }),
    }),

  unsaveMatch: (saveId: string) =>
    apiFetch<{ success: boolean }>(`/matches/save/${saveId}`, { method: 'DELETE' }),

  joinWaitlist: (data: { email: string; name?: string; native_language?: string; learning_language?: string }) =>
    apiFetch<{ success: boolean; message: string }>('/waitlist', {
      method: 'POST',
      body: JSON.stringify({ ...data, source: 'website' }),
    }),

  getTopicPacks: () =>
    apiFetch<{ topic_packs: TopicPack[] }>('/topic-packs'),

  createTrialInvite: (data: {
    from_user_id: string;
    to_user_id: string;
    proposed_time: string;
    topic_id?: string;
    message?: string;
  }) =>
    apiFetch<{ id: string; success: boolean }>('/trial-invites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSessions: (userId: string) =>
    apiFetch<{ sessions: Session[] }>(`/sessions?user_id=${userId}`),

  createSession: (data: {
    user_id_a: string;
    user_id_b: string;
    scheduled_at: string;
    duration_minutes?: number;
    topic_id?: string;
  }) =>
    apiFetch<{ id: string; session_number: number }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeSession: (sessionId: string) =>
    apiFetch<{ success: boolean }>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    }),

  saveSessionNotes: (data: {
    session_id: string;
    user_id: string;
    quick_notes?: string;
    correction_for_partner?: string;
    next_topic?: string;
  }) =>
    apiFetch<{ success: boolean }>('/session-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitFeedback: (data: {
    session_id: string;
    from_user_id: string;
    to_user_id: string;
    was_helpful: number;
    want_again: number;
    was_punctual: number;
    was_polite: number;
    was_engaged: number;
    improvement_notes?: string;
    second_session_interest?: number;
  }) =>
    apiFetch<{ success: boolean }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDashboard: (userId: string) =>
    apiFetch<{
      upcoming: Session[];
      saved: Profile[];
      recent_feedback: unknown[];
      profile: unknown;
      completed_sessions: number;
    }>(`/dashboard/${userId}`),

  trackEvent: (eventType: string, userId?: string, metadata?: Record<string, unknown>) =>
    apiFetch<{ success: boolean }>('/analytics', {
      method: 'POST',
      body: JSON.stringify({ event_type: eventType, user_id: userId, metadata }),
    }).catch(() => ({ success: false })),
};
