import { useState, useEffect } from "react";
import { useReducedMotion } from "motion/react";

const TYPE_MIN = 55;   // ms per char (fast)
const TYPE_MAX = 110;  // ms per char (slow)
const DELETE_MS = 40;  // ms per char while deleting
const HOLD_MS = 1600;  // pause when a phrase is fully typed
const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a));

const DEFAULT_PHRASES = [
  "build interfaces.",
  "craft experiences.",
  "solve problems.",
  "ship products.",
];

interface TypewriterHeroProps {
  phrases?: string[];
}

export function TypewriterHero({ phrases = DEFAULT_PHRASES }: TypewriterHeroProps) {
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const current = phrases[index];

  useEffect(() => {
    // Reduced-motion: show first phrase in full, run no timers.
    if (prefersReduced) {
      setSub(phrases[0].length);
      return;
    }

    let id: ReturnType<typeof setTimeout>;

    if (!deleting && sub < current.length) {
      // Type one more character with randomised delay.
      id = setTimeout(() => setSub((s) => s + 1), rand(TYPE_MIN, TYPE_MAX));
    } else if (!deleting && sub === current.length) {
      // Phrase fully typed — hold, then start deleting.
      id = setTimeout(() => setDeleting(true), HOLD_MS);
    } else if (deleting && sub > 0) {
      // Delete one character.
      id = setTimeout(() => setSub((s) => s - 1), DELETE_MS);
    } else {
      // Done deleting — advance to next phrase.
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(id);
  }, [sub, deleting, current, index, phrases, prefersReduced]);

  const displayText = prefersReduced ? phrases[0] : current.slice(0, sub);

  return (
    <span className="inline-block min-h-[1.1em] min-w-[3ch] align-bottom">
      {displayText}
      {!prefersReduced && (
        <span
          className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-[-2px] animate-blink"
          aria-hidden
        />
      )}
    </span>
  );
}
