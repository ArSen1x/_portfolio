import { useState } from "react";
import { motion, animate } from "motion/react";
import { BentoCard } from "@/components/BentoCard";
import { ScrollHighlight } from "@/components/ScrollHighlight";
import { SectionReveal } from "@/components/SectionReveal";

export function About() {
  return (
    <SectionReveal className="col-span-1 md:col-span-2">
      <BentoCard className="h-full flex flex-col justify-center min-h-[200px]">
        <span className="text-caption text-text-tertiary mb-4 block">About</span>
        <ScrollHighlight
          text="I design and build digital experiences that feel inevitable — interfaces so intuitive they disappear, motion so purposeful it tells a story, and systems so robust they scale without breaking a sweat."
          className="text-text-primary text-lg md:text-xl font-medium leading-relaxed"
        />
      </BentoCard>
    </SectionReveal>
  );
}

const stats = [
  { value: "5+", numericValue: 5, label: "Exp." },
  { value: "40+", numericValue: 40, label: "Projects" },
  { value: "12", numericValue: 12, label: "Clients" },
];

function StatCounter({ value, numericValue, label }: { value: string; numericValue: number; label: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        if (hasAnimated) return;
        setHasAnimated(true);
        animate(0, numericValue, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate: (v) => setDisplayValue(Math.round(v)),
        });
      }}
    >
      <span className="font-display font-bold text-text-primary text-2xl leading-none">
        {displayValue}{value.includes("+") ? "+" : ""}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-text-tertiary mt-1">{label}</span>
    </motion.div>
  );
}

export function Experience() {
  return (
    <SectionReveal className="col-span-1">
      <BentoCard className="h-full flex flex-col">
        <span className="text-caption text-text-tertiary mb-4 block">Stats</span>
        <div className="flex-1 flex flex-col justify-center gap-6">
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </div>
      </BentoCard>
    </SectionReveal>
  );
}
