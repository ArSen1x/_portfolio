import { motion, AnimatePresence, type Variants } from "motion/react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft } from "lucide-react";

type Skill = { name: string; color: string };
type Category = { id: string; label: string; skills: Skill[] };

const categories: Category[] = [
  {
    id: "developer",
    label: "Developer",
    skills: [
      { name: "React", color: "#61DAFB" },
      { name: "TypeScript", color: "#3178C6" },
      { name: "Node.js", color: "#339933" },
      { name: "Next.js", color: "#FFFFFF" },
      { name: "Three.js", color: "#FFFFFF" },
      { name: "Postgres", color: "#336791" },
      { name: "Git", color: "#F05032" },
    ],
  },
  {
    id: "designer",
    label: "Designer",
    skills: [
      { name: "Figma", color: "#F24E1E" },
      { name: "Framer", color: "#0055FF" },
      { name: "Tailwind", color: "#06B6D4" },
    ],
  },
];

const swatch = (color: string) =>
  color === "#FFFFFF" ? "linear-gradient(135deg, #fff 0%, #d1d1d1 100%)" : color;

// Label-based so the staggered itemVariants children actually receive "show".
// Slide direction differs per level (categories from left, tech from right).
const catVariants: Variants = {
  hidden: { opacity: 0, x: -24, transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  show: { opacity: 1, x: 0, transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};
const techVariants: Variants = {
  hidden: { opacity: 0, x: 24, transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  show: { opacity: 1, x: 0, transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// Mini 3x3 cluster used as a folder icon (preview tile + category tiles).
function IconCluster({ skills, size }: { skills: Skill[]; size: "sm" | "lg" }) {
  const gap = size === "sm" ? "gap-1" : "gap-1.5";
  return (
    <div className={`grid grid-cols-3 ${gap} w-full aspect-square`}>
      {Array.from({ length: 9 }).map((_, i) => {
        const s = skills[i];
        return (
          <div
            key={i}
            className="rounded-[4px] w-full h-full"
            style={{ background: s ? swatch(s.color) : "rgba(255,255,255,0.05)" }}
          />
        );
      })}
    </div>
  );
}

const previewSkills = categories.flatMap((c) => c.skills).slice(0, 9);

export function SkillFolder() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = categories.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeId) setActiveId(null);
      else setOpen(false);
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, activeId]);

  const close = () => setOpen(false);

  return (
    <>
      {/* Folder preview (lives inside the bento card) */}
      <motion.div
        layoutId="folder-bg"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open skills folder"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
        className="w-20 h-20 rounded-[22px] bg-white/[0.08] backdrop-blur-xl border border-white/[0.05] p-3 cursor-pointer flex items-center justify-center shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconCluster skills={previewSkills} size="sm" />
      </motion.div>

      {createPortal(
        <AnimatePresence onExitComplete={() => setActiveId(null)}>
          {open && (
            <motion.div
              key="skill-overlay"
              className="fixed inset-0 z-[100] flex items-center justify-center p-6"
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={close}
                className="absolute inset-0 bg-black/40 backdrop-blur-2xl"
              />

              {/* Expanded folder; height animates between levels via layout */}
              <motion.div
                layout
                layoutId="folder-bg"
                className="relative w-full max-w-[360px] bg-white/[0.1] backdrop-blur-3xl rounded-[38px] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/[0.1] flex flex-col"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header: title at root, back affordance inside a category */}
                <div className="flex items-center justify-between mb-7 h-6">
                  <AnimatePresence mode="wait" initial={false}>
                    {active ? (
                      <motion.button
                        key="back"
                        onClick={() => setActiveId(null)}
                        aria-label="Back to categories"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="flex items-center gap-1 text-text-primary font-display font-semibold text-xl -ml-1"
                      >
                        <ChevronLeft size={20} className="text-text-secondary" />
                        {active.label}
                      </motion.button>
                    ) : (
                      <motion.h3
                        key="title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-text-primary font-display font-semibold text-xl"
                      >
                        Skills
                      </motion.h3>
                    )}
                  </AnimatePresence>
                </div>

                {/* Levels */}
                <AnimatePresence mode="wait" initial={false}>
                  {active === null ? (
                    <motion.div
                      key="categories"
                      variants={catVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="grid grid-cols-2 gap-5"
                    >
                      {categories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          variants={itemVariants}
                          onClick={() => setActiveId(cat.id)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className="flex flex-col items-center gap-3 group"
                        >
                          <div className="w-full rounded-3xl bg-white/[0.06] p-4 shadow-lg">
                            <IconCluster skills={cat.skills} size="lg" />
                          </div>
                          <span className="text-[12px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                            {cat.label}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={active.id}
                      variants={techVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="grid grid-cols-3 gap-x-6 gap-y-7 justify-items-center"
                    >
                      {active.skills.map((skill) => (
                        <motion.div
                          key={skill.name}
                          variants={itemVariants}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-14 h-14 rounded-2xl shadow-lg"
                            style={{ background: swatch(skill.color), boxShadow: `0 8px 20px ${skill.color}20` }}
                          />
                          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                            {skill.name}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={close}
                  className="mt-9 text-[10px] uppercase tracking-[0.2em] text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
