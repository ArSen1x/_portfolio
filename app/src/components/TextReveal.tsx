import { motion } from "framer-motion";

interface TextRevealProps {
  text?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { y: "120%" },
  show: {
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 22,
    },
  },
};

export function TextReveal({ text = "The work that earns an unfair advantage.", className = "", as: Tag = "h2" }: TextRevealProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15%" }}
      className={className}
    >
      <Tag className="font-display font-bold tracking-[-0.03em] leading-[1.05] m-0">
        {text.split(" ").map((word, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden align-top mr-[0.22em]"
          >
            <motion.span variants={childVariants} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </Tag>
    </motion.div>
  );
}
