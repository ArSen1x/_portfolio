import type { Context } from "@netlify/functions";
import { ai, MODEL, GENERATE_CONFIG } from "./ai";
import { SYSTEM_PROMPT } from "./persona";
import { validateRequest, toGenkitMessages, type ErrorCode } from "./buildPrompt";

// Netlify Functions 2.0: filename + config.path route this to /api/ask.
export const config = { path: "/api/ask" };

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function fail(error: string, code: ErrorCode, status: number) {
  return json({ error, code }, status);
}

// Best effort burst guard for a warm instance. Durable per IP limiting needs a
// shared store (Upstash) and is a documented follow up, not built here.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
function throttled(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method !== "POST") {
    return fail("Send your question with a POST request.", "bad_input", 405);
  }

  const ip = context.ip || "unknown";
  if (throttled(ip, Date.now())) {
    return fail("Lots of questions right now. Try again in a moment.", "rate_limited", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("The request body was not valid JSON.", "bad_input", 400);
  }

  const valid = validateRequest(body);
  if (!valid.ok) return fail(valid.error, valid.code, 400);

  try {
    const res = await ai.generate({
      model: MODEL,
      system: SYSTEM_PROMPT,
      messages: toGenkitMessages(valid.messages),
      config: GENERATE_CONFIG,
    });
    const reply = res.text.trim();
    if (!reply) {
      return fail("No answer came back. Please try again.", "upstream", 502);
    }
    return json({ reply }, 200);
  } catch (err) {
    console.error("ask.ts generate failed", err);
    return fail("The assistant is unavailable right now. Please try again.", "upstream", 502);
  }
};
