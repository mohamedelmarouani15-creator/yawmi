"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Trophy, Lock } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { getLocation } from "@/lib/game/locations";
import { getSageForLocation } from "@/lib/game/sages";
import { pageVariants, itemVariants, springTap } from "@/lib/motion";

// Sage portrait SVG — noble illustration style
function SagePortrait({ sageId, color }: { sageId: string; color: string }) {
  const portraits: Record<string, React.ReactNode> = {
    al_idrissi: (
      <g>
        {/* Robe */}
        <path d="M 50,140 Q 20,130 15,180 L 85,180 Q 80,130 50,140 Z" fill={color} opacity={0.85} />
        {/* Turban */}
        <ellipse cx={50} cy={60} rx={32} ry={10} fill={color} opacity={0.9} />
        <path d="M 18,60 Q 10,40 50,35 Q 90,40 82,60 Z" fill={color} opacity={0.9} />
        <path d="M 35,35 Q 45,25 50,32" fill="none" stroke={color} strokeWidth={3} opacity={0.7} />
        {/* Face */}
        <ellipse cx={50} cy={95} rx={22} ry={28} fill="#c8a97a" />
        {/* Beard */}
        <path d="M 28,108 Q 30,130 50,138 Q 70,130 72,108" fill="#8B7355" opacity={0.8} />
        {/* Eyes */}
        <ellipse cx={42} cy={90} rx={4} ry={3} fill="#3d2b1a" />
        <ellipse cx={58} cy={90} rx={4} ry={3} fill="#3d2b1a" />
        {/* Map scroll */}
        <rect x={60} y={115} width={20} height={30} rx={3} fill="#F5DEB3" opacity={0.9} />
        <line x1={63} y1={122} x2={77} y2={122} stroke={color} strokeWidth={1} opacity={0.5} />
        <line x1={63} y1={128} x2={77} y2={128} stroke={color} strokeWidth={1} opacity={0.5} />
        <line x1={63} y1={134} x2={74} y2={134} stroke={color} strokeWidth={1} opacity={0.5} />
      </g>
    ),
    default: (
      <g>
        <path d="M 50,140 Q 20,130 15,180 L 85,180 Q 80,130 50,140 Z" fill={color} opacity={0.85} />
        <ellipse cx={50} cy={60} rx={30} ry={10} fill={color} opacity={0.9} />
        <path d="M 20,60 Q 12,42 50,36 Q 88,42 80,60 Z" fill={color} opacity={0.9} />
        <ellipse cx={50} cy={95} rx={22} ry={27} fill="#c8a97a" />
        <path d="M 28,110 Q 30,132 50,140 Q 70,132 72,110" fill="#8B7355" opacity={0.8} />
        <ellipse cx={42} cy={90} rx={4} ry={3} fill="#3d2b1a" />
        <ellipse cx={58} cy={90} rx={4} ry={3} fill="#3d2b1a" />
      </g>
    ),
  };

  return (
    <svg width="100" height="180" viewBox="0 0 100 180">
      {portraits[sageId] ?? portraits.default}
    </svg>
  );
}

export default function LieuPage() {
  const { lieu } = useParams() as { lieu: string };
  const router = useRouter();
  const { state, locationUnlocked } = useGameState();

  const location = getLocation(lieu);
  const sage     = getSageForLocation(lieu);
  const unlocked = locationUnlocked(lieu);
  const defeated = state?.defeatedSages.includes(sage?.id ?? "") ?? false;

  if (!location) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#061A12" }}>
        <p style={{ color: "#F8F4EC" }}>Lieu introuvable.</p>
      </div>
    );
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col px-5 pt-12 pb-32"
      style={{ background: "linear-gradient(180deg, #020a05 0%, #061A12 40%)" }}
    >
      {/* Back */}
      <motion.button
        variants={itemVariants}
        onClick={() => router.back()}
        whileTap={{ scale: 0.93 }}
        transition={springTap}
        className="flex items-center gap-2 mb-6 text-sm opacity-50 hover:opacity-80"
        style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
      >
        <ArrowLeft size={16} /> Retour à l'Oasis
      </motion.button>

      {/* City header */}
      <motion.div variants={itemVariants} className="mb-6">
        <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          {location.country}
        </p>
        <h1 className="mt-1 text-3xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          {location.nameFr}
        </h1>
        <p className="mt-1 text-xl" style={{ color: location.color, fontFamily: "var(--font-amiri)" }}>
          {location.name}
        </p>
        <p className="mt-2 text-sm opacity-60 leading-relaxed" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          {location.description}
        </p>
      </motion.div>

      {/* Locked state */}
      {!unlocked && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4 rounded-2xl border p-8 text-center"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Lock size={32} style={{ color: "rgba(248,244,236,0.3)" }} />
          <div>
            <p className="font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              Lieu verrouillé
            </p>
            <p className="mt-1 text-sm opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Il te faut {location.requiredXP} XP pour accéder à {location.nameFr}
            </p>
          </div>
          <motion.button
            onClick={() => router.back()}
            whileTap={{ scale: 0.95 }}
            transition={springTap}
            className="rounded-full px-6 py-2.5 text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
          >
            Continuer à jouer
          </motion.button>
        </motion.div>
      )}

      {/* Sage dialogue */}
      {unlocked && sage && (
        <>
          <motion.div
            variants={itemVariants}
            className="flex gap-4 rounded-2xl border p-5 mb-5"
            style={{
              background: `linear-gradient(135deg, rgba(5,92,63,0.15), rgba(0,0,0,0.1))`,
              borderColor: `${location.color}33`,
            }}
          >
            {/* Portrait */}
            <div className="shrink-0">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: `${location.color}22`, border: `1px solid ${location.color}44` }}
              >
                <SagePortrait sageId={sage.portrait} color={location.color} />
              </div>
            </div>

            {/* Info + dialogue */}
            <div className="flex flex-col gap-2 flex-1">
              <div>
                <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {sage.specialty}
                </p>
                <p className="font-bold text-base" style={{ color: location.color, fontFamily: "var(--font-bricolage)" }}>
                  {sage.name}
                </p>
                <p className="text-xs opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {sage.title}
                </p>
              </div>

              <p className="text-sm leading-relaxed opacity-80 mt-1"
                style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                &ldquo;{defeated ? sage.dialogueSuccess : sage.dialogueIntro}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Reward info */}
          <motion.div variants={itemVariants} className="flex gap-3 mb-6">
            <div className="flex-1 rounded-xl border px-4 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
              <p className="text-xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                +{sage.reward.xp}
              </p>
              <p className="text-xs opacity-50 mt-0.5" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                XP si victoire
              </p>
            </div>
            <div className="flex-1 rounded-xl border px-4 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
              <p className="text-xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                {sage.victoryRequirement}/10
              </p>
              <p className="text-xs opacity-50 mt-0.5" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                Bonnes réponses requises
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          {defeated ? (
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold"
                style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(212,175,55,0.3)" }}>
                <Trophy size={16} /> Sage vaincu — Compagnon acquis !
              </div>
              <motion.button
                onClick={() => router.push(`/oasis/quiz/${lieu}`)}
                whileTap={{ scale: 0.96 }}
                transition={springTap}
                className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold"
                style={{ background: "rgba(5,92,63,0.4)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(5,92,63,0.5)" }}
              >
                <Swords size={16} /> Rejouer
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              variants={itemVariants}
              onClick={() => router.push(`/oasis/quiz/${lieu}`)}
              whileTap={{ scale: 0.96 }}
              transition={springTap}
              className="flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold"
              style={{
                background: `linear-gradient(135deg, ${location.color}, #055C3F)`,
                color: "#F8F4EC",
                fontFamily: "var(--font-bricolage)",
                boxShadow: `0 0 32px ${location.color}44`,
              }}
            >
              <Swords size={18} /> Relever le défi du sage
            </motion.button>
          )}
        </>
      )}

      {/* No sage = terminal city (Médine/Mecque) */}
      {unlocked && !sage && (
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-5xl" style={{ fontFamily: "var(--font-amiri)", color: "#D4AF37" }}>
            {lieu === "la_mecque" ? "مكة" : "المدينة"}
          </p>
          <p className="text-sm opacity-60 leading-relaxed" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {lieu === "medine"
              ? "C'est d'ici que commence ton voyage. Explore les autres villes pour grandir en sagesse."
              : "Tu as atteint le sommet du voyage. Que ta quête de connaissance soit bénie."}
          </p>
          <motion.button
            onClick={() => router.back()}
            whileTap={{ scale: 0.95 }}
            transition={springTap}
            className="rounded-full px-6 py-2.5 text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
          >
            Retour à la carte
          </motion.button>
        </motion.div>
      )}
    </motion.main>
  );
}
