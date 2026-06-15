// Pure, model-free request validation + message mapping. Unit tested in isolation.

export const MAX_INPUT_CHARS = 1000;
export const MAX_MESSAGES = 20;

export type ChatRole = "user" | "model";
export type ChatMessage = { role: ChatRole; content: string };

export type ErrorCode = "bad_input" | "rate_limited" | "upstream" | "server";

export type ValidateResult =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; code: ErrorCode; error: string };

// Genkit MessageData shape: { role, content: [{ text }] }
export type GenkitMessage = { role: ChatRole; content: { text: string }[] };

function isMessage(m: unknown): m is ChatMessage {
  if (typeof m !== "object" || m === null) return false;
  const r = (m as Record<string, unknown>).role;
  const c = (m as Record<string, unknown>).content;
  return (r === "user" || r === "model") && typeof c === "string";
}

export function validateRequest(body: unknown): ValidateResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, code: "bad_input", error: "The request body was not valid." };
  }
  const messages = (body as Record<string, unknown>).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, code: "bad_input", error: "Add a question to get an answer." };
  }
  if (messages.length > MAX_MESSAGES) {
    return {
      ok: false,
      code: "bad_input",
      error: "This conversation is long. Start a new one to keep going.",
    };
  }
  if (!messages.every(isMessage)) {
    return { ok: false, code: "bad_input", error: "One of the messages was not readable." };
  }
  const last = messages[messages.length - 1] as ChatMessage;
  if (last.role !== "user") {
    return { ok: false, code: "bad_input", error: "The last message should be a question." };
  }
  const trimmed = last.content.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: "bad_input", error: "Type a question first." };
  }
  if (trimmed.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      code: "bad_input",
      error: `Keep questions under ${MAX_INPUT_CHARS} characters.`,
    };
  }
  return { ok: true, messages: messages as ChatMessage[] };
}

export function toGenkitMessages(messages: ChatMessage[]): GenkitMessage[] {
  return messages.map((m) => ({ role: m.role, content: [{ text: m.content }] }));
}
