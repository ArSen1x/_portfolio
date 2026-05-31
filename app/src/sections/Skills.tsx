import { Code2, Server, Palette, Smartphone } from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { SkillFolder } from "@/components/SkillFolder";
import { SectionReveal } from "@/components/SectionReveal";

const skillIcons = [
  { icon: Code2, label: "Frontend" },
  { icon: Server, label: "Backend" },
  { icon: Palette, label: "Design" },
  { icon: Smartphone, label: "Mobile" },
];

export function Skills() {
  return (
    <div id="skills" className="col-span-1">
      <SectionReveal>
        <BentoCard className="h-full flex flex-col">
          <span className="text-caption text-text-tertiary mb-4 block">Skills</span>

          <div className="mb-4">
            <h2 className="font-display font-semibold text-text-primary text-xl md:text-2xl tracking-[-0.02em]">
              9 categories
            </h2>
            <p className="text-caption text-text-tertiary mt-1">Tap to explore</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <SkillFolder />

            {/* Skill Icons Row */}
            <div className="flex items-center gap-4 mt-2">
              {skillIcons.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="text-text-tertiary hover:text-text-secondary transition-colors"
                  title={label}
                >
                  <Icon size={20} />
                </div>
              ))}
            </div>
          </div>
        </BentoCard>
      </SectionReveal>
    </div>
  );
}
