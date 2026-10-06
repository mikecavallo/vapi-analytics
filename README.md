# Invoxa (vapi-analytics)

Call analytics dashboard for voice AI agents built on [Vapi](https://vapi.ai) and [Retell](https://www.retellai.com).

Each customer workspace connects its own Vapi and/or Retell API key. The server pulls the raw call records for the selected period and computes everything on the dashboard from them: KPIs with period-over-period comparison, daily volume and success, outcome breakdown, duration distribution, a peak-usage heatmap, per-assistant performance, and cost per call and per minute. A demo mode with seeded sample calls lets you explore the dashboards without any provider keys.

![Dashboard overview (demo data)](docs/screenshots/dashboard-overview.png)

| Peak usage heatmap | Conversation outcomes |
| --- | --- |
| ![Heatmap](docs/screenshots/dashboard-heatmap.png) | ![Outcomes](docs/screenshots/dashboard-outcomes.png) |

Screenshots show demo mode with generated sample calls, not a real account.

## Features

Working today:

- **Accounts and tenancy:** JWT auth, invite-only signup (email whitelist), email verification, per-customer workspaces, and super-admin screens for customers, users and the whitelist.
- **Analytics dashboard** (`/dashboard`) for Vapi and Retell. Figures come only from the provider's call records for the period:
  - totals, average duration, success rate (overall, inbound, outbound) and cost, each compared with the previous period of the same length
  - daily volume and success/failure, outcome (ended reason) shares and their change vs the previous period, average duration per outcome
  - duration histogram, peak-usage heatmap (UTC), per-assistant calls/success/duration/cost, most successful assistant (minimum 5 calls)
  - configurable warning thresholds, CSV export, drag-to-reorder sections
- **Call browser:** recent calls and per-call details (Vapi call details include the recording URL).
- **Demo mode:** `DEMO_MODE=true` plus `npm run db:seed-demo` gives a login with roughly 660 clearly labeled sample calls across both providers.
- **Marketing site:** public landing, solutions, use-case, platform, privacy and terms pages.

Present but needing extra keys, and not covered by the test suite:

- **VoiceScope** (`/bulk-analysis`): natural-language questions over call transcripts (OpenAI).
- **Assistant Studio** (`/assistant-studio`): generates a Vapi assistant config with OpenAI and creates or edits assistants through the Vapi API.
- **Reports, benchmarks and conversation-flow analysis** endpoints (OpenAI plus a platform `VAPI_API_KEY`).
- **Media** (`/media`): Facebook Ads campaign insights (Facebook app credentials).

Not implemented yet:

- Customer satisfaction scores. Neither provider reports them, so the dashboard shows "Not tracked".
- Stage-level conversation flow on the dashboard. That section says so when there is no data.

## How the numbers are computed

`server/analytics/dashboard.ts` holds the aggregation as pure functions with unit tests:

- **Data source:** Vapi and Retell calls are normalized into one `NormalizedCall` shape (`server/providers/calls.ts`): durations in seconds, cost in USD, inbound or outbound, and `successEvaluation` taken from the provider's call analysis.
- **Success:** a call counts as successful when its `successEvaluation` is `true`. Calls on assistants with no success evaluation configured count as unsuccessful.
- **Comparisons:** each request loads the current period and the previous period of the same length. `costAnalysis.monthlyCostTrend` is the percentage change in total cost between them, and is `null` when there is no previous-period baseline.
- **Fetch cap:** each request fetches at most 1,000 calls per period, a provider API limit. When a period hits the cap, the response sets `meta.callLimitReached` and the dashboard shows a notice.
- **Retell aggregates:** Retell has no aggregation API, so `POST /api/analytics` computes the same `kpis` / `call_outcomes` / `assistant_performance` shape from raw calls.

## Architecture

```
client/            React 18 + Vite, wouter routing, TanStack Query, shadcn/ui + Tailwind, Recharts
server/
  index.ts         Express app (helmet, CORS, logging), Vite dev middleware or static serving
  routes/          One module per domain: auth, customer, admin, analytics, calls,
                   bulk-analysis, voicescope, benchmarks, assistants, conversation-flow,
                   chatbot, facebook-ads; registered from routes/index.ts
  analytics/       Pure aggregation (dashboard.ts) and Vapi Analytics API queries
  providers/       Vapi/Retell clients and normalization; source.ts picks live vs demo data
  demo/            Deterministic sample-call generator
  email/           Pluggable email sender (Resend over HTTP, or console)
  storage.ts       Drizzle data access (Postgres)
shared/schema.ts   Drizzle tables + zod schemas shared by client and server
scripts/           seed-demo.ts
tests/             Vitest unit tests (no network, no database)
```

Production build: Vite bundles the client into `dist/public`, and esbuild bundles the server into `dist/index.js`. `render.yaml` is a Render blueprint.

## Setup

Requirements: Node 20+ (CI uses 22) and PostgreSQL.

```bash
npm install
cp .env.example .env          # set DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY
npm run db:push               # create tables with drizzle-kit
npm run dev                   # http://localhost:5000
```

`npm run dev` does not load `.env` automatically. Export the variables in your shell, or use a tool like `dotenv-cli`.

### Try it with demo data (no Vapi/Retell keys)

```bash
export DATABASE_URL=postgres://...
npm run db:push
npm run db:seed-demo          # prints the login; re-run any time to refresh dates
DEMO_MODE=true npm run dev
```

Log in at `/login` as `demo@example.com` with password `demo-password-1`. You can override both with `DEMO_EMAIL` and `DEMO_PASSWORD`. Demo data is only served to workspaces with no key for the selected provider, and the dashboard shows a "Demo mode" banner while it is active.

### Signing up real users

Signup is invite-only: a super admin adds the address to the email whitelist first. With `RESEND_API_KEY` set, a verification link is emailed through Resend. Without it, the email is logged to the server console. Outside production, the signup response also includes the token so you can verify locally.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string |
| `JWT_SECRET` | yes in production | Signs auth tokens |
| `ENCRYPTION_KEY` | yes in production | Encrypts stored Facebook credentials |
| `PORT` | no | Defaults to 5000 |
| `APP_URL` | recommended | Base URL for links in verification emails |
| `DEMO_MODE` | no | `true` serves seeded sample calls to workspaces without provider keys |
| `RESEND_API_KEY`, `EMAIL_FROM` | no | Send verification email through Resend; otherwise it is logged |
| `OPENAI_API_KEY` | for AI features | VoiceScope, Assistant Studio, reports, chatbot |
| `VAPI_API_KEY` | for Studio/VoiceScope | Platform-level Vapi key used by those routes |
| `FACEBOOK_APP_SECRET`, `FACEBOOK_API_VERSION` | for `/media` | Facebook Ads integration |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `24h` |

Customer Vapi and Retell keys are entered per workspace in Settings and stored in the database.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with Vite HMR |
| `npm run build` | Client and server production build into `dist/` |
| `npm start` | Run the production build |
| `npm run check` | TypeScript typecheck |
| `npm test` | Vitest unit tests: aggregation, provider normalization, email sender, demo generator |
| `npm run db:push` | Sync the Drizzle schema to the database |
| `npm run db:seed-demo` | Create or refresh the demo login and sample calls |

CI (`.github/workflows/ci.yml`) runs typecheck, tests and build on every push and pull request.

## Status

This project is in active development. The analytics dashboard, auth and demo mode are the most complete parts. Known gaps:

- Assistant Studio, VoiceScope, benchmarks and reports use a single platform `VAPI_API_KEY` rather than each customer's own key.
- Analytics results are cached in memory for 5 minutes per workspace, period and provider, so there is no shared cache across instances.
- There are no end-to-end tests. The unit tests cover the server-side analytics and integrations with mocked HTTP.

## License

No license file has been added yet. `package.json` declares MIT, a value inherited from the starter template.
