"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { pageVariants, itemVariants } from "@/lib/motion";

export default function EscapeGamesPage() {
  const router = useRouter();

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-5 px-5 pt-12 pb-24"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)" }}
          aria-label="Retour">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <p className="text-xs tracking-widest uppercase opacity-40"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Oasis du Savoir
          </p>
          <h1 className="text-xl font-bold"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Escape Games
          </h1>
        </div>
      </motion.div>

      {/* Sous-titre */}
      <motion.p variants={itemVariants} className="text-sm leading-relaxed"
        style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
        Des aventures immersives en 3D pour apprendre en s&apos;évadant — seul ou en famille.
      </motion.p>

      {/* ── Le Secret de la Maison de la Sagesse ── */}
      <motion.button
        variants={itemVariants}
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push("/oasis/maison-sagesse")}
        className="w-full rounded-2xl p-4 text-left flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg,rgba(30,15,5,0.95) 0%,rgba(100,70,10,0.3) 50%,rgba(4,6,8,0.95) 100%)",
          border: "1px solid rgba(212,175,55,0.5)",
          boxShadow: "0 0 32px rgba(212,175,55,0.12), inset 0 0 32px rgba(212,175,55,0.03)",
        }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: "rgba(212,175,55,0.12)" }}>
          🏛️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-semibold tracking-widest uppercase"
              style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
              ✦ 3D Immersif • 45 min
            </span>
          </div>
          <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Le Secret de la Maison de la Sagesse
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
            Bagdad, 830 apr. J.-C. • Solo ou famille • Dès 7 ans
          </p>
        </div>
        <span style={{ color: "#D4AF37", fontSize: 18, flexShrink: 0 }}>→</span>
      </motion.button>

      {/* ── Prochaine aventure (à venir) ── */}
      <motion.div
        variants={itemVariants}
        className="w-full rounded-2xl p-4 flex items-center gap-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <Lock size={18} style={{ color: "rgba(248,244,236,0.3)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-bricolage)" }}>
            Prochaine aventure
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
            Une nouvelle salle arrive bientôt dans l&apos;Oasis.
          </p>
        </div>
      </motion.div>
    </motion.main>
  );
}
