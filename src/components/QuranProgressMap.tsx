"use client";

import { motion } from "framer-motion";

interface SurahState {
  number: number;
  name: string;            // nom arabe
  englishName: string;     // nom translittéré
  numberOfAyahs: number;
  masteredCount: number;   // versets mastered (score >= 85)
  dueCount: number;        // versets à réviser (next_due <= today)
}

interface Props {
  surahs: SurahState[];
  onSelect: (surahNumber: number) => void;
}

export default function QuranProgressMap({ surahs, onSelect }: Props) {
  const totalMastered = surahs.reduce((sum, s) => sum + s.masteredCount, 0);
  const totalAyahs    = surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête progression globale */}
      <div className="flex items-center justify-between">
        <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {totalMastered} / {totalAyahs} versets maîtrisés
        </p>
        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
          <span className="flex items-center gap-1 opacity-50" style={{ color: "var(--text)" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "rgba(5,92,63,0.7)" }} />
            Maîtrisé
          </span>
          <span className="flex items-center gap-1 opacity-50" style={{ color: "var(--text)" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "rgba(239,68,68,0.4)" }} />
            À réviser
          </span>
          <span className="flex items-center gap-1 opacity-50" style={{ color: "var(--text)" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "rgba(212,175,55,0.25)" }} />
            En cours
          </span>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${totalAyahs > 0 ? (totalMastered / totalAyahs) * 100 : 0}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: "linear-gradient(to right, #055C3F, #D4AF37)" }}
        />
      </div>

      {/* Grille 10 colonnes */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
        {surahs.map((s, idx) => {
          const isMastered = s.numberOfAyahs > 0 && s.masteredCount >= s.numberOfAyahs;
          const hasDue     = s.dueCount > 0;
          const hasSeen    = s.masteredCount > 0 || s.dueCount > 0;
          const progress   = s.numberOfAyahs > 0 ? s.masteredCount / s.numberOfAyahs : 0;

          const bg = isMastered
            ? "rgba(5,92,63,0.7)"
            : hasDue
            ? "rgba(239,68,68,0.2)"
            : hasSeen
            ? "rgba(212,175,55,0.18)"
            : "rgba(255,255,255,0.04)";

          const borderColor = isMastered
            ? "rgba(5,92,63,0.9)"
            : hasDue
            ? "rgba(239,68,68,0.3)"
            : hasSeen
            ? "rgba(212,175,55,0.25)"
            : "rgba(255,255,255,0.06)";

          return (
            <motion.button
              key={s.number}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.003, duration: 0.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onSelect(s.number)}
              className="relative flex items-center justify-center rounded-lg aspect-square text-[9px] font-bold"
              style={{
                background: bg,
                border: `1px solid ${borderColor}`,
                color: isMastered ? "var(--gold)" : "rgba(248,244,236,0.4)",
                fontFamily: "var(--font-dm-sans)",
              }}
              title={`${s.englishName} (${s.name}) — ${s.masteredCount}/${s.numberOfAyahs} versets`}
            >
              {s.number}

              {/* Dot maîtrisé */}
              {isMastered && (
                <div
                  className="absolute"
                  style={{
                    top: 1, right: 1,
                    width: 4, height: 4, borderRadius: "50%",
                    background: "var(--gold)",
                  }}
                />
              )}

              {/* Barre de progression partielle (en bas de la cellule) */}
              {hasSeen && !isMastered && progress > 0 && (
                <div
                  className="absolute bottom-0 left-0 rounded-b"
                  style={{
                    height: 2,
                    width: `${progress * 100}%`,
                    background: hasDue ? "rgba(239,68,68,0.6)" : "rgba(212,175,55,0.5)",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
