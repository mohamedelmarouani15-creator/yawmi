import type { Variants } from "framer-motion";

// Page container — stagger all direct children
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.25, 0.1, 0.25, 1],
      duration: 0.3,
      staggerChildren: 0.055,
      delayChildren: 0.06,
    },
  },
};

// Each staggered section
export const itemVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ease: [0.25, 0.1, 0.25, 1], duration: 0.38 },
  },
};

// Tap feedback configs
export const tapScale    = { scale: 0.96 };
export const tapStrong   = { scale: 0.90 };
export const springTap   = { type: "spring", stiffness: 480, damping: 22 } as const;
export const springGentle = { type: "spring", stiffness: 300, damping: 26 } as const;
