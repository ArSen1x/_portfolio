import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { SmoothTabs } from "./SmoothTabs";

const tabs = ["Work", "About", "Skills", "Contact"];

export function NavHeader() {
  const { scrollY } = useScroll();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visible = useTransform(scrollY, [0, 300, 400], [0, 0, 1]);
  const translateY = useTransform(scrollY, [0, 300, 400], [-20, -20, 0]);

  const handleTabChange = (_index: number, tab: string) => {
    const sectionMap: Record<string, string> = {
      Work: "#works",
      About: "#about",
      Skills: "#skills",
      Contact: "#contact",
    };
    const target = sectionMap[tab];
    if (target) {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        className="fixed top-4 left-1/2 z-[100] flex items-center gap-3 px-3 py-2 rounded-pill bg-obsidian/60 backdrop-blur-xl border border-white/[0.06]"
        style={{
          opacity: visible,
          y: translateY,
          x: "-50%",
        }}
      >
        <span className="text-text-primary text-sm font-medium font-display px-2 hidden sm:block">
          Alex Rivera
        </span>

        <div className="hidden md:block">
          <SmoothTabs tabs={tabs} onTabChange={handleTabChange} />
        </div>

        <motion.a
          href="/resume.pdf"
          download
          className="hidden md:flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors p-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Download Resume"
        >
          <Download size={16} />
        </motion.a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-secondary p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99] bg-obsidian/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(0, tab)}
              className="text-text-primary text-2xl font-display font-medium"
            >
              {tab}
            </button>
          ))}
          <a
            href="/resume.pdf"
            download
            className="flex items-center gap-2 text-text-secondary text-lg mt-4"
          >
            <Download size={18} />
            Resume
          </a>
        </motion.div>
      )}
    </>
  );
}
