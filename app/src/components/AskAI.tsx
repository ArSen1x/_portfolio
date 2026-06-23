import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MessageCircle, X, ArrowUp } from "lucide-react";
import { askAI, type ChatMessage } from "@/lib/askClient";

const STARTERS = ["What is her stack?", "Recent projects?", "Is she available for work?"];

export function AskAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hint, setHint] = useState("");
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q) {
      setHint("Type a question first.");
      return;
    }
    if (q.length > 1000) {
      setHint("Keep questions under 1000 characters.");
      return;
    }
    setHint("");
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setSending(true);
    const res = await askAI(next);
    setSending(false);
    setMessages([
      ...next,
      { role: "model", content: res.ok ? res.reply : res.error },
    ]);
  }

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ask-panel"
          className="fixed bottom-6 right-6 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-card bg-[#0d0d10] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
          style={{ maxHeight: "min(70vh, 560px)" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-text-primary">Ask about Bridgette</h2>
              <p className="text-caption text-text-tertiary">Powered by Gemini</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-full p-1.5 text-text-tertiary transition-colors hover:text-text-primary"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-2">
            {messages.length === 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-sm text-text-secondary">Ask me anything about Bridgette.</p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-xl bg-white/[0.04] px-3 py-2 text-left text-[13px] text-text-secondary shadow-sm transition-colors hover:bg-white/[0.07] hover:text-text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl bg-accent-glow/90 px-3.5 py-2 text-sm text-white shadow-sm"
                      : "max-w-[90%] rounded-2xl bg-white/[0.05] px-3.5 py-2 text-left text-sm leading-relaxed text-text-primary shadow-sm"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 rounded-2xl bg-white/[0.05] px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-text-tertiary"
                      animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="px-5 pb-5 pt-2"
          >
            <label htmlFor="ask-input" className="text-caption text-text-tertiary">
              Ask a question
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="ask-input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (hint) setHint("");
                }}
                placeholder="What would you like to know"
                className="min-w-0 flex-1 rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm text-text-primary shadow-inner outline-none placeholder:text-text-tertiary focus:bg-white/[0.07]"
              />
              <button
                type="submit"
                disabled={sending}
                aria-label="Send question"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-glow text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <ArrowUp size={18} />
              </button>
            </div>
            {hint && <p className="mt-1.5 text-[12px] text-accent-glow">{hint}</p>}
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label="Ask the AI about Alex"
        className="fixed bottom-6 right-6 z-[110] flex items-center gap-2 rounded-pill bg-white/[0.06] px-5 py-3 text-sm font-medium text-text-primary shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : "auto" }}
      >
        <MessageCircle size={18} className="text-accent-glow" />
        Ask me anything
      </motion.button>
      {createPortal(panel, document.body)}
    </>
  );
}
