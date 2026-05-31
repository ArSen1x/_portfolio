import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  padding?: "default" | "small";
  style?: React.CSSProperties;
}

export function BentoCard({ children, className = "", padding = "default", style }: BentoCardProps) {
  const pad = padding === "small" ? "p-4" : "p-5 md:p-8";

  return (
    <motion.div
      className={`rounded-card overflow-hidden card-surface glass-border glass-border-hover transition-colors duration-300 ${pad} ${className}`}
      style={style}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
