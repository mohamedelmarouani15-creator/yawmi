"use client";

import { useEffect, useState } from "react";
import { X, Plus, Moon, Volume2 } from "lucide-react";

export type SleepOption = "15" | "30" | "45" | "60" | "surah" | "juzz";

const OPTION_LABELS: Record<SleepOption, string> = {
  "15":    "15 min",
  "30":    "30 min",
  "45":    "45 min",
  "60":    "1 heure",
  surah:   "Fin de la sourate",
  juzz:    "Fin du Juzz",
};

const RECITERS = [
  { id: "Alafasy_128kbps",              name: "Alafasy" },
  { id: "Husary_128kbps",               name: "Husary"  },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdul Basit" },
  { id: "Minshawy_Murattal_128kbps",    name: "Minshawy" },
];

function fmt(s: number) {
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface Props {
  surahName:     string;
  surahNameAr:   string;
  currentAyah:   number;
  currentJuzz:   number;
  sleepOption:   SleepOption | null;
  secondsLeft:   number | null;
  reciter:       string;
  onReciter:     (id: string) => void;
  onSelect:      (opt: SleepOption) => void;
  onExtend:      () => void;
  onStop:        () => void;
}

export default function SleepModeOverlay({
  surahName, surahNameAr, currentAyah, currentJuzz,
  sleepOption, secondsLeft, reciter, onReciter,
  onSelect, onExtend, onStop,
}: Props) {
  const [dimFactor, setDimFactor] = useState(1);
  const [showRec,   setShowRec]   = useState(false);

  // Dimming progressif sur 4 minutes après que le timer démarre
  useEffect(() => {
    if (sleepOption === null) return;
    const start = Date.now();
    const DUR   = 4 * 60 * 1000;
    const id = setInterval(() => {
      const factor = Math.max(0.10, 1 - ((Date.now() - start) / DUR) * 0.90);
      setDimFactor(factor);
    }, 3000);
    return () => clearInterval(id);
  }, [sleepOption]);

  const dim = sleepOption === null ? 1 : dimFactor;

  // Wake Lock (garde l'écran allumé)
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let wl: WakeLockSentinel | null = null;
    (navigator as unknown as { wakeLock: { request(t: string): Promise<WakeLockSentinel> } })
      .wakeLock.request("screen")
      .then(l => { wl = l; })
      .catch(() => {});
    return () => { wl?.release().catch(() => {}); };
  }, []);

  const isTimed = sleepOption !== null && sleepOption !== "surah" && sleepOption !== "juzz";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ background: "#020906" }}
    >
      {/* Bouton fermeture */}
      <button
        onClick={onStop}
        className="absolute right-6 top-10 rounded-full p-2"
        style={{ color: `rgba(248,244,236,${0.22 * dim})` }}
      >
        <X size={20} />
      </button>

      {/* Lune */}
      <Moon size={18} style={{ color: `rgba(212,175,55,${0.3 * dim})`, marginBottom: 24 }} />

      {/* Nom arabe */}
      <p
        style={{
          color:      `rgba(212,175,55,${0.65 * dim})`,
          fontFamily: "var(--font-amiri)",
          fontSize:   34,
          direction:  "rtl",
          lineHeight: 1.4,
        }}
      >
        {surahNameAr}
      </p>

      {/* Sous-titre */}
      <p
        style={{
          color:      `rgba(248,244,236,${0.28 * dim})`,
          fontFamily: "var(--font-dm-sans)",
          fontSize:   11,
          marginTop:  6,
          letterSpacing: "0.06em",
        }}
      >
        {surahName} · verset {currentAyah} · Juzz {currentJuzz}
      </p>

      {/* ── Phase 1 : sélection de l'option ── */}
      {sleepOption === null && (
        <div className="mt-10 flex flex-col items-center gap-5">
          {/* Sélecteur réciteur */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowRec(v => !v)}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "rgba(212,175,55,0.55)", fontFamily: "var(--font-dm-sans)" }}
            >
              <Volume2 size={11} />
              {RECITERS.find(r => r.id === reciter)?.name ?? "Récitateur"}
            </button>
            {showRec && (
              <div className="flex flex-wrap justify-center gap-2">
                {RECITERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { onReciter(r.id); setShowRec(false); }}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{
                      borderColor: r.id === reciter ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
                      color:       r.id === reciter ? "var(--gold)" : "rgba(248,244,236,0.45)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Options timer */}
          <div className="flex flex-col items-center gap-2">
            <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-dm-sans)", fontSize: 11 }}>
              Arrêt automatique
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {(Object.keys(OPTION_LABELS) as SleepOption[]).map(opt => (
                <button
                  key={opt}
                  onClick={() => onSelect(opt)}
                  className="rounded-full border px-4 py-1.5 text-xs"
                  style={{
                    borderColor: "var(--border-gold)",
                    color:       "rgba(248,244,236,0.6)",
                    fontFamily:  "var(--font-dm-sans)",
                    background:  "rgba(255,255,255,0.03)",
                  }}
                >
                  {OPTION_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Phase 2 : timer actif ── */}
      {sleepOption !== null && (
        <div className="mt-12 flex flex-col items-center gap-3">
          {secondsLeft !== null ? (
            <p
              style={{
                color:       `rgba(248,244,236,${0.6 * dim})`,
                fontFamily:  "var(--font-dm-sans)",
                fontSize:    60,
                fontWeight:  700,
                lineHeight:  1,
                letterSpacing: "-0.02em",
              }}
            >
              {fmt(secondsLeft)}
            </p>
          ) : (
            <p style={{ color: `rgba(248,244,236,${0.22 * dim})`, fontFamily: "var(--font-dm-sans)", fontSize: 12 }}>
              {sleepOption === "surah"
                ? "Arrêt à la fin de la sourate"
                : `Arrêt à la fin du Juzz ${currentJuzz}`}
            </p>
          )}

          {isTimed && (
            <button
              onClick={onExtend}
              className="mt-5 flex items-center gap-1.5 rounded-full border px-5 py-2 text-xs"
              style={{
                borderColor: `rgba(212,175,55,${0.18 * dim})`,
                color:       `rgba(212,175,55,${0.5 * dim})`,
                fontFamily:  "var(--font-dm-sans)",
              }}
            >
              <Plus size={11} /> 15 min
            </button>
          )}
        </div>
      )}
    </div>
  );
}
