"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const HINT_LEVEL_LABEL = ["Niv.1", "Niv.2", "Niv.3"];

function LetterReveal({ text, onClose, color }: { text: string; onClose: () => void; color: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ rotateX: -90, scale: 0.8 }} animate={{ rotateX: 0, scale: 1 }} exit={{ rotateX: 90, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, rgba(42,32,12,0.98) 0%, rgba(28,22,8,0.99) 100%)", border: `1px solid ${color}50`, boxShadow: `0 0 40px ${color}20, inset 0 0 20px rgba(212,175,55,0.04)` }}
      >
        <div className="text-center mb-3"><span style={{ fontSize: 28 }}>📜</span></div>
        <div className="text-center mb-3 pb-3" style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
          <span style={{ fontSize: 8, fontFamily: "var(--font-dm-sans)", color: "rgba(212,175,55,0.5)", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>
            Indice
          </span>
        </div>
        <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(248,244,236,0.04)", border: "1px solid rgba(248,244,236,0.08)" }}>
          <p style={{ fontSize: 12, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.8)", lineHeight: 1.65, whiteSpace: "pre-line" }}>
            {text}
          </p>
        </div>
        <button onClick={onClose} className="w-full rounded-xl py-2" style={{ background: `${color}18`, border: `1px solid ${color}30`, color, fontSize: 11, fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
          Fermer la lettre
        </button>
      </motion.div>
    </motion.div>
  );
}

function QuestHintSection({
  quest,
  revealedLevel,
  hintsRemaining,
  onRequestHint,
}: {
  quest: QuestMeta;
  revealedLevel: number;
  hintsRemaining: number;
  onRequestHint: () => void;
}) {
  const color = QUEST_COLOR[quest.id];
  const [revealedText, setRevealedText] = useState<string | null>(null);
  const allUsed = revealedLevel >= 3;
  const canRequest = !allUsed && hintsRemaining > 0;

  const handleRequestHint = () => {
    if (!canRequest) return;
    setRevealedText(quest.hints[revealedLevel]);
    onRequestHint();
  };

  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: 14 }}>{QUEST_ICON[quest.id]}</span>
        <span style={{ fontSize: 10, fontFamily: "var(--font-dm-sans)", color, fontWeight: 700 }}>{quest.title}</span>
        <span style={{ fontSize: 8, color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)", marginLeft: "auto" }}>
          {revealedLevel}/3 indice{revealedLevel !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex gap-1.5">
        {([0, 1, 2] as const).map((idx) => {
          const used = idx < revealedLevel;
          const isNext = idx === revealedLevel;
          const clickable = isNext && canRequest;
          return (
            <motion.button
              key={idx}
              whileTap={clickable ? { scale: 0.92 } : {}}
              onClick={clickable ? handleRequestHint : undefined}
              disabled={!clickable}
              className="flex-1 rounded-lg py-1.5 text-[9px] font-bold"
              style={{
                background: used ? `${color}15` : isNext ? `${color}20` : "rgba(255,255,255,0.03)",
                border: `1px solid ${used ? `${color}30` : isNext ? `${color}45` : "rgba(255,255,255,0.06)"}`,
                color: used ? `${color}80` : isNext ? color : "rgba(248,244,236,0.2)",
                cursor: clickable ? "pointer" : "default",
                fontFamily: "var(--font-dm-sans)",
                opacity: isNext && !canRequest ? 0.4 : 1,
              }}
            >
              {used ? "✓" : HINT_LEVEL_LABEL[idx]}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealedText && <LetterReveal text={revealedText} onClose={() => setRevealedText(null)} color={color} />}
      </AnimatePresence>
    </div>
  );
}

/**
 * 3 indices au total, mutualisés sur les 45 minutes (voir game-store.ts,
 * `hintsUsed`) et répartissables librement entre les 4 énigmes — le niveau
 * révélé par énigme reste local au composant (pas besoin de le persister,
 * seul le compteur global est stateful côté store).
 */
export default function HintMailbox() {
  const phase = useAlBayanStore((s) => s.phase);
  const hintsUsed = useAlBayanStore((s) => s.hintsUsed);
  const consumeHint = useAlBayanStore((s) => s.useHint);

  const [open, setOpen] = useState(false);
  const [revealedLevels, setRevealedLevels] = useState<Record<QuestMeta["id"], number>>({
    astrolabe: 0,
    manuscrits: 0,
    jarres: 0,
    lentille: 0,
  });

  if (phase === "idle" || phase === "victory" || phase === "failure") return null;

  const hintsRemaining = 3 - hintsUsed;
  const quests = Object.values(ALL_QUESTS);

  return (
    <div className="pointer-events-auto">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-2xl px-3 py-2 mb-2"
        style={{ background: "rgba(10,15,13,0.88)", border: "1px solid rgba(212,175,55,0.3)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <span style={{ fontSize: 16 }}>✉️</span>
        <span style={{ fontSize: 9, fontFamily: "var(--font-dm-sans)", color: "rgba(212,175,55,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Indices ({hintsRemaining}/3)
        </span>
        <span style={{ fontSize: 10, color: "rgba(212,175,55,0.5)", marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          // Le conteneur parent est ancré par `bottom` (pas `top`) : sans
          // limite de hauteur, le panneau ouvert pousse son sommet — donc
          // le bouton "Indices" lui-même, seul moyen de fermer — au-dessus
          // du viewport (constaté : y=276 avant ouverture -> y=-135 après,
          // bouton totalement hors écran et donc injoignable). `maxHeight`
          // + scroll interne garantit que le bouton reste toujours visible
          // quel que soit le nombre d'indices affichés.
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div
              className="rounded-2xl p-3 flex flex-col gap-2"
              style={{
                background: "rgba(10,15,13,0.92)",
                border: "1px solid rgba(212,175,55,0.22)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                width: 240,
                maxHeight: "min(320px, 48dvh)",
                overflowY: "auto",
              }}
            >
              <p style={{ fontSize: 8, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.3)", textAlign: "center", marginBottom: 2 }}>
                3 indices au total, à répartir entre les 4 énigmes
              </p>
              {quests.map((quest) => (
                <QuestHintSection
                  key={quest.id}
                  quest={quest}
                  revealedLevel={revealedLevels[quest.id]}
                  hintsRemaining={hintsRemaining}
                  onRequestHint={() => {
                    setRevealedLevels((prev) => ({ ...prev, [quest.id]: prev[quest.id] + 1 }));
                    consumeHint();
                  }}
                />
              ))}
              {/* Fermeture explicite, redondante avec le re-tap sur le
                  bouton "Indices" — évite de dépendre uniquement d'un
                  bouton qui a pu, avant ce correctif, se retrouver hors
                  écran. */}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg py-1.5"
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: 700,
                  color: "rgba(248,244,236,0.5)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                ✕ Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
