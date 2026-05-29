"use client";

// Page-level transitions are handled per-page via motion.main + pageVariants.
// This wrapper is kept as a structural container only.
export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col flex-1">{children}</div>;
}
