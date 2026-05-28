"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const ref      = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity  = "0";
    el.style.transform = "translateY(12px)";
    // force reflow
    void el.offsetHeight;
    el.style.transition = "opacity 0.28s ease-out, transform 0.28s ease-out";
    el.style.opacity    = "1";
    el.style.transform  = "translateY(0)";
  }, [pathname]);

  return <div ref={ref} className="flex flex-col flex-1">{children}</div>;
}
