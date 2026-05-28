"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Moon, BookOpen, RotateCcw, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/accueil",  label: "Accueil",  Icon: Home       },
  { href: "/prieres",  label: "Prières",  Icon: Moon       },
  { href: "/coran",    label: "Coran",    Icon: BookOpen   },
  { href: "/dhikr",    label: "Dhikr",    Icon: RotateCcw  },
  { href: "/famille",  label: "Famille",  Icon: Users      },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t px-2 pb-safe"
      style={{
        background: "rgba(6,26,18,0.95)",
        borderColor: "rgba(212,175,55,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-4 py-3 transition-all duration-200"
            style={{ color: active ? "#D4AF37" : "rgba(248,244,236,0.4)" }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {label}
            </span>
            {active && (
              <span
                className="absolute bottom-0 h-0.5 w-8 rounded-full"
                style={{ background: "#D4AF37" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
