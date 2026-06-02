import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PillButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "accent";
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variantStyles = {
  primary: "bg-text-primary text-obsidian hover:opacity-90",
  outline: "bg-transparent text-text-primary border border-white/12 hover:bg-white/5",
  accent: "bg-accent-glow/15 text-accent-glow border border-accent-glow/20 hover:bg-accent-glow/25",
};

export function PillButton({
  children,
  variant = "primary",
  icon,
  onClick,
  className = "",
  fullWidth = false,
  type = "button",
  disabled = false,
}: PillButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-[13px] font-medium font-body tracking-wide transition-colors duration-200 disabled:opacity-50 ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      data-cursor-magnetic
    >
      {icon}
      {children}
    </motion.button>
  );
}
