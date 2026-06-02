import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Check } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { PillButton } from "@/components/PillButton";
import { ContactGlobe } from "@/components/ContactGlobe";
import { SectionReveal } from "@/components/SectionReveal";

type FormState = "idle" | "sending" | "sent";

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    setTimeout(() => {
      setFormState("sent");
      setTimeout(() => setFormState("idle"), 2000);
    }, 1500);
  };

  const inputClasses =
    "w-full bg-transparent border border-white/[0.08] rounded-xl px-4 py-3 text-text-primary font-body text-[15px] placeholder:text-text-tertiary focus:outline-none focus:border-accent-glow/40 focus:ring-2 focus:ring-accent-glow/10 transition-all duration-200";

  return (
    <SectionReveal className="col-span-1 md:col-span-2">
      <BentoCard className="h-full">
        <div className="mb-6">
          <h2
            className="font-display font-bold text-text-primary tracking-[-0.03em]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >
            Let's work together
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Name" required className={inputClasses} />
          <input type="email" placeholder="Email" required className={inputClasses} />
          <textarea
            placeholder="Your project..."
            rows={3}
            required
            className={`${inputClasses} resize-none`}
          />

          <AnimatePresence mode="wait">
            {formState === "idle" && (
              <motion.div key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PillButton type="submit" variant="primary" fullWidth icon={<Send size={14} />}>
                  Send
                </PillButton>
              </motion.div>
            )}
            {formState === "sending" && (
              <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PillButton type="button" variant="outline" fullWidth disabled>
                  Sending...
                </PillButton>
              </motion.div>
            )}
            {formState === "sent" && (
              <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PillButton type="button" variant="accent" fullWidth icon={<Check size={14} />}>
                  Sent!
                </PillButton>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </BentoCard>
    </SectionReveal>
  );
}

export function ContactGlobeCard() {
  return (
    <SectionReveal className="col-span-1">
      <BentoCard className="h-full flex flex-col justify-between overflow-hidden relative min-h-[250px]">
        <span className="text-caption text-text-tertiary z-10">Location</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <ContactGlobe />
        </div>
        <div className="z-10">
          <p className="text-text-secondary italic text-sm">— Alex Rivera</p>
          <p className="text-text-tertiary text-[10px] uppercase mt-1">San Francisco, CA</p>
        </div>
      </BentoCard>
    </SectionReveal>
  );
}
