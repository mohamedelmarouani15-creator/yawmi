"use client";

import { motion } from "framer-motion";
import { springTap } from "@/lib/motion";
import type { ReactNode } from "react";

type Variant = "default" | "gold" | "primary";
type Padding = "none" | "sm" | "md" | "lg";

interface CardProps {
  variant?:   Variant;
  padding?:   Padding;
  pressable?: boolean;
  onClick?:   () => void;
  className?: string;
  children:   ReactNode;
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  default: {
    background:   "rgba(255,255,255,0.02)",
    borderColor:  "rgba(212,175,55,0.1)",
  },
  gold: {
    background:   "rgba(255,255,255,0.02)",
    borderColor:  "var(--gold-faint)",
  },
  primary: {
    background:   "var(--bg-primary)",
    borderColor:  "rgba(5,92,63,0.35)",
  },
};

const PADDING_CLASSES: Record<Padding, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-5",
};

export function Card({
  variant   = "default",
  padding   = "md",
  pressable = false,
  onClick,
  className = "",
  children,
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileTap={pressable ? { scale: 0.985 } : undefined}
      transition={pressable ? springTap : undefined}
      className={`rounded-2xl border ${PADDING_CLASSES[padding]} ${className}`}
      style={VARIANT_STYLES[variant]}
    >
      {children}
    </motion.div>
  );
}
