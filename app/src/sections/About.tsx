import { motion, animate } from "framer-motion";
import { useRef, useState } from "react";
import { BentoCard } from "@/components/BentoCard";
import { ScrollHighlight } from "@/components/ScrollHighlight";
import { SectionReveal } from "@/components/SectionReveal";

const stats = [
  { value: "5+", numericValue: 5, label: "Years Experience" },
  { value: "40+", numericValue: 40, label: "Projects Shipped" },
  { value: "12", numericValue: 12, label: "Happy Clients" },
];

function StatCounter({ value, numericValue, label }: { value: string; numericValue: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onViewportEnter={() => {
        if (hasAnimated) return;
        setHasAnimated(true);
        const controls = animate(0, numericValue, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate: (v) => setDisplayValue(Math.round(v)),
        });
        return () => controls.stop();
      }}
    >
      <span
        className="font-display font-bold text-text-primary"
        style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.04em", lineHeight: 1 }}
      >
        {displayValue}{value.includes("+") ? "+" : ""}
      </span>
      <span className="text-caption text-text-tertiary mt-1">{label}</span>
    </motion.div>
  );
}

export function About() {
  return (
    <div id="about" className="col-span-1 md:col-span-2">
      <SectionReveal>
        <BentoCard className="h-full flex flex-col justify-between">
          <div>
            <span className="text-caption text-text-tertiary mb-6 block">About</span>
            <ScrollHighlight
              text="I design and build digital experiences that feel inevitable — interfaces so intuitive they disappear, motion so purposeful it tells a story, and systems so robust they scale without breaking a sweat."
              className="text-text-primary"
            />
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-8 md:gap-10 mt-10 pt-6 border-t border-divider">
            {stats.map((stat) => (
              <StatCounter key={stat.label} {...stat} />
            ))}
          </div>
        </BentoCard>
      </SectionReveal>
    </div>
  );
}
