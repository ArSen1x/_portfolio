import { motion } from "motion/react";
import { BentoCard } from "@/components/BentoCard";
import { TypewriterHero } from "@/components/TypewriterHero";
import { SectionReveal } from "@/components/SectionReveal";

export function Hero() {
  return (
    <SectionReveal className="md:col-span-2 md:row-span-2">
      <BentoCard className="h-full relative min-h-[380px] md:min-h-[420px] flex flex-col justify-between">
        {/* Profile Photo */}
        <motion.div
          className="absolute top-6 right-6"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Change this into my logo */}
          <div className="w-[72px] h-[72px] rounded-full border-2 border-white/[0.08] overflow-hidden">
            <img
              src="src/public/bridgette.JPG"
              alt="Bridgette Manliguez"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-body-small text-text-tertiary mb-3 font-body">
            Hi, I'm Bridgette
          </p>
          <h1
            className="font-display font-bold text-text-primary leading-[0.9] tracking-[-0.05em] mb-4"
            style={{ fontSize: "clamp(2.75rem, 8vw, 6.5rem)" }}
          >
            Designer &
            <br />
            Software Developer
            <span className="text-accent-glow">.</span>
          </h1>
          <div
            className="font-display font-medium text-text-secondary leading-none h-[1.2em] flex items-end"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            <span>I&nbsp;</span>
            <TypewriterHero />
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-accent-teal"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-caption text-text-tertiary">Open for Projects</span>
          </div>
          <span className="text-caption text-text-tertiary">Philippines</span>
        </div>
      </BentoCard>
    </SectionReveal>
  );
}
