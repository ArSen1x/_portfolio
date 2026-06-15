import { describe, it, expect } from "vitest";
import {
  validateRequest,
  toGenkitMessages,
  MAX_INPUT_CHARS,
  MAX_MESSAGES,
  type ChatMessage,
} from "./buildPrompt";

const userMsg = (content: string): ChatMessage => ({ role: "user", content });

describe("validateRequest", () => {
  it("accepts a single valid user question", () => {
    const r = validateRequest({ messages: [userMsg("What is Alex's stack?")] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.messages).toHaveLength(1);
  });

  it("accepts a valid user/model/user history", () => {
    const r = validateRequest({
      messages: [
        userMsg("Hi"),
        { role: "model", content: "Hello, ask me anything about Alex." },
        userMsg("Recent projects?"),
      ],
    });
    expect(r.ok).toBe(true);
  });

  // --- edge cases ---
  it("rejects a non-object body", () => {
    expect(validateRequest("nope")).toMatchObject({ ok: false, code: "bad_input" });
    expect(validateRequest(null)).toMatchObject({ ok: false, code: "bad_input" });
  });

  it("rejects missing or empty messages array", () => {
    expect(validateRequest({})).toMatchObject({ ok: false, code: "bad_input" });
    expect(validateRequest({ messages: [] })).toMatchObject({ ok: false, code: "bad_input" });
  });

  it("rejects history longer than MAX_MESSAGES", () => {
    const many = Array.from({ length: MAX_MESSAGES + 1 }, () => userMsg("x"));
    expect(validateRequest({ messages: many })).toMatchObject({ ok: false, code: "bad_input" });
  });

  it("rejects an unknown role or non-string content", () => {
    expect(validateRequest({ messages: [{ role: "system", content: "x" }] })).toMatchObject({
      ok: false,
    });
    expect(validateRequest({ messages: [{ role: "user", content: 42 }] })).toMatchObject({
      ok: false,
    });
  });

  it("rejects when the last message is not from the user", () => {
    const r = validateRequest({
      messages: [userMsg("Hi"), { role: "model", content: "Hello" }],
    });
    expect(r).toMatchObject({ ok: false, code: "bad_input" });
  });

  it("rejects whitespace-only input", () => {
    expect(validateRequest({ messages: [userMsg("   \n  ")] })).toMatchObject({ ok: false });
  });

  it("rejects input over the character cap but accepts at the boundary", () => {
    expect(validateRequest({ messages: [userMsg("a".repeat(MAX_INPUT_CHARS + 1))] })).toMatchObject(
      { ok: false, code: "bad_input" }
    );
    expect(validateRequest({ messages: [userMsg("a".repeat(MAX_INPUT_CHARS))] }).ok).toBe(true);
  });

  it("never returns a blaming message", () => {
    const r = validateRequest({ messages: [] });
    if (!r.ok) {
      expect(r.error.toLowerCase()).not.toMatch(/you (failed|did|broke|are wrong)/);
    }
  });
});

describe("toGenkitMessages", () => {
  it("maps content strings into Genkit part arrays preserving role and order", () => {
    const out = toGenkitMessages([userMsg("Q1"), { role: "model", content: "A1" }]);
    expect(out).toEqual([
      { role: "user", content: [{ text: "Q1" }] },
      { role: "model", content: [{ text: "A1" }] },
    ]);
  });
});
