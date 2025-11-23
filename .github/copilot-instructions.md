<!-- Copilot / AI agent instructions for the Bell24h codebase -->
# Copilot instructions — Bell24h AI Agent

Quick, actionable guidance so an AI coding assistant can be immediately productive in this repository.

1) Big picture
- **Frontend**: React + Vite app in project root / `src` — run locally with `npm run dev`.
- **Backend**: Vercel-style serverless functions live under `api/` and are routed via a central handler at `api/index.ts`. For local debugging an Express shim is provided in `server.ts` (run with `npm run start`).
- **Data flow**: Cron fetch (`api/cron/fetch-leads.ts`) -> save via `api/_lib/db.ts` -> analysis via `api/_lib/multiAI.ts` or `services/geminiService.ts` -> UI reads from `/api/leads`.

2) Where to edit and why
- **API handlers:** Edit `api/_lib/handlers/*.ts` for request logic; `api/index.ts` imports these to bundle as a single serverless deployment. Prefer adding new handlers under `api/_lib/handlers` (not top-level `api/*`) to avoid creating unintended separate functions.
- **AI logic:** `api/_lib/multiAI.ts` is the multi-provider fallback layer (Gemini → OpenAI → Anthropic). `services/geminiService.ts` contains Gemini-specific schema-driven logic used by higher-level handlers.
- **DB:** `api/_lib/db.ts` is the Neon/Postgres adapter optimized for serverless (small pool, `prepare: false`). Use its exported `sql`, `db.getLeads`, and `db.createLead` helpers for consistent behavior.

3) Key conventions & patterns (project-specific)
- **Single-router approach:** The project centralizes API routing in `api/index.ts` (and the Express shim `server.ts`) — do not add many ad-hoc top-level route files. Add to `api/_lib/handlers` and wire into `api/index.ts` where appropriate.
- **Dual lib folders:** There are three code locations with similar responsibilities: `api/_lib` (serverless-bound helpers), `lib/` (non-serverless helpers), and `src/lib/`. When changing runtime behavior for serverless endpoints, prefer `api/_lib` files to ensure the change is deployed with the function.
- **AI response handling:** Use `api/_lib/multiAI.ts:extractText` to normalize different provider shapes. Handlers expect AI output as JSON (many functions parse JSON strings returned by AI). Respect timeouts and provider fallbacks — modify providers array in `multiAI.ts` when adding/removing AI vendors.
- **Database assumptions:** `api/_lib/db.ts` expects `DATABASE_URL` (or `POSTGRES_URL`) and will throw if missing. It sets `max:1` & `prepare: false` to be Neon/serverless-friendly — avoid changing these unless you fully understand Neon pooling.

4) How to run and debug locally
- Start frontend only: `npm run dev` (Vite). Open `http://localhost:5173`.
- Start API + static frontend (server shim): `npm run start` (runs `tsx server.ts`). This exposes the same `api/*` paths locally; you can call `/api/cron/fetch-leads` or `/api/setup-db`.
- Type checking: `npm run type-check`.
- Building production frontend: `npm run build` then `npm run start` will serve the built `dist` folder via `server.ts`.

5) Environment variables (critical)
- `DATABASE_URL` or `POSTGRES_URL` — required for DB access (Neon recommended).
- `GEMINI_API_KEY` or `API_KEY` — primary Google Gemini key used by `multiAI` and `services/geminiService`.
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` — optional fallbacks used by `multiAI.ts`.
- Other keys: `RESEND_API_KEY`, mailer credentials, etc., may be referenced in `package.json` deps and `api/_lib` handlers.

6) Examples to copy/extend
- Add an AI provider: replicate the pattern in `api/_lib/multiAI.ts` — provider functions return parsed JSON; wrap with `timeout` and place in `providers` array (Gemini first, OpenAI fallback).
- Create a new API handler: add `api/_lib/handlers/myfeature.ts` exporting `export const handler = async (req,res) => { ... }` and then import + route it in `api/index.ts`.
- Use DB helpers: prefer `await db.getLeads()` or `await db.createLead(lead)` from `api/_lib/db.ts` to ensure consistent connection settings.

7) What NOT to change lightly
- Neon/Postgres connection options in `api/_lib/db.ts` (`max`, `prepare`, `ssl`) — these are tuned for serverless.
- The router pattern in `api/index.ts` — adding top-level `api/*.ts` can create multiple serverless functions on Vercel.

8) Quick links (files to open first)
- `server.ts` — local server shim, route mapping to `api/index.ts`
- `api/index.ts` — central router; see how paths map to handlers
- `api/_lib/handlers/*` — actual handler implementations
- `api/_lib/multiAI.ts` and `services/geminiService.ts` — AI orchestration & schema-driven usage
- `api/_lib/db.ts` — Neon/Postgres helper used across handlers
- `api/cron/fetch-leads.ts` — scheduled lead ingestion

If anything here is unclear or missing (CI, secret names, or other external resources you rely on), tell me what to verify and I will update this file.
