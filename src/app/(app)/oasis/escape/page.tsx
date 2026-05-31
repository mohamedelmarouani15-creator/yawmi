"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Boxes } from "lucide-react";
import { ESCAPE_ROOMS, getCurrentEscapeRoom } from "@/lib/game/escape-rooms";
import { springTap } from "@/lib/motion";

export default function EscapeListPage() {
  const router = useRouter();
  const current = getCurrentEscapeRoom();

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col px-5 pt-11 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 55%)" }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <h1 className="text-lg font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          Escape Game
        </h1>
      </div>

      {/* Bannière Riad 3D */}
      <motion.button
        onClick={() => router.push("/escape3d")}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl border p-5 mb-4 text-left"
        style={{
          background: "linear-gradient(135deg,rgba(5,92,63,0.35) 0%,rgba(4,6,8,0.9) 100%)",
          borderColor: "rgba(5,195,111,0.4)",
          boxShadow: "0 0 28px rgba(5,195,111,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(5,195,111,0.15)" }}>
            <Boxes size={22} style={{ color: "#05C36F" }} />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest font-semibold mb-0.5"
              style={{ color: "#05C36F", fontFamily: "var(--font-dm-sans)" }}>
              ✦ Nouveau · Expérience 3D
            </p>
            <p className="text-base font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Le Riad des Secrets
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
              Explore le riad, résous 5 énigmes en arabe
            </p>
          </div>
          <span style={{ color: "#05C36F", fontSize: 20 }}>→</span>
        </div>
      </motion.button>

      <div className="rounded-2xl border p-4 mb-6"
        style={{ background: "rgba(212,175,55,0.05)", borderColor: "var(--border-gold)" }}>
        <p className="text-xs uppercase tracking-widest mb-1"
          style={{ color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          Cette semaine
        </p>
        <p className="text-sm" style={{ color: "rgba(248,244,236,0.55)", fontFamily: "var(--font-dm-sans)" }}>
          Une nouvelle chambre mystère ouvre chaque vendredi. Résous les 4 cadenas avec ta famille.
        </p>
      </div>

      {/* Current room */}
      <motion.button
        onClick={() => router.push(`/oasis/escape/current`)}
        whileTap={{ scale: 0.97 }} transition={springTap}
        className="rounded-2xl border p-5 mb-4 text-left w-full"
        style={{
          background: `linear-gradient(135deg,rgba(${current.accentColor === "var(--gold)" ? "212,175,55" : "200,120,50"},0.08) 0%,rgba(6,26,18,0.95) 100%)`,
          borderColor: current.accentColor + "50",
          boxShadow: `0 0 24px ${current.accentColor}15`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: current.accentColor, fontFamily: "var(--font-dm-sans)" }}>
            ✦ Salle active
          </span>
        </div>
        <p className="text-base font-bold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          {current.name}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
          {current.description}
        </p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
            Récompense : +{current.reward.xp} XP · {current.reward.coins} 🪙 · {current.reward.chests} 📦
          </span>
        </div>
      </motion.button>

      {/* All rooms */}
      <p className="text-xs uppercase tracking-widest mb-3"
        style={{ color: "var(--text-dim)", fontFamily: "var(--font-dm-sans)" }}>
        Toutes les salles
      </p>
      <div className="flex flex-col gap-2">
        {ESCAPE_ROOMS.map(room => (
          <motion.button key={room.id}
            onClick={() => router.push(`/oasis/escape/${room.id}`)}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: `${room.accentColor}22` }}>
            <div className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center"
              style={{ background: `${room.accentColor}18`, fontSize: 20 }}>
              {room.theme === "medersa" ? "🏫" : room.theme === "bibliotheque" ? "📚" : room.theme === "observatoire" ? "🔭" : "🏠"}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                {room.name}
              </p>
              <p className="text-xs" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                {room.theme.charAt(0).toUpperCase() + room.theme.slice(1)} · 4 cadenas
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.main>
  );
}
