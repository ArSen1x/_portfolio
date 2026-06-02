import { motion, useMotionValue, useAnimationFrame } from "motion/react";
import { useRef, useState } from "react";

function loop(v: number, min: number, max: number) {
  const range = max - min;
  return min + ((((v - min) % range) + range) % range);
}

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
  const [hovered, setHovered] = useState(false);
  const currentSpeed = hovered ? speed * 0.5 : speed;

  useAnimationFrame((_, delta) => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    x.set(loop(x.get() - (currentSpeed * delta) / 1000, -half, 0));
  });

  const separator = (
    <span className="inline-block w-1 h-1 rotate-45 bg-text-tertiary/50 shrink-0 mx-6 self-center" />
  );

  const content = items.map((item, i) => (
    <span key={i} className="font-mono text-xs text-text-tertiary whitespace-nowrap shrink-0">
      {item}
    </span>
  ));

  return (
    <motion.div
      className={`overflow-hidden w-full mask-edge-fade ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        {content.reduce(
          (acc, item, i) => {
            acc.push(item);
            if (i < content.length - 1) acc.push(separator);
            return acc;
          },
          [] as React.ReactNode[]
        )}
        {separator}
        {content.reduce(
          (acc, item, i) => {
            acc.push(item);
            if (i < content.length - 1) acc.push(separator);
            return acc;
          },
          [] as React.ReactNode[]
        )}
      </motion.div>
    </motion.div>
  );
}
