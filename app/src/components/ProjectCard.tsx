import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Project } from "@/types";
import { PillButton } from "./PillButton";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      {!open && (
        <motion.div
          layoutId={`project-${project.id}`}
          onClick={() => setOpen(true)}
          className="rounded-card overflow-hidden cursor-pointer relative text-text-primary aspect-[4/3] group"
          data-cursor="view"
          data-cursor-label="View"
        >
          <motion.img
            layoutId={`project-img-${project.id}`}
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-obsidian/85 via-obsidian/40 to-transparent">
            <motion.div layoutId={`project-text-${project.id}`}>
              <div className="text-caption text-text-tertiary">{project.subtitle}</div>
              <div className="text-xl font-display font-bold text-text-primary mt-1">
                {project.title}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ backgroundColor: "rgba(3,3,3,0)" }}
            animate={{ backgroundColor: "rgba(3,3,3,0.7)" }}
            exit={{ backgroundColor: "rgba(3,3,3,0)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 grid place-items-center p-5 backdrop-blur-md"
          >
            <motion.div
              layoutId={`project-${project.id}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-card-md overflow-hidden bg-[#0A0A0C] w-full max-w-[640px] max-h-[90vh] overflow-y-auto"
            >
              <motion.img
                layoutId={`project-img-${project.id}`}
                src={project.image}
                alt={project.title}
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="p-6">
                <motion.div layoutId={`project-text-${project.id}`}>
                  <div className="text-caption text-text-tertiary">{project.subtitle}</div>
                  <div className="text-2xl md:text-[28px] font-display font-bold text-text-primary mt-1">
                    {project.title}
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.15 } }}
                  className="text-text-secondary leading-relaxed mt-4 text-[15px]"
                >
                  {project.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  className="flex flex-wrap gap-2 mt-5"
                >
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-pill text-[11px] font-mono bg-accent-glow/10 text-accent-glow border border-accent-glow/15"
                    >
                      {tech}
                    </span>
                  ))}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.25 } }}
                  className="mt-6"
                >
                  <PillButton
                    icon={<ExternalLink size={14} />}
                    onClick={() => window.open(project.link, "_blank")}
                  >
                    View Live
                  </PillButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
