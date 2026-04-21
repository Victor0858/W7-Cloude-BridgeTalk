export interface Env {
  DB: D1Database;
}

// ─── CORS ────────────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ok(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function err(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function nanoid(): string {
  // Simple UUID-like ID generator safe in Workers runtime
  return crypto.randomUUID();
}

// Simple path-param router helper
function match(
  pathname: string,
  template: string
): Record<string, string> | null {
  const pathParts = pathname.split('/').filter(Boolean);
  const tmplParts = template.split('/').filter(Boolean);
  if (pathParts.length !== tmplParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < tmplParts.length; i++) {
    if (tmplParts[i].startsWith(':')) {
      params[tmplParts[i].slice(1)] = pathParts[i];
    } else if (pathParts[i] !== tmplParts[i]) {
      return null;
    }
  }
  return params;
}

// ─── Analytics helper ────────────────────────────────────────────────────────
async function track(
  db: D1Database,
  eventType: string,
  userId: string | null,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO "w7-analytics-events" (id, event_type, user_id, metadata)
         VALUES (?, ?, ?, ?)`
      )
      .bind(nanoid(), eventType, userId, JSON.stringify(metadata))
      .run();
  } catch {
    // Analytics must never break main flow
  }
}

// ─── Route handlers ──────────────────────────────────────────────────────────

/** GET /api/health */
function handleHealth(): Response {
  return ok({ status: 'ok', service: 'bridgetalk-api', ts: new Date().toISOString() });
}

/** GET /api/users */
async function handleGetUsers(db: D1Database): Promise<Response> {
  const { results } = await db
    .prepare(
      `SELECT u.id, u.email, u.username, u.display_name, u.country_code,
              u.created_at, p.native_language, p.learning_language,
              p.proficiency_level, p.short_intro, p.interests,
              p.reliability_score, p.reply_rate, p.total_sessions
       FROM "w7-users" u
       LEFT JOIN "w7-profiles" p ON p.user_id = u.id
       WHERE u.is_active = 1
       ORDER BY u.created_at DESC`
    )
    .all();
  return ok({ users: results });
}

/** GET /api/profiles?learning=ja&native=en&level=B1&limit=20&offset=0 */
async function handleGetProfiles(
  db: D1Database,
  url: URL
): Promise<Response> {
  const learning = url.searchParams.get('learning');
  const native   = url.searchParams.get('native');
  const level    = url.searchParams.get('level');
  const limit    = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 50);
  const offset   = parseInt(url.searchParams.get('offset') ?? '0');

  let query = `
    SELECT u.id, u.display_name, u.country_code,
           p.id AS profile_id, p.native_language, p.learning_language,
           p.proficiency_level, p.short_intro, p.interests,
           p.availability, p.preferred_exchange_format,
           p.reliability_score, p.reply_rate, p.total_sessions
    FROM "w7-users" u
    JOIN "w7-profiles" p ON p.user_id = u.id
    WHERE u.is_active = 1 AND p.onboarding_completed = 1
  `;
  const bindings: unknown[] = [];

  if (learning) { query += ` AND p.learning_language = ?`; bindings.push(learning); }
  if (native)   { query += ` AND p.native_language = ?`;   bindings.push(native); }
  if (level)    { query += ` AND p.proficiency_level = ?`;  bindings.push(level); }

  query += ` ORDER BY p.reliability_score DESC, p.total_sessions DESC LIMIT ? OFFSET ?`;
  bindings.push(limit, offset);

  const { results } = await db.prepare(query).bind(...bindings).all();
  return ok({ profiles: results, limit, offset });
}

/** GET /api/profiles/:id */
async function handleGetProfile(
  db: D1Database,
  userId: string
): Promise<Response> {
  const row = await db
    .prepare(
      `SELECT u.id, u.display_name, u.country_code, u.created_at,
              p.id AS profile_id, p.native_language, p.learning_language,
              p.proficiency_level, p.bio, p.short_intro, p.interests,
              p.availability, p.preferred_exchange_format,
              p.partner_preference, p.reliability_score, p.reply_rate,
              p.total_sessions
       FROM "w7-users" u
       JOIN "w7-profiles" p ON p.user_id = u.id
       WHERE u.id = ? AND u.is_active = 1`
    )
    .bind(userId)
    .first();
  if (!row) return err('Profile not found', 404);
  return ok({ profile: row });
}

/** POST /api/profiles  — create or update profile during onboarding */
async function handleUpsertProfile(
  db: D1Database,
  request: Request
): Promise<Response> {
  const body = await request.json() as {
    email: string;
    username?: string;
    display_name: string;
    country_code?: string;
    native_language: string;
    learning_language: string;
    proficiency_level: string;
    bio?: string;
    short_intro?: string;
    interests?: string[];
    availability?: unknown[];
    preferred_exchange_format?: string;
    partner_preference?: Record<string, unknown>;
    avoid_scenarios?: string[];
  };

  if (!body.email || !body.native_language || !body.learning_language) {
    return err('email, native_language, and learning_language are required');
  }

  // Upsert user
  let user = await db
    .prepare(`SELECT id FROM "w7-users" WHERE email = ?`)
    .bind(body.email)
    .first<{ id: string }>();

  const userId = user?.id ?? nanoid();
  const username = body.username ?? body.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!user) {
    await db
      .prepare(
        `INSERT INTO "w7-users" (id, email, username, display_name, country_code)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(userId, body.email, username, body.display_name, body.country_code ?? 'US')
      .run();
  } else {
    await db
      .prepare(
        `UPDATE "w7-users" SET display_name = ?, updated_at = datetime('now') WHERE id = ?`
      )
      .bind(body.display_name, userId)
      .run();
  }

  // Upsert profile
  const existingProfile = await db
    .prepare(`SELECT id FROM "w7-profiles" WHERE user_id = ?`)
    .bind(userId)
    .first<{ id: string }>();

  const profileId = existingProfile?.id ?? nanoid();

  if (!existingProfile) {
    await db
      .prepare(
        `INSERT INTO "w7-profiles"
         (id, user_id, native_language, learning_language, proficiency_level,
          bio, short_intro, interests, availability, preferred_exchange_format,
          partner_preference, avoid_scenarios, onboarding_completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
      )
      .bind(
        profileId, userId,
        body.native_language, body.learning_language, body.proficiency_level,
        body.bio ?? null, body.short_intro ?? null,
        JSON.stringify(body.interests ?? []),
        JSON.stringify(body.availability ?? []),
        body.preferred_exchange_format ?? 'video',
        JSON.stringify(body.partner_preference ?? {}),
        JSON.stringify(body.avoid_scenarios ?? [])
      )
      .run();
  } else {
    await db
      .prepare(
        `UPDATE "w7-profiles" SET
         native_language = ?, learning_language = ?, proficiency_level = ?,
         bio = ?, short_intro = ?, interests = ?, availability = ?,
         preferred_exchange_format = ?, partner_preference = ?,
         avoid_scenarios = ?, onboarding_completed = 1,
         updated_at = datetime('now')
         WHERE user_id = ?`
      )
      .bind(
        body.native_language, body.learning_language, body.proficiency_level,
        body.bio ?? null, body.short_intro ?? null,
        JSON.stringify(body.interests ?? []),
        JSON.stringify(body.availability ?? []),
        body.preferred_exchange_format ?? 'video',
        JSON.stringify(body.partner_preference ?? {}),
        JSON.stringify(body.avoid_scenarios ?? []),
        userId
      )
      .run();
  }

  await track(db, 'onboarding_completed', userId);
  return ok({ user_id: userId, profile_id: profileId }, existingProfile ? 200 : 201);
}

/** GET /api/matches/saved?user_id=xxx */
async function handleGetSavedMatches(
  db: D1Database,
  url: URL
): Promise<Response> {
  const userId = url.searchParams.get('user_id');
  if (!userId) return err('user_id is required');

  const { results } = await db
    .prepare(
      `SELECT sm.id AS save_id, sm.created_at AS saved_at,
              u.id, u.display_name, u.country_code,
              p.native_language, p.learning_language, p.proficiency_level,
              p.short_intro, p.interests, p.reliability_score
       FROM "w7-saved-matches" sm
       JOIN "w7-users" u  ON u.id  = sm.saved_user_id
       JOIN "w7-profiles" p ON p.user_id = sm.saved_user_id
       WHERE sm.user_id = ?
       ORDER BY sm.created_at DESC`
    )
    .bind(userId)
    .all();
  return ok({ saved: results });
}

/** POST /api/matches/save */
async function handleSaveMatch(
  db: D1Database,
  request: Request
): Promise<Response> {
  const { user_id, target_user_id } = await request.json() as {
    user_id: string;
    target_user_id: string;
  };
  if (!user_id || !target_user_id) return err('user_id and target_user_id are required');

  try {
    await db
      .prepare(`INSERT OR IGNORE INTO "w7-saved-matches" (id, user_id, saved_user_id) VALUES (?, ?, ?)`)
      .bind(nanoid(), user_id, target_user_id)
      .run();
    await track(db, 'match_saved', user_id, { target_user_id });
    return ok({ success: true });
  } catch {
    return err('Could not save match');
  }
}

/** DELETE /api/matches/save/:id */
async function handleUnsaveMatch(
  db: D1Database,
  saveId: string
): Promise<Response> {
  await db.prepare(`DELETE FROM "w7-saved-matches" WHERE id = ?`).bind(saveId).run();
  return ok({ success: true });
}

/** POST /api/waitlist */
async function handleWaitlist(
  db: D1Database,
  request: Request
): Promise<Response> {
  const body = await request.json() as {
    email: string;
    name?: string;
    native_language?: string;
    learning_language?: string;
    source?: string;
  };
  if (!body.email) return err('email is required');

  try {
    await db
      .prepare(
        `INSERT OR IGNORE INTO "w7-waitlist" (id, email, name, native_language, learning_language, source)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        nanoid(), body.email, body.name ?? null,
        body.native_language ?? null, body.learning_language ?? null,
        body.source ?? 'website'
      )
      .run();
    await track(db, 'waitlist_submitted', null, { email: body.email, source: body.source });
    return ok({ success: true, message: "You're on the list!" });
  } catch {
    return err('Could not sign up — you may already be on the list');
  }
}

/** GET /api/topic-packs */
async function handleGetTopicPacks(db: D1Database): Promise<Response> {
  const { results } = await db
    .prepare(`SELECT * FROM "w7-topic-packs" ORDER BY is_free DESC, category ASC`)
    .all();
  return ok({ topic_packs: results });
}

/** POST /api/trial-invites */
async function handleCreateTrialInvite(
  db: D1Database,
  request: Request
): Promise<Response> {
  const body = await request.json() as {
    from_user_id: string;
    to_user_id: string;
    proposed_time: string;
    topic_id?: string;
    message?: string;
  };
  if (!body.from_user_id || !body.to_user_id || !body.proposed_time) {
    return err('from_user_id, to_user_id, and proposed_time are required');
  }

  const id = nanoid();
  await db
    .prepare(
      `INSERT INTO "w7-trial-invites" (id, from_user_id, to_user_id, proposed_time, topic_id, message)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, body.from_user_id, body.to_user_id, body.proposed_time, body.topic_id ?? null, body.message ?? null)
    .run();

  await track(db, 'trial_invite_sent', body.from_user_id, {
    to_user_id: body.to_user_id,
    topic_id: body.topic_id,
  });
  return ok({ id, success: true }, 201);
}

/** GET /api/sessions?user_id=xxx */
async function handleGetSessions(
  db: D1Database,
  url: URL
): Promise<Response> {
  const userId = url.searchParams.get('user_id');
  if (!userId) return err('user_id is required');

  const { results } = await db
    .prepare(
      `SELECT s.id, s.scheduled_at, s.duration_minutes, s.status, s.session_number,
              tp.name AS topic_name, tp.name_jp AS topic_name_jp,
              ua.id AS partner_id, ua.display_name AS partner_name, ua.country_code AS partner_country,
              pa.native_language AS partner_native, pa.learning_language AS partner_learning
       FROM "w7-sessions" s
       LEFT JOIN "w7-topic-packs" tp ON tp.id = s.topic_id
       JOIN "w7-users" ua ON (ua.id = CASE WHEN s.user_id_a = ? THEN s.user_id_b ELSE s.user_id_a END)
       LEFT JOIN "w7-profiles" pa ON pa.user_id = ua.id
       WHERE s.user_id_a = ? OR s.user_id_b = ?
       ORDER BY s.scheduled_at ASC`
    )
    .bind(userId, userId, userId)
    .all();
  return ok({ sessions: results });
}

/** POST /api/sessions */
async function handleCreateSession(
  db: D1Database,
  request: Request
): Promise<Response> {
  const body = await request.json() as {
    user_id_a: string;
    user_id_b: string;
    scheduled_at: string;
    duration_minutes?: number;
    topic_id?: string;
  };
  if (!body.user_id_a || !body.user_id_b || !body.scheduled_at) {
    return err('user_id_a, user_id_b, and scheduled_at are required');
  }

  // Determine session_number for this pair
  const prev = await db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM "w7-sessions"
       WHERE (user_id_a = ? AND user_id_b = ?) OR (user_id_a = ? AND user_id_b = ?)`
    )
    .bind(body.user_id_a, body.user_id_b, body.user_id_b, body.user_id_a)
    .first<{ cnt: number }>();

  const sessionNumber = (prev?.cnt ?? 0) + 1;
  const id = nanoid();

  await db
    .prepare(
      `INSERT INTO "w7-sessions" (id, user_id_a, user_id_b, scheduled_at, duration_minutes, topic_id, session_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id, body.user_id_a, body.user_id_b, body.scheduled_at,
      body.duration_minutes ?? 30, body.topic_id ?? null, sessionNumber
    )
    .run();

  return ok({ id, session_number: sessionNumber }, 201);
}

/** PUT /api/sessions/:id */
async function handleUpdateSession(
  db: D1Database,
  sessionId: string,
  request: Request
): Promise<Response> {
  const body = await request.json() as { status?: string };
  if (!body.status) return err('status is required');

  await db
    .prepare(`UPDATE "w7-sessions" SET status = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(body.status, sessionId)
    .run();
  return ok({ success: true });
}

/** POST /api/session-notes */
async function handleSaveSessionNotes(
  db: D1Database,
  request: Request
): Promise<Response> {
  const body = await request.json() as {
    session_id: string;
    user_id: string;
    quick_notes?: string;
    correction_for_partner?: string;
    next_topic?: string;
  };
  if (!body.session_id || !body.user_id) return err('session_id and user_id are required');

  await db
    .prepare(
      `INSERT INTO "w7-session-notes"
         (id, session_id, user_id, quick_notes, correction_for_partner, next_topic)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id, user_id) DO UPDATE SET
         quick_notes = excluded.quick_notes,
         correction_for_partner = excluded.correction_for_partner,
         next_topic = excluded.next_topic`
    )
    .bind(
      nanoid(), body.session_id, body.user_id,
      body.quick_notes ?? null, body.correction_for_partner ?? null, body.next_topic ?? null
    )
    .run();

  return ok({ success: true });
}

/** POST /api/feedback */
async function handleSubmitFeedback(
  db: D1Database,
  request: Request
): Promise<Response> {
  const body = await request.json() as {
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
  };
  if (!body.session_id || !body.from_user_id || !body.to_user_id) {
    return err('session_id, from_user_id, and to_user_id are required');
  }

  await db
    .prepare(
      `INSERT INTO "w7-feedback"
         (id, session_id, from_user_id, to_user_id, was_helpful, want_again,
          was_punctual, was_polite, was_engaged, improvement_notes, second_session_interest)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id, from_user_id) DO UPDATE SET
         was_helpful = excluded.was_helpful,
         want_again  = excluded.want_again,
         was_punctual = excluded.was_punctual,
         was_polite  = excluded.was_polite,
         was_engaged = excluded.was_engaged,
         improvement_notes = excluded.improvement_notes,
         second_session_interest = excluded.second_session_interest`
    )
    .bind(
      nanoid(), body.session_id, body.from_user_id, body.to_user_id,
      body.was_helpful ?? 3, body.want_again ?? 0,
      body.was_punctual ?? 1, body.was_polite ?? 1, body.was_engaged ?? 1,
      body.improvement_notes ?? null, body.second_session_interest ?? 0
    )
    .run();

  // Update partner's reliability score (simple moving average)
  await db.prepare(
    `UPDATE "w7-profiles" SET
       reliability_score = (
         SELECT ROUND(AVG(
           (f.was_punctual + f.was_polite + f.was_engaged) * 5.0 / 3.0
         ), 1)
         FROM "w7-feedback" f WHERE f.to_user_id = ?
       ),
       updated_at = datetime('now')
     WHERE user_id = ?`
  ).bind(body.to_user_id, body.to_user_id).run();

  await track(db, 'feedback_completed', body.from_user_id, {
    session_id: body.session_id,
    want_again: body.want_again,
    second_session_interest: body.second_session_interest,
  });

  if (body.second_session_interest) {
    await track(db, 'second_session_interest_clicked', body.from_user_id, {
      session_id: body.session_id,
    });
  }
  return ok({ success: true });
}

/** GET /api/dashboard/:userId */
async function handleDashboard(
  db: D1Database,
  userId: string
): Promise<Response> {
  const [upcoming, saved, recentFeedback, profile] = await Promise.all([
    db.prepare(
      `SELECT s.id, s.scheduled_at, s.duration_minutes, s.status, s.session_number,
              tp.name AS topic_name,
              u.id AS partner_id, u.display_name AS partner_name, u.country_code AS partner_country
       FROM "w7-sessions" s
       LEFT JOIN "w7-topic-packs" tp ON tp.id = s.topic_id
       JOIN "w7-users" u ON u.id = CASE WHEN s.user_id_a = ? THEN s.user_id_b ELSE s.user_id_a END
       WHERE (s.user_id_a = ? OR s.user_id_b = ?) AND s.status = 'scheduled'
       ORDER BY s.scheduled_at ASC LIMIT 5`
    ).bind(userId, userId, userId).all(),

    db.prepare(
      `SELECT sm.id AS save_id, u.id, u.display_name, u.country_code,
              p.native_language, p.learning_language, p.proficiency_level,
              p.short_intro, p.interests
       FROM "w7-saved-matches" sm
       JOIN "w7-users" u ON u.id = sm.saved_user_id
       LEFT JOIN "w7-profiles" p ON p.user_id = sm.saved_user_id
       WHERE sm.user_id = ? LIMIT 6`
    ).bind(userId).all(),

    db.prepare(
      `SELECT f.was_helpful, f.want_again, f.improvement_notes, f.created_at,
              u.display_name AS from_name
       FROM "w7-feedback" f
       JOIN "w7-users" u ON u.id = f.from_user_id
       WHERE f.to_user_id = ? ORDER BY f.created_at DESC LIMIT 5`
    ).bind(userId).all(),

    db.prepare(
      `SELECT p.proficiency_level, p.total_sessions, p.reliability_score,
              p.native_language, p.learning_language
       FROM "w7-profiles" p WHERE p.user_id = ?`
    ).bind(userId).first(),
  ]);

  const sessionCount = await db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM "w7-sessions"
       WHERE (user_id_a = ? OR user_id_b = ?) AND status = 'completed'`
    )
    .bind(userId, userId)
    .first<{ cnt: number }>();

  return ok({
    upcoming: upcoming.results,
    saved: saved.results,
    recent_feedback: recentFeedback.results,
    profile,
    completed_sessions: sessionCount?.cnt ?? 0,
  });
}

/** POST /api/analytics */
async function handleAnalytics(
  db: D1Database,
  request: Request
): Promise<Response> {
  const body = await request.json() as {
    event_type: string;
    user_id?: string;
    metadata?: Record<string, unknown>;
  };
  if (!body.event_type) return err('event_type is required');
  await track(db, body.event_type, body.user_id ?? null, body.metadata ?? {});
  return ok({ success: true });
}

// ─── Main fetch handler ───────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    // Normalize: collapse double-slashes, strip trailing slash
    const pathname = ('/' + url.pathname.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')) || '/';
    const method = request.method;

    try {
      // Root & API index — helpful for direct browser access / debugging
      if (method === 'GET' && (pathname === '/' || pathname === '/api')) {
        return ok({
          service: 'bridgetalk-api',
          status: 'ok',
          version: '1.0.0',
          endpoints: [
            'GET  /api/health',
            'GET  /api/users',
            'GET  /api/profiles',
            'POST /api/profiles',
            'GET  /api/profiles/:id',
            'GET  /api/matches/saved?user_id=',
            'POST /api/matches/save',
            'POST /api/waitlist',
            'GET  /api/topic-packs',
            'POST /api/trial-invites',
            'GET  /api/sessions?user_id=',
            'POST /api/sessions',
            'PUT  /api/sessions/:id',
            'POST /api/session-notes',
            'POST /api/feedback',
            'GET  /api/dashboard/:userId',
            'POST /api/analytics',
          ],
        });
      }

      // Health
      if (method === 'GET' && pathname === '/api/health') return handleHealth();

      // Users
      if (method === 'GET' && pathname === '/api/users') return handleGetUsers(env.DB);

      // Profiles
      if (method === 'GET' && pathname === '/api/profiles') return handleGetProfiles(env.DB, url);
      if (method === 'POST' && pathname === '/api/profiles') return handleUpsertProfile(env.DB, request);
      const profileParams = match(pathname, '/api/profiles/:id');
      if (method === 'GET' && profileParams) return handleGetProfile(env.DB, profileParams.id);

      // Saved matches
      if (method === 'GET' && pathname === '/api/matches/saved') return handleGetSavedMatches(env.DB, url);
      if (method === 'POST' && pathname === '/api/matches/save') return handleSaveMatch(env.DB, request);
      const unsaveParams = match(pathname, '/api/matches/save/:id');
      if (method === 'DELETE' && unsaveParams) return handleUnsaveMatch(env.DB, unsaveParams.id);

      // Waitlist
      if (method === 'POST' && pathname === '/api/waitlist') return handleWaitlist(env.DB, request);

      // Topic packs
      if (method === 'GET' && pathname === '/api/topic-packs') return handleGetTopicPacks(env.DB);

      // Trial invites
      if (method === 'POST' && pathname === '/api/trial-invites') return handleCreateTrialInvite(env.DB, request);

      // Sessions
      if (method === 'GET' && pathname === '/api/sessions') return handleGetSessions(env.DB, url);
      if (method === 'POST' && pathname === '/api/sessions') return handleCreateSession(env.DB, request);
      const sessionParams = match(pathname, '/api/sessions/:id');
      if (method === 'PUT' && sessionParams) return handleUpdateSession(env.DB, sessionParams.id, request);

      // Session notes
      if (method === 'POST' && pathname === '/api/session-notes') return handleSaveSessionNotes(env.DB, request);

      // Feedback
      if (method === 'POST' && pathname === '/api/feedback') return handleSubmitFeedback(env.DB, request);

      // Dashboard
      const dashboardParams = match(pathname, '/api/dashboard/:userId');
      if (method === 'GET' && dashboardParams) return handleDashboard(env.DB, dashboardParams.userId);

      // Analytics
      if (method === 'POST' && pathname === '/api/analytics') return handleAnalytics(env.DB, request);

      return err(`Not found: ${method} ${pathname}`, 404);
    } catch (e) {
      console.error('Worker error:', e);
      const msg = e instanceof Error ? e.message : String(e);
      return err(`Internal server error: ${msg}`, 500);
    }
  },
};
