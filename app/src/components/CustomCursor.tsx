import { useEffect, useRef, useState } from "react";
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
  | { variant: "magnetic"; el: HTMLElement; rect: DOMRect };

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
  // Tracks the currently-hovered magnetic element so the scroll listener can refresh its rect.
  const magnetEl = useRef<HTMLElement | null>(null);

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
        magnetEl.current = el;
        // Bail out if we're already tracking this exact element to avoid re-renders.
        setState((s) =>
          s.variant === "magnetic" && s.el === el ? s : { variant: "magnetic", el, rect }
        );
        return;
      }

      magnetEl.current = null;
      x.set(e.clientX);
      y.set(e.clientY);
      if (el) {
        // data-cursor attribute value is currently only used as a label fallback;
        // visuals are driven by the label/magnetic distinction, not the attribute value.
        const v = el.getAttribute("data-cursor") ?? "";
        const label = el.getAttribute("data-cursor-label") ?? v;
        // Bail out when the label hasn't changed to avoid a re-render on every move.
        setState((s) =>
          s.variant === "label" && s.label === label ? s : { variant: "label", label }
        );
      } else {
        setState((s) => (s.variant === "default" ? s : { variant: "default" }));
      }
    }

    // Recompute the magnetic rect on scroll so the overlay doesn't freeze if the
    // user scrolls without moving the mouse. capture:true catches Lenis / inner containers.
    function onScroll() {
      const el = magnetEl.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      x.set(rect.left + rect.width / 2);
      y.set(rect.top + rect.height / 2);
      setState((s) => (s.variant === "magnetic" ? { variant: "magnetic", el, rect } : s));
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
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
