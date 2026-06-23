export type ChatRole = "user" | "model";
export type ChatMessage = { role: ChatRole; content: string };

export type AskResult =
  | { ok: true; reply: string }
  | { ok: false; error: string };

const ENDPOINT = "/api/ask";

// Sends the full client-side history and returns either a reply or a friendly,
// non-blaming error message. Network and server problems are normalized here so
// the widget only renders strings.
export async function askAI(messages: ChatMessage[]): Promise<AskResult> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    let data: { reply?: string; error?: string } = {};
    try {
      data = await res.json();
    } catch {
      // fall through to status based message
    }

    if (res.ok && data.reply) return { ok: true, reply: data.reply };

    if (data.error) return { ok: false, error: data.error };
    if (res.status === 429) {
      return { ok: false, error: "Lots of questions right now. Try again in a moment." };
    }
    return { ok: false, error: "Something went wrong on our side. Please try again." };
  } catch {
    return { ok: false, error: "Could not reach the assistant. Check your connection and retry." };
  }
}
