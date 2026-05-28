import Link from "next/link";
import { Moon, BookOpen, RotateCcw, Users, Settings } from "lucide-react";

const SHORTCUTS = [
  { href: "/prieres", icon: Moon,       label: "Prières",  desc: "Prochaine : Asr" },
  { href: "/coran",   icon: BookOpen,   label: "Coran",    desc: "Continuer la lecture" },
  { href: "/dhikr",   icon: RotateCcw,  label: "Dhikr",    desc: "Tasbih du matin" },
  { href: "/famille", icon: Users,      label: "Famille",  desc: "2 tâches en attente" },
];

export default function AccueilPage() {
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Assalamu alaykum
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Bonsoir 👋
          </h1>
        </div>
        <Link
          href="/profil"
          className="flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}
        >
          <Settings size={18} />
        </Link>
      </div>

      {/* Carte du jour */}
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #055C3F 0%, #033d2a 100%)",
          boxShadow: "0 8px 32px rgba(5,92,63,0.3)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }}
        />
        <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Dhikr du jour
        </p>
        <p className="mt-3 text-xl font-bold leading-snug" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
          سُبْحَانَ اللّهِ وَبِحَمْدِهِ
        </p>
        <p className="mt-1 text-sm opacity-70" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Subhan Allahi wa bihamdihi
        </p>
      </div>

      {/* Raccourcis */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Accès rapide
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SHORTCUTS.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(212,175,55,0.12)",
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {label}
                </p>
                <p className="mt-0.5 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
