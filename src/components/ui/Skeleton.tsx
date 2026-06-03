"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  variant?:  "text" | "card" | "avatar" | "button" | "block";
  lines?:    number;
  className?: string;
  height?:   number | string;
  width?:    number | string;
}

function SkeletonBase({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" as const }}
      className={`rounded-lg ${className}`}
      style={{
        background: "linear-gradient(90deg, rgba(212,175,55,0.06) 25%, rgba(212,175,55,0.12) 50%, rgba(212,175,55,0.06) 75%)",
        backgroundSize: "200% 100%",
        ...style,
      }}
    />
  );
}

export function Skeleton({ variant = "text", lines = 1, className = "", height, width }: SkeletonProps) {
  if (variant === "avatar") {
    return (
      <SkeletonBase
        className={`rounded-full ${className}`}
        style={{ width: width ?? 40, height: height ?? 40 }}
      />
    );
  }

  if (variant === "button") {
    return (
      <SkeletonBase
        className={`rounded-xl ${className}`}
        style={{ width: width ?? 120, height: height ?? 40 }}
      />
    );
  }

  if (variant === "card") {
    return (
      <SkeletonBase
        className={`rounded-2xl ${className}`}
        style={{ width: width ?? "100%", height: height ?? 80 }}
      />
    );
  }

  if (variant === "block") {
    return (
      <SkeletonBase
        className={className}
        style={{ width: width ?? "100%", height: height ?? 20 }}
      />
    );
  }

  // text — multiple lines
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          style={{
            width:  i === lines - 1 && lines > 1 ? "60%" : "100%",
            height: height ?? 14,
          }}
        />
      ))}
    </div>
  );
}

// Preset — skeleton complet d'une carte d'info (label + titre)
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${className}`}
      style={{ borderColor: "rgba(212,175,55,0.08)" }}>
      <Skeleton variant="text" height={10} width="40%" />
      <Skeleton variant="text" height={20} width="70%" />
    </div>
  );
}
