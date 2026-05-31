import { SectionReveal } from "@/components/SectionReveal";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectCarousel } from "@/components/ProjectCarousel";
import type { Project } from "@/types";

const projects: Project[] = [
  {
    id: "halcyon",
    title: "Halcyon",
    subtitle: "Brand Identity & Web Platform",
    description:
      "A complete brand overhaul for a wellness startup — from logo design to a fully responsive web platform. The visual language draws from organic forms and calming color palettes, creating an experience that feels like a deep breath.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    techStack: ["React", "Figma", "Next.js", "Tailwind"],
    link: "#",
  },
  {
    id: "vertex",
    title: "Vertex",
    subtitle: "3D Product Configurator",
    description:
      "An interactive 3D product configurator built with Three.js and React. Users can rotate, customize materials, and preview products in real-time — turning browsing into play.",
    image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200",
    techStack: ["Three.js", "React", "TypeScript", "WebGL"],
    link: "#",
  },
  {
    id: "drift",
    title: "Drift",
    subtitle: "Analytics Dashboard",
    description:
      "A real-time analytics dashboard designed for data-heavy SaaS platforms. Custom charting library, dark mode by default, and sub-second data refresh — built for teams who live in their data.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200",
    techStack: ["D3.js", "PostgreSQL", "Node.js", "GraphQL"],
    link: "#",
  },
];

export function Works() {
  return (
    <div id="works" className="col-span-1 md:col-span-3 lg:col-span-4">
      <span className="text-caption text-text-tertiary mb-4 block">Selected Work</span>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-3 gap-3">
        {projects.map((project) => (
          <SectionReveal key={project.id}>
            <ProjectCard project={project} />
          </SectionReveal>
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden">
        <ProjectCarousel projects={projects} />
      </div>
    </div>
  );
}
