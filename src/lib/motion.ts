import type { Variants, Transition } from "framer-motion";

// ── Prefers-reduced-motion detection ─────────────────────────────
// SSR-safe : defaults to false (animations on) on the server
const prefersReducedMotion: boolean =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// ── Page container — stagger all direct children ─────────────────
export const pageVariants: Variants = prefersReducedMotion
  ? {
      initial: {},
      animate: { transition: { staggerChildren: 0 } },
    }
  : {
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

// ── Each staggered section ────────────────────────────────────────
export const itemVariants: Variants = prefersReducedMotion
  ? {
      initial: {},
      animate: {},
    }
  : {
      initial: { opacity: 0, y: 14 },
      animate: {
        opacity: 1,
        y: 0,
        transition: { ease: [0.25, 0.1, 0.25, 1], duration: 0.38 },
      },
    };

// ── Shared fade-in ────────────────────────────────────────────────
export const fadeIn: Variants = prefersReducedMotion
  ? { initial: {}, animate: {}, exit: {} }
  : {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.3 } },
      exit:    { opacity: 0, transition: { duration: 0.2 } },
    };

// ── Slide up ──────────────────────────────────────────────────────
export const slideUp: Variants = prefersReducedMotion
  ? { initial: {}, animate: {}, exit: {} }
  : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
      exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
    };

// ── Scale in ──────────────────────────────────────────────────────
export const scaleIn: Variants = prefersReducedMotion
  ? { initial: {}, animate: {} }
  : {
      initial: { opacity: 0, scale: 0.9 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
      },
    };

// ── Tap feedback configs ──────────────────────────────────────────
// When reduced-motion is preferred, disable tap scale animations
export const tapScale    = prefersReducedMotion ? {} : { scale: 0.96 };
export const tapStrong   = prefersReducedMotion ? {} : { scale: 0.90 };
export const springTap: Transition   = { type: "spring", stiffness: 480, damping: 22 };
export const springGentle: Transition = { type: "spring", stiffness: 300, damping: 26 };
