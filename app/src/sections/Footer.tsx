import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.footer
      className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col sm:flex-row items-center justify-between gap-4 py-8 px-4 border-t border-divider mt-8"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-caption text-text-tertiary">
        &copy; {new Date().getFullYear()} Alex Rivera. Crafted with care.
      </p>

      <p className="text-caption text-text-tertiary">
        Built with Vite · Motion · Three.js
      </p>

      <motion.button
        onClick={scrollToTop}
        className="flex items-center gap-1.5 text-caption text-text-tertiary hover:text-text-primary transition-colors"
        whileHover={{ y: -2 }}
      >
        <ArrowUp size={14} />
        Top
      </motion.button>
    </motion.footer>
  );
}
