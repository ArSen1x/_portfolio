import { motion } from "framer-motion";
import { Download, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { PillButton } from "@/components/PillButton";
import { SectionReveal } from "@/components/SectionReveal";

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:alex@example.com", label: "Email" },
];

export function QuickLinks() {
  return (
    <div className="col-span-1 row-span-2 flex flex-col gap-3">
      {/* Resume Card */}
      <SectionReveal>
        <BentoCard padding="small" className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <Download size={24} className="text-text-primary" />
          <div>
            <h3 className="font-display font-medium text-text-primary text-lg">Resume</h3>
            <p className="text-caption text-text-tertiary mt-0.5">PDF, 2.4MB</p>
          </div>
          <PillButton
            variant="outline"
            icon={<Download size={14} />}
            className="text-xs px-4 py-2"
            onClick={() => {
              const a = document.createElement("a");
              a.href = "/resume.pdf";
              a.download = "Alex-Rivera-Resume.pdf";
              a.click();
            }}
          >
            Download
          </PillButton>
        </BentoCard>
      </SectionReveal>

      {/* Social Card */}
      <SectionReveal>
        <BentoCard padding="small" className="flex-1 flex items-center justify-around">
          {socialLinks.map((social) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors duration-200"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.04)" }}
              whileTap={{ scale: 0.95 }}
              aria-label={social.label}
            >
              <social.icon size={20} />
            </motion.a>
          ))}
        </BentoCard>
      </SectionReveal>
    </div>
  );
}
