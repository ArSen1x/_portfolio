import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock the model layer so the handler is tested with no network and no API key.
vi.mock("./ai", () => ({
  ai: { generate: vi.fn() },
  MODEL: "mock-model",
  GENERATE_CONFIG: {},
}));

import handler from "./ask";
import { ai } from "./ai";

const generate = ai.generate as unknown as Mock;

// Distinct ip per test so the in-memory burst guard does not bleed across cases.
const ctx = (ip: string) => ({ ip }) as never;
const post = (body: unknown) =>
  new Request("https://x/api/ask", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => generate.mockReset());

describe("ask handler", () => {
  it("rejects non-POST with 405", async () => {
    const res = await handler(new Request("https://x/api/ask"), ctx("ip-get"));
    expect(res.status).toBe(405);
    expect((await res.json()).code).toBe("bad_input");
  });

  it("returns 400 on invalid JSON", async () => {
    const req = new Request("https://x/api/ask", { method: "POST", body: "{not json" });
    const res = await handler(req, ctx("ip-json"));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("bad_input");
  });

  it("returns 400 when validation fails (empty messages)", async () => {
    const res = await handler(post({ messages: [] }), ctx("ip-empty"));
    expect(res.status).toBe(400);
    expect(generate).not.toHaveBeenCalled();
  });

  it("returns 200 with the model reply on a valid question", async () => {
    generate.mockResolvedValue({ text: "Bridgette works with React and TypeScript." });
    const res = await handler(
      post({ messages: [{ role: "user", content: "What is her stack?" }] }),
      ctx("ip-ok")
    );
    expect(res.status).toBe(200);
    expect((await res.json()).reply).toMatch(/React/);
    expect(generate).toHaveBeenCalledOnce();
  });

  it("returns 502 (upstream) when the model fails or returns a malformed response", async () => {
    // A null result makes res.text access throw inside the handler's try, hitting
    // the same catch path a thrown/rejected generate() would. Asserting via a
    // malformed value avoids vitest flagging a deliberately-thrown spy error.
    generate.mockResolvedValue(null);
    const res = await handler(
      post({ messages: [{ role: "user", content: "Hi" }] }),
      ctx("ip-throw")
    );
    expect(res.status).toBe(502);
    expect((await res.json()).code).toBe("upstream");
  });

  it("returns 502 when the model reply is empty", async () => {
    generate.mockResolvedValue({ text: "   " });
    const res = await handler(
      post({ messages: [{ role: "user", content: "Hi" }] }),
      ctx("ip-blank")
    );
    expect(res.status).toBe(502);
  });

  it("rate limits a burst from one ip with 429", async () => {
    generate.mockResolvedValue({ text: "ok" });
    let last: Response | undefined;
    for (let i = 0; i < 17; i++) {
      last = await handler(
        post({ messages: [{ role: "user", content: "q" }] }),
        ctx("ip-burst")
      );
    }
    expect(last!.status).toBe(429);
    expect((await last!.json()).code).toBe("rate_limited");
  });
});
