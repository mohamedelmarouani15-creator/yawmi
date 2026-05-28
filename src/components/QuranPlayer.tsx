"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, SkipForward, SkipBack, Volume2 } from "lucide-react";

const RECITERS = [
  { id: "Alafasy_128kbps",              name: "Mishary Alafasy"   },
  { id: "Husary_128kbps",               name: "Mahmoud Al-Husary" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdul Basit"       },
  { id: "Minshawy_Murattal_128kbps",    name: "Minshawy"          },
];

function ayahUrl(reciter: string, surah: number, ayah: number) {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${reciter}/${s}${a}.mp3`;
}

interface Props {
  surah:        number;
  totalAyahs:   number;
  currentAyah:  number;
  onAyahChange: (n: number) => void;
}

export default function QuranPlayer({ surah, totalAyahs, currentAyah, onAyahChange }: Props) {
  const audioRef                = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [reciter, setReciter]   = useState(RECITERS[0].id);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showRec,  setShowRec]  = useState(false);
  const [error,    setError]    = useState(false);

  const src = ayahUrl(reciter, surah, currentAyah);

  // Recharge quand le verset ou le réciteur change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(false);
    setProgress(0);
    audio.load();
    if (playing) {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => { setPlaying(false); setError(true); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(false);
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => { setPlaying(false); setError(true); });
    }
  }, [playing]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (parseFloat(e.target.value) / 100) * duration;
  };

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  const pct = duration ? Math.min((progress / duration) * 100, 100) : 0;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2">
      {/* playsInline est OBLIGATOIRE sur iOS pour la lecture inline dans une PWA */}
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        playsInline
        onTimeUpdate={e => setProgress((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={e => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={() => {
          if (currentAyah < totalAyahs) onAyahChange(currentAyah + 1);
          else setPlaying(false);
        }}
        onError={() => { setError(true); setPlaying(false); }}
      />

      <div className="rounded-2xl border px-4 py-3"
        style={{
          background: "rgba(6,26,18,0.97)",
          backdropFilter: "blur(16px)",
          borderColor: error ? "rgba(239,68,68,0.3)" : "rgba(212,175,55,0.2)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.4)",
        }}>

        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Verset {currentAyah}/{totalAyahs}
          </p>
          <button onClick={() => setShowRec(v => !v)}
            className="flex items-center gap-1 text-xs"
            style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            <Volume2 size={11} />
            {RECITERS.find(r => r.id === reciter)?.name}
          </button>
        </div>

        {error && (
          <p className="mb-2 text-center text-xs" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
            ⚠️ Vérifie que le son est activé (bouton sur le côté de l'iPhone)
          </p>
        )}

        {showRec && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {RECITERS.map(r => (
              <button key={r.id}
                onClick={() => { setReciter(r.id); setShowRec(false); setPlaying(false); }}
                className="rounded-full px-2.5 py-1 text-xs"
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

        <div className="mb-1 flex justify-between text-xs opacity-30"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>

        <input type="range" min="0" max="100" value={pct} onChange={seek}
          className="mb-3 w-full" style={{ height: 3, accentColor: "#D4AF37" }} />

        <div className="flex items-center justify-center gap-6">
          <button onClick={() => currentAyah > 1 && onAyahChange(currentAyah - 1)}
            className={currentAyah <= 1 ? "opacity-20" : ""} style={{ color: "#F8F4EC" }}>
            <SkipBack size={20} />
          </button>
          <button onClick={toggle}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", boxShadow: "0 0 20px rgba(5,92,63,0.4)" }}>
            {playing
              ? <Pause size={18} fill="#F8F4EC" style={{ color: "#F8F4EC" }} />
              : <Play  size={18} fill="#F8F4EC" style={{ color: "#F8F4EC", marginLeft: 2 }} />}
          </button>
          <button onClick={() => currentAyah < totalAyahs && onAyahChange(currentAyah + 1)}
            className={currentAyah >= totalAyahs ? "opacity-20" : ""} style={{ color: "#F8F4EC" }}>
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
