import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const skills = [
  { name: "Frontend", color: "#6C8CFF" },
  { name: "Backend", color: "#3DD6D0" },
  { name: "Design", color: "#A78BFA" },
  { name: "Mobile", color: "#F59E0B" },
  { name: "3D", color: "#EC4899" },
  { name: "Database", color: "#10B981" },
  { name: "DevOps", color: "#0EA5E9" },
  { name: "AI/ML", color: "#8B5CF6" },
  { name: "Languages", color: "#F97316" },
];

export function SkillFolder() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* Folder button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="w-16 h-16 rounded-card-sm bg-white/[0.06] backdrop-blur-md border-none p-2.5 cursor-pointer grid grid-cols-3 gap-1"
      >
        {skills.slice(0, 9).map((a, i) => (
          <motion.span
            key={i}
            className="rounded w-full aspect-square"
            style={{ background: a.color }}
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 2 + Math.random(),
              delay: Math.random(),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.button>

      {/* Expanded overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-obsidian/65 grid place-items-center"
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
              onClick={(e) => e.stopPropagation()}
              className="grid grid-cols-3 gap-7 p-8 max-w-[480px] w-full"
            >
              {skills.map((a) => (
                <motion.div
                  key={a.name}
                  variants={{
                    hidden: { scale: 0.4, opacity: 0 },
                    show: {
                      scale: 1,
                      opacity: 1,
                      transition: { type: "spring", stiffness: 300, damping: 20 },
                    },
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-14 h-14 rounded-card-sm shadow-lg"
                    style={{
                      background: a.color,
                      boxShadow: `0 8px 24px ${a.color}30`,
                    }}
                  />
                  <span className="text-text-primary text-caption">{a.name}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-8 text-text-tertiary text-xs"
            >
              Tap anywhere to close
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
