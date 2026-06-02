import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectCarouselProps {
  projects: Project[];
}

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!viewport.current || !track.current) return;
      setDrag(track.current.scrollWidth - viewport.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={viewport} className="overflow-hidden cursor-grab py-2 md:hidden">
      <motion.div
        ref={track}
        drag="x"
        dragConstraints={{ left: -drag, right: 0 }}
        dragElastic={0.12}
        dragTransition={{ power: 0.3, timeConstant: 280 }}
        whileTap={{ cursor: "grabbing" }}
        className="flex gap-4 w-max px-4"
      >
        {projects.map((project) => (
          <div key={project.id} className="w-[280px] shrink-0">
            <ProjectCard project={project} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
