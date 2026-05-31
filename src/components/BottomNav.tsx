"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, BookOpen, Users, RotateCcw } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { ageGroupToMode } from "@/hooks/useAgeMode";
import { CrescentStar } from "@/components/IslamicIcons";
import type React from "react";

type NavItem = { href: string; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };

const NAV_DEFAULT: NavItem[] = [
  { href: "/accueil",  label: "Accueil",  Icon: Home       },
  { href: "/prieres",  label: "Prières",  Icon: CrescentStar },
  { href: "/oasis",    label: "Oasis",    Icon: Compass    },
  { href: "/histoire", label: "Histoire", Icon: BookOpen   },
  { href: "/famille",  label: "Famille",  Icon: Users      },
];

// Enfants : jeu en avant, pratique sacrée essentielle
const NAV_KIDS: NavItem[] = [
  { href: "/accueil",  label: "Accueil",  Icon: Home       },
  { href: "/prieres",  label: "Prières",  Icon: CrescentStar },
  { href: "/oasis",    label: "Jouer",    Icon: Compass    },
  { href: "/coran",    label: "Coran",    Icon: BookOpen   },
  { href: "/dhikr",    label: "Dhikr",    Icon: RotateCcw  },
];

// Aînés : navigation réduite, pages essentielles uniquement
const NAV_ELDER: NavItem[] = [
  { href: "/accueil",  label: "Accueil",  Icon: Home       },
  { href: "/prieres",  label: "Prières",  Icon: CrescentStar },
  { href: "/coran",    label: "Coran",    Icon: BookOpen   },
  { href: "/dhikr",    label: "Dhikr",    Icon: RotateCcw  },
  { href: "/famille",  label: "Famille",  Icon: Users      },
];

export default function BottomNav() {
  const pathname           = usePathname();
  const { settings }       = useSettings();
  const ageMode            = ageGroupToMode(settings.ageGroup);

  const items =
    ageMode === "kids"  ? NAV_KIDS  :
    ageMode === "elder" ? NAV_ELDER :
    NAV_DEFAULT;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t pb-safe"
      style={{
        background:          "rgba(6,26,18,0.96)",
        borderColor:         "var(--border-gold)",
        backdropFilter:      "blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
      }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/accueil" && pathname.startsWith(href));
        return (
          <motion.div key={href} whileTap={{ scale: 0.86 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
            <Link
              href={href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2.5"
              style={{ color: active ? "var(--gold)" : "rgba(248,244,236,0.35)" }}
            >
              <motion.div
                animate={{ scale: active ? 1 : 0.92, opacity: active ? 1 : 0.65 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              </motion.div>
              <span
                className="text-[9px] font-medium tracking-wide"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {label}
              </span>
              {active && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute bottom-0 h-0.5 w-7 rounded-full"
                  style={{ background: "var(--gold)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
