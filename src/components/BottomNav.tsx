"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, BookOpen, Users, GraduationCap } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useT } from "@/hooks/useT";
import { ageGroupToMode } from "@/hooks/useAgeMode";
import { CrescentStar, TasbihIcon } from "@/components/IslamicIcons";
import type React from "react";

type NavKey = { href: string; labelKey: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };

const NAV_DEFAULT: NavKey[] = [
  { href: "/accueil",  labelKey: "nav.home",    Icon: Home          },
  { href: "/prieres",  labelKey: "nav.prayers", Icon: CrescentStar  },
  { href: "/oasis",    labelKey: "nav.oasis",   Icon: Compass       },
  { href: "/arabe",    labelKey: "nav.arabe",   Icon: GraduationCap },
  { href: "/histoire", labelKey: "nav.history", Icon: BookOpen      },
];

const NAV_KIDS: NavKey[] = [
  { href: "/accueil",  labelKey: "nav.home",    Icon: Home       },
  { href: "/prieres",  labelKey: "nav.prayers", Icon: CrescentStar },
  { href: "/oasis",    labelKey: "nav.play",    Icon: Compass    },
  { href: "/histoire", labelKey: "nav.stories", Icon: BookOpen   },
  { href: "/dhikr",    labelKey: "nav.dhikr",   Icon: TasbihIcon },
];

const NAV_ELDER: NavKey[] = [
  { href: "/accueil",  labelKey: "nav.home",    Icon: Home       },
  { href: "/prieres",  labelKey: "nav.prayers", Icon: CrescentStar },
  { href: "/coran",    labelKey: "nav.quran",   Icon: BookOpen   },
  { href: "/dhikr",    labelKey: "nav.dhikr",   Icon: TasbihIcon },
  { href: "/famille",  labelKey: "nav.family",  Icon: Users      },
];

export default function BottomNav() {
  const pathname     = usePathname();
  const { settings } = useSettings();
  const tt           = useT();
  const ageMode      = ageGroupToMode(settings.ageGroup);

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
      {items.map(({ href, labelKey, Icon }) => {
        const active = pathname === href || (href !== "/accueil" && pathname.startsWith(href));
        return (
          <motion.div key={href} whileTap={{ scale: 0.86 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
            <Link
              href={href}
              prefetch={true}
              aria-label={tt(labelKey)}
              aria-current={active ? "page" : undefined}
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
                {tt(labelKey)}
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
