"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, SkipForward, SkipBack, Volume2 } from "lucide-react";

const RECITERS = [
  { id: "Alafasy_128kbps",            name: "Mishary Alafasy"     },
  { id: "Husary_128kbps",             name: "Mahmoud Al-Husary"   },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdul Basit"       },
  { id: "Minshawy_Murattal_128kbps",  name: "Minshawy"            },
];

function ayahUrl(reciter: string, surah: number, ayah: number) {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${reciter}/${s}${a}.mp3`;
}

interface Props {
  surah:     number;
  totalAyahs: number;
  currentAyah: number;
  onAyahChange: (n: number) => void;
}

export default function QuranPlayer({ surah, totalAyahs, currentAyah, onAyahChange }: Props) {
  const audioRef              = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [reciter, setReciter] = useState(RECITERS[0].id);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showReciters, setShowReciters] = useState(false);

  const src = ayahUrl(reciter, surah, currentAyah);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = src;
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [src]); // eslint-disable-line

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime  = () => setProgress(audio.currentTime);
    const onMeta  = () => setDuration(audio.duration);
    const onEnd   = () => {
      if (currentAyah < totalAyahs) onAyahChange(currentAyah + 1);
      else setPlaying(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [currentAyah, totalAyahs, onAyahChange]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { await audio.play(); setPlaying(true); }
  }, [playing]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = t;
    setProgress(t);
  };

  const prev = () => { if (currentAyah > 1) onAyahChange(currentAyah - 1); };
  const next = () => { if (currentAyah < totalAyahs) onAyahChange(currentAyah + 1); };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2">
      <div
        className="rounded-2xl border px-4 py-3"
        style={{
          background: "rgba(6,26,18,0.97)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(212,175,55,0.2)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Verset + reciteur */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Verset {currentAyah}/{totalAyahs}
          </p>
          <button
            onClick={() => setShowReciters(v => !v)}
            className="flex items-center gap-1 text-xs"
            style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
          >
            <Volume2 size={11} />
            {RECITERS.find(r => r.id === reciter)?.name}
          </button>
        </div>

        {/* Sélecteur reciteur */}
        {showReciters && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {RECITERS.map(r => (
              <button key={r.id}
                onClick={() => { setReciter(r.id); setShowReciters(false); }}
                className="rounded-full px-2.5 py-1 text-xs transition-all"
                style={{
                  background: reciter === r.id ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.04)",
                  color: reciter === r.id ? "#D4AF37" : "rgba(248,244,236,0.5)",
                  border: `1px solid ${reciter === r.id ? "rgba(212,175,55,0.3)" : "transparent"}`,
                  fontFamily: "var(--font-dm-sans)",
                }}>
                {r.name}
              </button>
            ))}
          </div>
        )}

        {/* Barre de progression */}
        <input type="range" min="0" max="100" value={pct} onChange={seek}
          className="mb-3 w-full accent-yellow-500"
          style={{ height: 3, cursor: "pointer", accentColor: "#D4AF37" }} />

        {/* Contrôles */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={prev} disabled={currentAyah <= 1}
            className="opacity-50 disabled:opacity-20 transition-opacity"
            style={{ color: "#F8F4EC" }}>
            <SkipBack size={20} />
          </button>

          <button onClick={toggle}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #055C3F, #0a8a5e)", boxShadow: "0 0 20px rgba(5,92,63,0.4)" }}>
            {playing
              ? <Pause size={18} fill="#F8F4EC" style={{ color: "#F8F4EC" }} />
              : <Play  size={18} fill="#F8F4EC" style={{ color: "#F8F4EC", marginLeft: 2 }} />
            }
          </button>

          <button onClick={next} disabled={currentAyah >= totalAyahs}
            className="opacity-50 disabled:opacity-20 transition-opacity"
            style={{ color: "#F8F4EC" }}>
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      <audio ref={audioRef} preload="auto" />
    </div>
  );
}
