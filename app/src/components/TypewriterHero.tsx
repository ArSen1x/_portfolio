import { useState, useEffect } from "react";

interface TypewriterHeroProps {
  phrases?: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
}

export function TypewriterHero({
  phrases = ["build interfaces.", "craft experiences.", "solve problems.", "ship products."],
  typeSpeed = 55,
  deleteSpeed = 35,
  pause = 1500,
}: TypewriterHeroProps) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const current = phrases[index];

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (!deleting && sub < current.length) {
      id = setTimeout(() => setSub(sub + 1), typeSpeed);
    } else if (!deleting && sub === current.length) {
      id = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && sub > 0) {
      id = setTimeout(() => setSub(sub - 1), deleteSpeed);
    } else {
      setDeleting(false);
      setIndex((index + 1) % phrases.length);
    }
    return () => clearTimeout(id);
  }, [sub, deleting, current, index, phrases.length, typeSpeed, deleteSpeed, pause]);

  return (
    <span className="inline-block min-h-[1.1em] min-w-[3ch] align-bottom">
      {current.slice(0, sub)}
      <span
        className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-[-2px] animate-blink"
        aria-hidden
      />
    </span>
  );
}
