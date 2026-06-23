# Spec: "Ask about me" AI chat for the portfolio

Date: 2026-06-16
Branch context: `feat/motion-animations` (Vite 7 + React 19 + react-router SPA)
Status: approved design, pending spec review

## 1. Goal

A clickable AI assistant on the portfolio. Visitor opens it and asks anything about
the owner (Alex). The assistant answers from a curated persona (bio, experience,
projects, skills, availability) and politely declines off-topic questions.

## 2. Decisions (locked)

- AI stack: **Genkit + Gemini** (`genkit` + `@genkit-ai/googleai`), model `gemini-2.5-flash`.
- Backend: **standalone Netlify Node function**. The existing Vite SPA is NOT migrated
  to a framework. Smallest change that hides the API key server-side.
- Deploy target: **Netlify**.
- Knowledge: persona text stuffed into the system prompt. **No vector DB / RAG** (the
  owner's info fits a prompt — YAGNI).
- v1: **non-streaming** (full answer + typing indicator). Streaming is a later add-on.
- Conversation history: **client-side only**, no database.

## 3. Architecture

Three new units, isolated by clear interfaces. SPA pages/sections untouched except a
single mount of the widget in `App.tsx`.

```
Browser (Vite SPA)                         Netlify Functions (Node)
┌─────────────────────────┐  POST /api/ask  ┌──────────────────────────┐
│ <AskAI/>  chat widget    │ ───────────────▶│ ask.ts (handler)         │
│  - trigger button        │  {messages}     │  - validate input        │
│  - panel + messages      │                 │  - buildPrompt(persona,…)│
│  - typing skeleton       │ ◀───────────────│  - genkit ai.generate()  │
│  - error states          │  {reply}|{error}│  - cap output tokens     │
└─────────────────────────┘                 │  persona.ts (knowledge)  │
                                             │  ai.ts (genkit instance) │
                                             └──────────────────────────┘
                                                        │ GOOGLE_GENAI_API_KEY (env)
                                                        ▼  Google AI (Gemini)
```

### 3.1 Files

New:
- `app/netlify/functions/ask.ts` — HTTP handler. Request/response contract below.
- `app/netlify/functions/ai.ts` — Genkit instance: `genkit({ plugins: [googleAI()] })`,
  exports `ai` and the model ref. Single place model/plugins are configured.
- `app/netlify/functions/persona.ts` — exports `PERSONA` (string) + `SYSTEM_PROMPT`
  builder. The bot's entire knowledge + tone + guardrail instructions. Owner edits this.
- `app/netlify/functions/buildPrompt.ts` — pure function `buildPrompt(persona, messages)`
  → the final prompt/messages array. Pure so it is unit-testable without the model.
- `app/netlify/functions/buildPrompt.test.ts` — unit tests for the pure builder.
- `app/src/components/AskAI.tsx` — the chat widget (trigger + panel + state).
- `app/src/lib/askClient.ts` — typed `askAI(messages)` fetch wrapper for the frontend.
- `app/netlify.toml` — functions config + `/api/*` redirect.
- `app/.env.example` — documents `GOOGLE_GENAI_API_KEY`.

Modified:
- `app/src/App.tsx` — mount `<AskAI/>` once (sibling of `<CustomCursor/>`).
- `app/package.json` — add deps: `genkit`, `@genkit-ai/googleai`; dev dep:
  `@netlify/functions` (types), `netlify-cli` (local dev, optional/global ok).

### 3.2 Request / response contract (`/api/ask`)

```ts
// Request (POST application/json)
type AskRequest = {
  messages: { role: "user" | "model"; content: string }[]; // full client history, capped
};

// Response 200
type AskResponse = { reply: string };

// Response 4xx/5xx
type AskError = { error: string; code: "bad_input" | "rate_limited" | "upstream" | "server" };
```

Server caps: reject if last user message > 1000 chars or > 20 messages in history
(`bad_input`). Output capped via Genkit `config: { maxOutputTokens: 600 }`.

### 3.3 Genkit flow

`ai.ts`:
```
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
// Key passed explicitly so the env var name is unambiguous. The plugin would
// otherwise default to GEMINI_API_KEY / GOOGLE_API_KEY.
export const ai = genkit({ plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })] });
export const MODEL = googleAI.model("gemini-2.5-flash");
```
`ask.ts` calls `ai.generate({ model: MODEL, system: SYSTEM_PROMPT, messages, config })`.
(Exact Genkit API surface verified against installed version during implementation; if
the message format differs, adapt in `buildPrompt.ts` — the handler stays thin.)

### 3.4 Persona + guardrails (`persona.ts`)

`SYSTEM_PROMPT` instructs the model to:
- Answer only as/about Alex, using the PERSONA facts; never invent facts not present.
- For off-topic or unknown questions, say so plainly and redirect to what it can answer.
  Never blame the visitor.
- Keep replies concise, friendly, first/third person consistent.
- No em dashes or colons in prose (house style).

`PERSONA` is a structured plain-text block (role, years, focus, notable projects,
stack, location, availability, contact preference). Placeholder content shipped; owner
replaces with real details.

## 4. Frontend widget (`AskAI.tsx`)

State: `open`, `messages`, `status` (`idle | sending | error`), `input`, `errorMsg`.

Behavior:
- Trigger: fixed pill button, bottom-right, safe-area inset, thumb-reachable on mobile.
  Shadow, no border.
- Panel: card (shadow, no border, rounded). Header with short title + close. Scrollable
  message list. On first open shows 2-3 suggested starter chips that prefill+send.
- Input row: real `<label>` ("Ask a question"), boxed input (shadow not underline),
  placeholder is a hint only, send button with generous side padding.
- Sending: append user message, show **skeleton typing dots** (not a spinner), call
  `askAI()`, append `model` reply.
- Long replies (4+ lines) left-aligned.
- Respects `useReducedMotion` for open/close animation (consistent with existing motion).
- Uses `createPortal` to body (same pattern as `SkillFolder`) so it escapes any
  transformed/overflow-hidden ancestor.

Copy: no em dashes, no colons, action verbs on the button.

## 5. Error handling

| Case | UX |
|------|----|
| Empty / too-long input | Inline hint under the field, no send. |
| Network / function down (`upstream`/`server`) | Message bubble: what failed + a Retry button. |
| Rate limited / quota (`rate_limited`) | "Lots of questions right now, try again in a moment." |
| Malformed response | Generic friendly fallback + Retry. |

No case blames the visitor. Each says where and why it failed.

## 6. Security / abuse

- API key only in Netlify env (`GOOGLE_GENAI_API_KEY`); never in client bundle.
- Input length + history caps (section 3.2). Output token cap.
- CORS: function allows same-origin only.
- Soft throttle v1: reject bursts via a short in-memory window per warm instance, plus
  output caps. NOTE: durable per-IP rate limiting needs a store (Upstash Redis) — listed
  as a follow-up, not built in v1. This limit is logged, not silently dropped.

## 7. Testing / verification

- **Unit:** `buildPrompt.test.ts` — persona injected, history mapped, caps enforced.
  Runs without network/model (pure function). (Adds a test runner — `vitest` — as dev dep,
  since the repo currently has none.)
- **Local integration:** `netlify dev`, POST `/api/ask` with a sample question, assert a
  200 `{reply}` (requires a real `GOOGLE_GENAI_API_KEY`).
- **Frontend:** `tsc -b && vite build` clean; lint clean on new files; CDP screenshot of
  the open panel; one live Q&A round end to end.
- **Honest dependency:** live model calls need the owner's Google AI Studio key. Without
  it, only the unit test + UI (with a mocked reply) are verifiable.

## 8. Scope guard

Only the new files in 3.1 plus the single `App.tsx` mount and `package.json` deps.
No changes to Hero, About, Works, Contact, cursor, aurora, ticker, or other domains.

## 9. Out of scope (v1)

Streaming responses, durable rate limiting (Upstash), analytics on questions, multi-language,
auth, persisting conversations, voice. Each is an additive follow-up.

## 10. Open items resolved by defaults

- Model `gemini-2.5-flash` (fast, cheap). Swap by editing `ai.ts`.
- Non-streaming v1.
- Persona ships with placeholder text for the owner to fill.
