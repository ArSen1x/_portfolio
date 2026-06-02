import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { CSSProperties } from "react";

type CursorState =
  | { variant: "default" }
  | { variant: "label"; label: string }
  | { variant: "magnetic"; rect: DOMRect };

const FOLLOW = { stiffness: 500, damping: 40, mass: 0.6 };
const MAGNET = { stiffness: 350, damping: 35, mass: 0.8 };

export function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>({ variant: "default" });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const fx = useSpring(x, FOLLOW);
  const fy = useSpring(y, FOLLOW);

  useEffect(() => {
    if (reduce) {
      setEnabled(false);
      return;
    }
    setEnabled(!window.matchMedia("(pointer: coarse)").matches);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    document.body.style.cursor = "none";

    function onMove(e: PointerEvent) {
      const el = (e.target as Element | null)?.closest?.(
        "[data-cursor],[data-cursor-magnetic]"
      ) as HTMLElement | null;

      if (el?.hasAttribute("data-cursor-magnetic")) {
        const rect = el.getBoundingClientRect();
        x.set(rect.left + rect.width / 2);
        y.set(rect.top + rect.height / 2);
        setState({ variant: "magnetic", rect });
        return;
      }

      x.set(e.clientX);
      y.set(e.clientY);
      if (el) {
        const v = el.getAttribute("data-cursor") ?? "";
        const label = el.getAttribute("data-cursor-label") ?? v;
        setState({ variant: "label", label });
      } else {
        setState((s) => (s.variant === "default" ? s : { variant: "default" }));
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.body.style.cursor = "";
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const inner =
    state.variant === "magnetic"
      ? {
          width: state.rect.width,
          height: state.rect.height,
          borderRadius: 14,
          opacity: 0.2,
        }
      : state.variant === "label"
      ? { width: "auto", height: 30, borderRadius: 999, opacity: 1 }
      : { width: 16, height: 16, borderRadius: 999, opacity: 1 };

  const blendStyle: CSSProperties = {
    mixBlendMode: state.variant === "label" ? "normal" : "difference",
  };

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x: fx, y: fy }}
    >
      <motion.div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white text-xs font-medium text-obsidian${state.variant === "label" ? " px-3" : ""}`}
        style={blendStyle}
        animate={inner}
        transition={state.variant === "magnetic" ? MAGNET : FOLLOW}
      >
        <AnimatePresence mode="wait">
          {state.variant === "label" && state.label && (
            <motion.span
              key={state.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              {state.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
