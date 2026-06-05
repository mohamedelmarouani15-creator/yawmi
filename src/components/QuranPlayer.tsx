"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";

const RECITERS = [
  { id: "Alafasy_128kbps",              name: "Mishary Alafasy"   },
  { id: "Husary_128kbps",               name: "Mahmoud Al-Husary" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdul Basit"       },
  { id: "Minshawy_Murattal_128kbps",    name: "Minshawy"          },
];

function ayahUrl(reciter: string, surah: number, ayah: number) {
  return `https://everyayah.com/data/${reciter}/${String(surah).padStart(3,"0")}${String(ayah).padStart(3,"0")}.mp3`;
}

interface Props {
  surah:             number;
  totalAyahs:        number;
  currentAyah:       number;
  onAyahChange:      (n: number) => void;
  volume?:           number;           // 0–1 pour le fondu sommeil
  defaultReciter?:   string;           // récitateur préféré mode sommeil
  onSurahComplete?:  () => void;       // appelé quand le dernier verset se termine
}

export default function QuranPlayer({
  surah, totalAyahs, currentAyah, onAyahChange,
  volume = 1, defaultReciter, onSurahComplete,
}: Props) {
  const [reciter,  setReciter]  = useState(defaultReciter ?? RECITERS[0].id);
  const [showRec,  setShowRec]  = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Applique le volume dès qu'il change (fondu progressif mode sommeil)
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  const src = ayahUrl(reciter, surah, currentAyah);

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2">
      <div className="rounded-2xl border px-4 pt-3 pb-4"
        style={{
          background:    "rgba(6,26,18,0.97)",
          backdropFilter:"blur(16px)",
          borderColor:   "var(--border-gold)",
          boxShadow:     "0 -4px 32px rgba(0,0,0,0.4)",
        }}>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Verset {currentAyah}/{totalAyahs}
          </p>
          <button onClick={() => setShowRec(v => !v)}
            aria-label={`Récitateur : ${RECITERS.find(r => r.id === reciter)?.name ?? ""} — changer`}
            aria-expanded={showRec}
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            <Volume2 size={11} />
            {RECITERS.find(r => r.id === reciter)?.name}
          </button>
        </div>

        {showRec && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {RECITERS.map(r => (
              <button key={r.id}
                onClick={() => { setReciter(r.id); setShowRec(false); }}
                className="rounded-full px-2.5 py-1 text-xs"
                style={{
                  background: reciter === r.id ? "var(--border-gold)" : "rgba(255,255,255,0.06)",
                  color:      reciter === r.id ? "var(--gold)" : "var(--text-muted)",
                  border:     `1px solid ${reciter === r.id ? "rgba(212,175,55,0.3)" : "transparent"}`,
                  fontFamily: "var(--font-dm-sans)",
                }}>
                {r.name}
              </button>
            ))}
          </div>
        )}

        <audio
          ref={audioRef}
          key={src}
          src={src}
          controls
          playsInline
          preload="auto"
          autoPlay
          className="w-full"
          style={{ height: 36, borderRadius: 10 }}
          onLoadedData={() => {
            if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, volume));
          }}
          onEnded={() => {
            if (currentAyah < totalAyahs) {
              onAyahChange(currentAyah + 1);
            } else {
              onSurahComplete?.();
            }
          }}
        />

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => currentAyah > 1 && onAyahChange(currentAyah - 1)}
            disabled={currentAyah <= 1}
            className="rounded-full border px-4 py-1.5 text-xs disabled:opacity-30"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            ← Précédent
          </button>
          <button
            onClick={() => currentAyah < totalAyahs && onAyahChange(currentAyah + 1)}
            disabled={currentAyah >= totalAyahs}
            className="rounded-full border px-4 py-1.5 text-xs disabled:opacity-30"
            style={{ borderColor: "var(--border-gold)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}
