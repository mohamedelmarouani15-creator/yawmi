"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/lib/motion";

// Arc pilote — l'interface affichera les arcs depuis Supabase à terme
const ARCS = [
  {
    id: "arc_yusuf",
    title: "L'histoire de Yûsuf",
    titleAr: "قِصَّةُ يُوسُفَ",
    subtitle: "La plus belle des histoires — Sourate 12",
    chapters: 10,
    status: "available",
    color: "#D4AF37",
    emoji: "⭐",
    description: "Dix chapitres pour découvrir l'histoire de Yûsuf — la jalousie, le puits, l'Égypte, la prison et le pardon.",
  },
];

// Tapis voyageur SVG
function TapisVoyageur() {
  return (
    <svg width={180} height={100} viewBox="0 0 180 100">
      {/* Corps du tapis */}
      <rect x={10} y={20} width={160} height={60} rx={6}
        fill="#8B2500" stroke="rgba(212,175,55,0.6)" strokeWidth={1.5} />
      {/* Bordure intérieure */}
      <rect x={16} y={26} width={148} height={48} rx={4}
        fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth={1} />
      {/* Motif central géométrique */}
      <polygon points="90,38 100,50 90,62 80,50"
        fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth={1} />
      <circle cx={90} cy={50} r={4} fill="rgba(212,175,55,0.4)" />
      {/* Franges gauche */}
      {[0,1,2,3,4].map(i => (
        <line key={`fl${i}`} x1={10} y1={30 + i * 10} x2={2} y2={33 + i * 10}
          stroke="rgba(212,175,55,0.5)" strokeWidth={1.2} strokeLinecap="round" />
      ))}
      {/* Franges droite */}
      {[0,1,2,3,4].map(i => (
        <line key={`fr${i}`} x1={170} y1={30 + i * 10} x2={178} y2={33 + i * 10}
          stroke="rgba(212,175,55,0.5)" strokeWidth={1.2} strokeLinecap="round" />
      ))}
      {/* Étoiles décoratives */}
      {[[35,50],[145,50],[90,32],[90,68]].map(([cx, cy], i) => (
        <text key={i} x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={8} fill="rgba(212,175,55,0.35)">✦</text>
      ))}
    </svg>
  );
}

export default function HistoirePage() {
  const router = useRouter();

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col px-5 pt-12 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <p className="text-xs tracking-widest uppercase opacity-50 mb-1"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          La Grande Histoire
        </p>
        <h1 className="text-2xl font-bold mb-1"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Le Tapis Voyageur
        </h1>
        <p className="text-xs leading-relaxed opacity-45"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Voyage à travers les histoires de l&apos;islam.
          Un chapitre par jour, une leçon pour la vie.
        </p>
      </motion.div>

      {/* Tapis illustration */}
      <motion.div variants={itemVariants} className="flex justify-center mb-8">
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <TapisVoyageur />
        </motion.div>
      </motion.div>

      {/* Arcs disponibles */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        {ARCS.map(arc => (
          <motion.button
            key={arc.id}
            onClick={() => router.push(`/histoire/${arc.id}`)}
            whileTap={{ scale: 0.97 }}
            className="rounded-3xl border p-5 text-left w-full"
            style={{
              background:
                "linear-gradient(135deg,rgba(212,175,55,0.08) 0%,rgba(6,26,18,0.95) 100%)",
              borderColor: "rgba(212,175,55,0.3)",
              boxShadow: "0 0 24px rgba(212,175,55,0.08)",
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span style={{ fontSize: 28 }}>{arc.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-base leading-tight mb-0.5"
                  style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
                  {arc.title}
                </p>
                <p className="text-base leading-tight mb-1"
                  style={{ color: arc.color, fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                  {arc.titleAr}
                </p>
                <p className="text-xs opacity-55"
                  style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {arc.subtitle}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 opacity-65"
              style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {arc.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs"
                style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                {arc.chapters} chapitres
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: `${arc.color}20`,
                  color: arc.color,
                  border: `1px solid ${arc.color}40`,
                  fontFamily: "var(--font-dm-sans)",
                }}>
                Commencer →
              </span>
            </div>
          </motion.button>
        ))}

        {/* Arcs à venir */}
        <div className="rounded-2xl border p-4 text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <p className="text-sm font-semibold mb-1"
            style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-bricolage)" }}>
            D&apos;autres histoires arrivent…
          </p>
          <p className="text-xs opacity-40"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Ibrahim ﷺ · Moussa ﷺ · La Sîra · Les compagnons
          </p>
        </div>
      </motion.div>

      {/* Note de validation */}
      <motion.div variants={itemVariants} className="mt-6 rounded-xl border p-3"
        style={{ borderColor: "rgba(212,175,55,0.12)", background: "rgba(212,175,55,0.04)" }}>
        <p className="text-xs leading-relaxed opacity-50 text-center"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          ✦ Sources : Coran (Sourate Yûsuf, 12) uniquement.
          Ce contenu est en cours de validation religieuse avant diffusion publique.
        </p>
      </motion.div>
    </motion.main>
  );
}
