# BridgeTalk MVP

Structured language exchange for serious Japanese ↔ English learners.

---

## Architecture

```
W7-Cloude-BridgeTalk/
├── src/index.ts          # Cloudflare Worker API (all database access)
├── wrangler.jsonc        # Worker config + D1 binding
├── migrations/
│   ├── 0001_create_tables.sql   # Full schema (w7-* prefixed tables)
│   └── 0002_seed_data.sql       # 10 mock users (5 US + 5 JP)
└── frontend/             # Next.js 14 app
    └── src/
        ├── app/          # App Router pages
        │   ├── page.tsx              # Landing page (EN/JP toggle)
        │   ├── onboarding/page.tsx   # 8-step onboarding wizard
        │   ├── matching/page.tsx     # Profile browse + invite
        │   ├── session/[id]/page.tsx # Live session room + feedback
        │   ├── dashboard/page.tsx    # User dashboard
        │   └── pricing/page.tsx      # Pricing plans
        ├── components/
        │   └── Navbar.tsx
        ├── contexts/
        │   └── LanguageContext.tsx   # EN/JP i18n provider
        └── lib/
            ├── api.ts                # Type-safe API client
            └── i18n.ts               # Full EN + JP translations
```

The **Cloudflare Worker** is the only component that touches the D1 database.
The **Next.js frontend** calls the Worker via proxied `/api/*` routes.
No secrets or DB credentials are ever exposed to the browser.

---

## Database (my-d1-sql-db)

All tables are prefixed with `"w7-"` (quoted identifiers in SQLite):

| Table | Purpose |
|---|---|
| `"w7-users"` | Core user records |
| `"w7-profiles"` | Onboarding data, language prefs, availability |
| `"w7-saved-matches"` | Bookmarked profiles |
| `"w7-topic-packs"` | Structured conversation guides |
| `"w7-trial-invites"` | 15-min trial session invitations |
| `"w7-sessions"` | Scheduled / completed exchange sessions |
| `"w7-session-notes"` | Quick notes + corrections per session |
| `"w7-feedback"` | Post-session ratings (reliability foundation) |
| `"w7-waitlist"` | Email waitlist signups |
| `"w7-analytics-events"` | Event log for key conversion metrics |

---

## Quick Start

### Prerequisites
- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) authenticated with your Cloudflare account

---

### 1. Install Worker dependencies

```bash
npm install
```

### 2. Apply migrations to remote D1

```bash
npm run db:migrate:remote
```

### 3. Seed mock data (safe — uses INSERT OR IGNORE)

```bash
npm run db:seed:remote
```

### 4. Run the Worker locally (against remote D1)

```bash
npm run dev
# Worker runs at http://localhost:8787
```

### 5. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

The Next.js dev server automatically proxies `/api/*` → `http://localhost:8787`.

---

## Key API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/users` | List all active users |
| GET | `/api/profiles` | Browse profiles (filterable) |
| POST | `/api/profiles` | Create/update profile (onboarding save) |
| GET | `/api/profiles/:id` | Single profile |
| GET | `/api/matches/saved?user_id=` | Saved matches |
| POST | `/api/matches/save` | Save a match |
| POST | `/api/waitlist` | Join waitlist |
| GET | `/api/topic-packs` | Get topic packs |
| POST | `/api/trial-invites` | Send trial invite |
| GET | `/api/sessions?user_id=` | User's sessions |
| POST | `/api/sessions` | Create session |
| PUT | `/api/sessions/:id` | Update session status |
| POST | `/api/session-notes` | Save session notes |
| POST | `/api/feedback` | Submit post-session feedback |
| GET | `/api/dashboard/:userId` | Dashboard data |
| POST | `/api/analytics` | Log analytics event |

---

## Deploy

### Deploy the Worker

```bash
npm run deploy
```

### Deploy the Frontend (Vercel)

```bash
cd frontend
# Set environment variable:
#   WORKER_URL=https://bridgetalk-api.<your-account>.workers.dev
npx vercel deploy
```

---

## Analytics Events Tracked

| Event | Trigger |
|---|---|
| `waitlist_submitted` | User joins waitlist |
| `onboarding_completed` | Profile saved after wizard |
| `match_saved` | User bookmarks a partner |
| `trial_invite_sent` | Trial invite created |
| `feedback_completed` | Post-session feedback submitted |
| `second_session_interest_clicked` | User checks "interested in another session" |

All events are stored in `"w7-analytics-events"` and queryable via D1.

---

## Validation Metrics (MVP Goals)

1. **Waitlist conversion** — % of landing page visitors who sign up
2. **Onboarding completion rate** — % who finish all 8 steps
3. **Trial invite click-through** — matches viewed → invites sent
4. **Second-session intent** — % of feedback forms where `second_session_interest = 1`
5. **7-day revisit signal** — users who return within 7 days of signup
6. **Feedback completion rate** — % of completed sessions that have feedback

---

## Development Notes

- Local D1 (`--local`) uses a SQLite file at `.wrangler/state/v3/d1/`
- Remote D1 (`--remote`) reads from the live Cloudflare D1 instance
- `INSERT OR IGNORE` is used throughout seed data — safe to re-run
- The frontend stores the current user ID in `localStorage` (`bt_user_id`)
- Auth is intentionally minimal for MVP — replace with Cloudflare Access or a JWT flow before launch
