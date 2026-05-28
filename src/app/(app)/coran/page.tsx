"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";

interface Surah { number: number; name: string; englishName: string; numberOfAyahs: number; }
interface Ayah  { number: number; text: string; numberInSurah: number; }

export default function CoranPage() {
  const [surahs,      setSurahs]      = useState<Surah[]>([]);
  const [selected,    setSelected]    = useState<number | null>(null);
  const [ayahs,       setAyahs]       = useState<Ayah[]>([]);
  const [translations,setTranslations] = useState<Ayah[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [showTrans,   setShowTrans]   = useState(false);
  const reading = storage.getReading();

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/meta")
      .then(r => r.json())
      .then(d => setSurahs(d.data.surahs.references as Surah[]));
  }, []);

  async function openSurah(n: number) {
    setSelected(n);
    setAyahs([]);
    setTranslations([]);
    setLoading(true);
    const [arRes, frRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${n}/fr.hamidullah`).then(r => r.json()),
    ]);
    setAyahs(arRes.data.ayahs);
    setTranslations(frRes.data.ayahs);
    setLoading(false);
    storage.saveReading({ surah: n, ayah: 1 });
  }

  if (selected !== null) {
    const surah = surahs.find(s => s.number === selected);
    return (
      <main className="flex flex-col gap-4 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC" }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              {surah?.englishName}
            </h1>
            <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {surah?.numberOfAyahs} versets
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowTrans(v => !v)}
              className="rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: showTrans ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
                color: showTrans ? "#D4AF37" : "rgba(248,244,236,0.4)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Traduction
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: "#D4AF37" }} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ayahs.map((ayah, i) => (
              <div
                key={ayah.numberInSurah}
                className="rounded-xl border p-4"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "rgba(5,92,63,0.5)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {ayah.numberInSurah}
                  </div>
                </div>
                <p
                  className="mt-3 text-right text-xl leading-loose"
                  style={{ color: "#F8F4EC", fontFamily: "var(--font-amiri)", direction: "rtl" }}
                >
                  {ayah.text}
                </p>
                {showTrans && translations[i] && (
                  <p
                    className="mt-2 text-sm leading-relaxed opacity-60"
                    style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {translations[i].text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">
      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Lecture
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Coran
        </h1>
      </div>

      {/* Continuer la lecture */}
      {reading.surah > 1 && (
        <button
          onClick={() => openSurah(reading.surah)}
          className="flex items-center gap-3 rounded-2xl p-5 text-left"
          style={{ background: "linear-gradient(135deg, #055C3F, #033d2a)", boxShadow: "0 8px 32px rgba(5,92,63,0.3)" }}
        >
          <BookOpen size={20} style={{ color: "#D4AF37" }} />
          <div>
            <p className="text-sm font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              Continuer la lecture
            </p>
            <p className="text-xs opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Sourate {reading.surah}
            </p>
          </div>
          <span className="ml-auto text-sm" style={{ color: "rgba(248,244,236,0.3)" }}>→</span>
        </button>
      )}

      {/* Liste sourates */}
      {surahs.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin" style={{ color: "#D4AF37" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {surahs.map(s => (
            <button
              key={s.number}
              onClick={() => openSurah(s.number)}
              className="flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
              >
                {s.number}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {s.englishName}
                </p>
                <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {s.numberOfAyahs} versets
                </p>
              </div>
              <p className="text-base" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                {s.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
