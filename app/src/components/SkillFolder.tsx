import { motion, AnimatePresence, type Variants } from "motion/react";
import { useState, useEffect } from "react";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: { scale: 0.4, opacity: 0, transition: { duration: 0.15 } },
};

const skills = [
  { name: "React", color: "#61DAFB" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Node.js", color: "#339933" },
  { name: "Next.js", color: "#FFFFFF" },
  { name: "Tailwind", color: "#06B6D4" },
  { name: "Three.js", color: "#FFFFFF" },
  { name: "Figma", color: "#F24E1E" },
  { name: "Git", color: "#F05032" },
  { name: "Postgres", color: "#336791" },
];

export function SkillFolder() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* Folder Preview State */}
      <motion.div
        layoutId="folder-bg"
        onClick={() => setOpen(true)}
        className="w-20 h-20 rounded-[22px] bg-white/[0.08] backdrop-blur-xl border border-white/[0.05] p-3 cursor-pointer relative group flex items-center justify-center shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="grid grid-cols-3 gap-1.5 w-full aspect-square">
          {skills.slice(0, 9).map((skill) => (
            <motion.div
              key={skill.name}
              layoutId={`skill-icon-${skill.name}`}
              className="rounded-[4px] w-full h-full shadow-sm"
              style={{ 
                background: skill.color === "#FFFFFF" 
                  ? "linear-gradient(135deg, #fff 0%, #d1d1d1 100%)" 
                  : skill.color 
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Expanded State Overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/40"
            />

            {/* Expanded Folder */}
            <motion.div
              layoutId="folder-bg"
              className="relative w-full max-w-[340px] bg-white/[0.1] backdrop-blur-3xl rounded-[38px] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/[0.1] flex flex-col items-center"
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            >
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-text-primary font-display font-semibold text-xl mb-8"
              >
                Tech Stack
              </motion.h3>

              <motion.div
                className="grid grid-cols-3 gap-x-6 gap-y-8 w-full justify-items-center"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {skills.map((skill) => (
                  <motion.div
                    key={skill.name}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                    variants={itemVariants}
                  >
                    <motion.div
                      layoutId={`skill-icon-${skill.name}`}
                      className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center"
                      style={{
                        background: skill.color === "#FFFFFF"
                          ? "linear-gradient(135deg, #fff 0%, #d1d1d1 100%)"
                          : skill.color,
                        boxShadow: `0 8px 20px ${skill.color}20`
                      }}
                    />
                    <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary transition-colors uppercase tracking-wider">
                      {skill.name}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setOpen(false)}
                className="mt-10 text-[10px] uppercase tracking-[0.2em] text-text-tertiary hover:text-text-secondary transition-colors"
              >
                Close Folder
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
