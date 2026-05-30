"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Moon, Compass, BookOpen, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/accueil",  label: "Accueil",  Icon: Home       },
  { href: "/prieres",  label: "Prières",  Icon: Moon       },
  { href: "/oasis",    label: "Oasis",    Icon: Compass    },
  { href: "/histoire", label: "Histoire", Icon: BookOpen   },
  { href: "/famille",  label: "Famille",  Icon: Users      },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t pb-safe"
      style={{
        background: "rgba(6,26,18,0.96)",
        borderColor: "rgba(212,175,55,0.15)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/accueil" && pathname.startsWith(href));
        return (
          <motion.div key={href} whileTap={{ scale: 0.86 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
            <Link
              href={href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2.5"
              style={{ color: active ? "#D4AF37" : "rgba(248,244,236,0.35)" }}
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
                  style={{ background: "#D4AF37" }}
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
