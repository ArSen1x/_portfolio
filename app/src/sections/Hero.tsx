import { motion } from "framer-motion";
import { BentoCard } from "@/components/BentoCard";
import { TypewriterHero } from "@/components/TypewriterHero";
import { SectionReveal } from "@/components/SectionReveal";

export function Hero() {
  return (
    <SectionReveal>
      <BentoCard className="col-span-1 md:col-span-2 row-span-2 relative min-h-[380px] md:min-h-[420px] flex flex-col justify-between">
        {/* Profile Photo */}
        <motion.div
          className="absolute top-6 right-6"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="w-[72px] h-[72px] rounded-full border-2 border-white/[0.08] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
              alt="Alex Rivera"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div>
          <p className="text-body-small text-text-tertiary mb-2 font-body">
            Hi, I'm Alex
          </p>
          <h1
            className="font-display font-bold text-text-primary leading-[0.95] tracking-[-0.04em]"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            Designer
            <br />
            Developer
            <span className="text-accent-glow">.</span>
          </h1>
          <div
            className="mt-3 font-display font-medium text-text-secondary"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
          >
            I <TypewriterHero />
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
            <span className="text-caption text-text-tertiary">Available for work</span>
          </div>
          <span className="text-caption text-text-tertiary">San Francisco</span>
        </div>
      </BentoCard>
    </SectionReveal>
  );
}
