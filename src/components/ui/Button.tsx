"use client";

import { motion } from "framer-motion";
import { springTap } from "@/lib/motion";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "ghost-gold" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?:     ReactNode;
  onClick?:  () => void;
  type?:     "button" | "submit" | "reset";
  children:  ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--gradient-primary)",
    color:      "var(--gold)",
    border:     "none",
    boxShadow:  "var(--shadow-primary)",
  },
  secondary: {
    background: "var(--bg-primary)",
    color:      "var(--text)",
    border:     "1px solid rgba(5,92,63,0.4)",
  },
  ghost: {
    background: "transparent",
    color:      "rgba(248,244,236,0.4)",
    border:     "1px solid rgba(255,255,255,0.1)",
  },
  "ghost-gold": {
    background: "transparent",
    color:      "var(--gold)",
    border:     "1px solid rgba(212,175,55,0.25)",
  },
  danger: {
    background: "rgba(224,82,82,0.1)",
    color:      "#E05252",
    border:     "1px solid rgba(224,82,82,0.25)",
  },
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1 text-xs gap-1.5 rounded-full",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-5 py-3.5 text-base gap-2.5 rounded-2xl",
};

export function Button({
  variant  = "ghost",
  size     = "md",
  loading  = false,
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  type = "button",
  children,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.94 }}
      transition={springTap}
      className={`inline-flex items-center justify-center font-medium transition-opacity
        ${SIZE_CLASSES[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
        ${className}`}
      style={{
        ...VARIANT_STYLES[variant],
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
