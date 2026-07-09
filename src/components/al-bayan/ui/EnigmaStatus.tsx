"use client";

import { motion } from "framer-motion";
import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import { ALL_QUESTS, type QuestMeta } from "@/lib/al-bayan/puzzle-logic";

const QUEST_ICON: Record<QuestMeta["id"], string> = {
  astrolabe: "🔭",
  manuscrits: "📜",
  jarres: "🏺",
  lentille: "💎",
};

const QUEST_COLOR: Record<QuestMeta["id"], string> = {
  astrolabe: "#D4AF37",
  manuscrits: "#60a5fa",
  jarres: "#e8a33d",
  lentille: "#34d399",
};

interface QuestCardProps {
  quest: QuestMeta;
  solved: boolean;
  index: number;
}

function QuestCard({ quest, solved, index }: QuestCardProps) {
  const accentColor = QUEST_COLOR[quest.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col overflow-hidden"
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 14,
        padding: "10px 10px 8px",
        background: solved
          ? `linear-gradient(145deg, rgba(20,28,12,0.97) 0%, rgba(12,20,8,0.98) 100%)`
          : `linear-gradient(145deg, rgba(28,18,6,0.97) 0%, rgba(18,12,4,0.98) 100%)`,
        border: `1px solid ${solved ? "rgba(52,211,153,0.45)" : `${accentColor}28`}`,
        boxShadow: solved
          ? `0 0 18px rgba(52,211,153,0.12), inset 0 1px 0 rgba(52,211,153,0.08)`
          : `0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.06)`,
      }}
    >
      {/* Shimmer sur non-résolu */}
      {!solved && (
        <motion.div
          className="absolute inset-0 rounded-[13px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.028) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Bande colorée latérale gauche */}
      <div
        className="absolute left-0 top-3 bottom-3"
        style={{ width: 3, borderRadius: "0 2px 2px 0", background: solved ? "#34d399" : accentColor, opacity: solved ? 0.9 : 0.5 }}
      />

      {/* En-tête : icône + label */}
      <div className="flex items-start gap-1.5 pl-1.5 mb-1.5">
        <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>{QUEST_ICON[quest.id]}</span>
        <div className="flex flex-col min-w-0">
          <span
            style={{
              fontSize: 8,
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: solved ? "#34d399" : "rgba(248,244,236,0.6)",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {quest.title}
          </span>
          <span
            style={{
              fontSize: 7,
              fontFamily: "var(--font-dm-sans)",
              color: solved ? "rgba(52,211,153,0.55)" : "rgba(248,244,236,0.28)",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {quest.zone}
          </span>
        </div>
      </div>

      {/* Statut */}
      <div className="flex items-center justify-between pl-1.5 gap-1">
        {solved ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.1 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              background: "rgba(52,211,153,0.14)",
              border: "1px solid rgba(52,211,153,0.35)",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            <span style={{ fontSize: 8, color: "#34d399", fontFamily: "var(--font-dm-sans)", fontWeight: 800 }}>
              ✓ Résolue
            </span>
          </motion.div>
        ) : (
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${accentColor}10`,
              border: `1px solid ${accentColor}20`,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, opacity: 0.5 }}>🔒</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function EnigmaStatus() {
  const astrolabeSolved = useAlBayanStore((s) => s.astrolabeSolved);
  const manuscriptsSolved = useAlBayanStore((s) => s.manuscriptsSolved);
  const safeOpen = useAlBayanStore((s) => s.safeOpen);
  const lensPlaced = useAlBayanStore((s) => s.lensPlaced);
  const phase = useAlBayanStore((s) => s.phase);

  if (phase === "idle") return null;

  const solvedMap: Record<QuestMeta["id"], boolean> = {
    astrolabe: astrolabeSolved,
    manuscrits: manuscriptsSolved,
    jarres: safeOpen,
    lentille: lensPlaced,
  };
  const allSolved = Object.values(solvedMap).every(Boolean);
  const quests = Object.values(ALL_QUESTS);

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      style={{ width: "calc(100% - 32px)", maxWidth: 520 }}
    >
      {/* Trait ornemental supérieur */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.25))" }} />
        <span style={{ fontSize: 8, fontFamily: "var(--font-dm-sans)", color: "rgba(212,175,55,0.35)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {allSolved ? "✦ La sortie est révélée ✦" : "Quêtes en cours"}
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(212,175,55,0.25))" }} />
      </div>

      <div className="flex gap-2">
        {quests.map((quest, index) => (
          <QuestCard key={quest.id} quest={quest} solved={solvedMap[quest.id]} index={index} />
        ))}
      </div>
    </div>
  );
}
