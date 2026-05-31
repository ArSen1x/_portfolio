import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Clock, Shield, Heart } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { PillButton } from "@/components/PillButton";
import { ContactGlobe } from "@/components/ContactGlobe";
import { SectionReveal } from "@/components/SectionReveal";

type FormState = "idle" | "sending" | "sent";

export function Contact() {
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
    <div id="contact" className="col-span-1 md:col-span-3 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Contact Form Card */}
      <SectionReveal className="md:col-span-2">
        <BentoCard className="h-full">
          <div className="mb-6">
            <h2
              className="font-display font-bold text-text-primary tracking-[-0.03em]"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              Let's work together
            </h2>
            <p className="text-text-secondary text-[15px] leading-relaxed mt-2">
              Have a project in mind? I'd love to hear about it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <input
                type="text"
                placeholder="Your name"
                required
                className={inputClasses}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
            >
              <input
                type="email"
                placeholder="Your email"
                required
                className={inputClasses}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.26 }}
            >
              <textarea
                placeholder="Tell me about your project..."
                rows={4}
                required
                className={`${inputClasses} resize-none`}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.34 }}
            >
              <AnimatePresence mode="wait">
                {formState === "idle" && (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PillButton type="submit" variant="primary" fullWidth icon={<Send size={14} />}>
                      Send Message
                    </PillButton>
                  </motion.div>
                )}
                {formState === "sending" && (
                  <motion.div
                    key="sending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PillButton type="button" variant="outline" fullWidth disabled>
                      Sending...
                    </PillButton>
                  </motion.div>
                )}
                {formState === "sent" && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PillButton type="button" variant="accent" fullWidth icon={<Check size={14} />}>
                      Sent!
                    </PillButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </form>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-5 mt-6 pt-5 border-t border-divider">
            {[
              { icon: Clock, text: "Usually replies in 24h" },
              { icon: Shield, text: "Your data is secure" },
              { icon: Heart, text: "Open to collaborations" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-text-tertiary">
                <Icon size={12} />
                <span className="text-caption">{text}</span>
              </div>
            ))}
          </div>
        </BentoCard>
      </SectionReveal>

      {/* Sign-off Card */}
      <SectionReveal className="md:col-span-1">
        <BentoCard className="h-full flex flex-col justify-between">
          <div>
            <p className="font-display font-medium text-text-primary text-lg leading-relaxed">
              "Thanks for stopping by. I'm always excited to work on something meaningful. Let's create something great."
            </p>
            <p className="text-text-secondary italic mt-4 text-[15px]">— Alex</p>
          </div>
          <ContactGlobe />
        </BentoCard>
      </SectionReveal>
    </div>
  );
}
