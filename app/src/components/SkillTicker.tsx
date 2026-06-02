import { motion, useMotionValue, useAnimationFrame, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

interface SkillTickerProps {
  items?: string[];
  speed?: number;
  className?: string;
}

export function SkillTicker({
  items = [
    "React",
    "TypeScript",
    "Node.js",
    "Figma",
    "Three.js",
    "PostgreSQL",
    "Docker",
    "Next.js",
    "Tailwind",
    "GraphQL",
    "AWS",
    "Python",
  ],
  speed = 50,
  className = "",
}: SkillTickerProps) {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  // Use a ref for hovered so the animation frame closure always reads the latest value
  const hoveredRef = useRef(false);
  const [, setHoveredState] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion) return;
    const track = trackRef.current;
    if (!track) return;
    // half = width of one copy; guard against 0 before DOM is measured
    const oneCopyWidth = track.scrollWidth / 2;
    if (oneCopyWidth === 0) return;
    const speedMultiplier = hoveredRef.current ? 0.5 : 1;
    const newX = x.get() - (speed * speedMultiplier * delta) / 1000;
    // Seamless wrap: when we've scrolled one full copy, reset without a visible jump
    x.set(newX <= -oneCopyWidth ? newX + oneCopyWidth : newX);
  });

  const handlePointerEnter = () => {
    hoveredRef.current = true;
    setHoveredState(true);
  };
  const handlePointerLeave = () => {
    hoveredRef.current = false;
    setHoveredState(false);
  };

  // Each copy is self-contained: items interleaved with separators AND a trailing
  // separator so that when copy A is immediately followed by copy B the cadence
  // at the seam is identical to every interior gap. This makes both copies
  // byte-identical and ensures scrollWidth / 2 == exact per-copy wrap distance.
  const buildRow = (keyPrefix: string) =>
    items.reduce((acc, item, i) => {
      acc.push(
        <span
          key={`${keyPrefix}-${i}`}
          className="font-mono text-xs text-text-tertiary whitespace-nowrap shrink-0"
        >
          {item}
        </span>
      );
      // Always push a separator — including after the last item (trailing sep)
      acc.push(<span key={`${keyPrefix}-sep-${i}`} className="inline-block w-1 h-1 rotate-45 bg-text-tertiary/50 shrink-0 mx-6 self-center" />);
      return acc;
    }, [] as React.ReactNode[]);

  // Static render for users who prefer reduced motion
  if (shouldReduceMotion) {
    return (
      <div className={`overflow-hidden w-full mask-edge-fade ${className}`}>
        <div className="flex items-center gap-0 w-max">
          {buildRow("static")}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`overflow-hidden w-full mask-edge-fade ${className}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        ref={trackRef}
        className="flex items-center gap-0 w-max"
        style={{ x }}
      >
        {/* Two identical, self-contained copies. Each ends with a trailing
            separator so the cadence at the wrap seam matches every interior gap.
            scrollWidth / 2 == exact per-copy width == true wrap distance. */}
        {buildRow("a")}
        {buildRow("b")}
      </motion.div>
    </motion.div>
  );
}
