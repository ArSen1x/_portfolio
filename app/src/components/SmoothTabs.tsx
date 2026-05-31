import { motion } from "framer-motion";
import { useState } from "react";

interface SmoothTabsProps {
  tabs?: string[];
  onTabChange?: (index: number, tab: string) => void;
}

export function SmoothTabs({ tabs = ["Work", "About", "Skills", "Contact"], onTabChange }: SmoothTabsProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="inline-flex gap-1 p-1 rounded-pill bg-white/[0.04]">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => {
            setActive(i);
            onTabChange?.(i, tab);
          }}
          className="relative border-none bg-none cursor-pointer px-4 py-2 rounded-pill text-[13px] font-medium font-body transition-colors duration-200"
        >
          {active === i && (
            <motion.span
              layoutId="active-tab-pill"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute inset-0 bg-white/[0.12] rounded-pill"
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ${
              active === i ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
}
