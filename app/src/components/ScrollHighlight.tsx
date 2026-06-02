import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function HighlightWord({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span className="mr-[0.28em]" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

interface ScrollHighlightProps {
  text?: string;
  className?: string;
}

export function ScrollHighlight({
  text = "I design and build digital experiences that feel inevitable — interfaces so intuitive they disappear, motion so purposeful it tells a story, and systems so robust they scale without breaking a sweat.",
  className = "",
}: ScrollHighlightProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={`font-display font-semibold leading-[1.4] max-w-[680px] flex flex-wrap ${className}`}
      style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
    >
      {words.map((w, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return (
          <HighlightWord key={i} progress={scrollYProgress} range={[start, end]}>
            {w}
          </HighlightWord>
        );
      })}
    </p>
  );
}
