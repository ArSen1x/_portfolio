import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

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
  const blur = useTransform(progress, range, ["blur(4px)", "blur(0px)"]);
  return (
    <motion.span aria-hidden="true" className="mr-[0.28em]" style={{ opacity, filter: blur }}>
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
      aria-label={text}
      className={cn(
        // Defaults for standalone use; caller's className (size/leading/weight)
        // wins via twMerge. No inline fontSize — it would override the caller and
        // leave line-height mismatched (40px glyphs in a 28px line => overlap).
        "font-display font-semibold leading-[1.4] max-w-[680px] flex flex-wrap text-2xl md:text-4xl",
        className
      )}
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
