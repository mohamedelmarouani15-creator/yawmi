"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { idbSet, idbGet, idbDel } from "@/lib/idb";
import { ArrowLeft, BookOpen, Download, Loader2, Trash2, WifiOff } from "lucide-react";
import QuranPlayer from "@/components/QuranPlayer";

interface Surah { number: number; name: string; englishName: string; numberOfAyahs: number; }
interface Ayah  { numberInSurah: number; text: string; }
interface QuranData { surahs: { number: number; name: string; englishName: string; numberOfAyahs: number; ayahs: Ayah[] }[] }

const IDB_AR = "quran_ar";
const IDB_FR = "quran_fr";

export default function CoranPage() {
  const [surahs,        setSurahs]        = useState<Surah[]>([]);
  const [selected,      setSelected]      = useState<number | null>(null);
  const [ayahs,         setAyahs]         = useState<Ayah[]>([]);
  const [translations,  setTranslations]  = useState<Ayah[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [showTrans,     setShowTrans]     = useState(false);
  const [offline,       setOffline]       = useState(false);
  const [downloading,   setDownloading]   = useState(false);
  const [dlProgress,    setDlProgress]    = useState(0);
  const [playingAyah,   setPlayingAyah]   = useState(1);
  const [showPlayer,    setShowPlayer]    = useState(false);
  const reading = storage.getReading();

  // Charge la liste des sourates
  useEffect(() => {
    async function load() {
      // Essaie d'abord IndexedDB
      const cached = await idbGet<QuranData>(IDB_AR);
      if (cached) {
        setOffline(true);
        setSurahs(cached.surahs.map(s => ({
          number: s.number, name: s.name,
          englishName: s.englishName, numberOfAyahs: s.numberOfAyahs,
        })));
        return;
      }
      // Sinon API
      try {
        const r = await fetch("https://api.alquran.cloud/v1/meta");
        const d = await r.json();
        setSurahs(d.data.surahs.references as Surah[]);
      } catch { /* offline sans cache */ }
    }
    load();
  }, []);

  async function openSurah(n: number) {
    setSelected(n);
    setAyahs([]);
    setTranslations([]);
    setLoading(true);

    try {
      // Cherche d'abord dans IndexedDB
      const [arCache, frCache] = await Promise.all([
        idbGet<QuranData>(IDB_AR),
        idbGet<QuranData>(IDB_FR),
      ]);

      if (arCache && frCache) {
        const arS = arCache.surahs.find(s => s.number === n);
        const frS = frCache.surahs.find(s => s.number === n);
        if (arS) setAyahs(arS.ayahs);
        if (frS) setTranslations(frS.ayahs);
      } else {
        const [arRes, frRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`).then(r => r.json()),
          fetch(`https://api.alquran.cloud/v1/surah/${n}/fr.hamidullah`).then(r => r.json()),
        ]);
        setAyahs(arRes.data.ayahs);
        setTranslations(frRes.data.ayahs);
      }
    } catch { /* offline */ }

    setLoading(false);
    storage.saveReading({ surah: n, ayah: 1 });
  }

  async function downloadOffline() {
    setDownloading(true);
    setDlProgress(5);
    try {
      const [arRes, frRes] = await Promise.all([
        fetch("https://api.alquran.cloud/v1/quran/quran-uthmani").then(r => r.json()),
        fetch("https://api.alquran.cloud/v1/quran/fr.hamidullah").then(r => r.json()),
      ]);
      setDlProgress(80);
      await Promise.all([
        idbSet(IDB_AR, arRes.data),
        idbSet(IDB_FR, frRes.data),
      ]);
      setDlProgress(100);
      setOffline(true);
      setSurahs(arRes.data.surahs.map((s: QuranData["surahs"][number]) => ({
        number: s.number, name: s.name,
        englishName: s.englishName, numberOfAyahs: s.numberOfAyahs,
      })));
    } catch { /* erreur réseau */ }
    setDownloading(false);
  }

  async function deleteOffline() {
    await Promise.all([idbDel(IDB_AR), idbDel(IDB_FR)]);
    setOffline(false);
  }

  /* ── Vue sourate ────────────────────────────────────────────────────── */
  if (selected !== null) {
    const surah = surahs.find(s => s.number === selected);
    return (
      <main className="flex flex-col gap-4 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC" }}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              {surah?.englishName}
            </h1>
            <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {surah?.numberOfAyahs} versets
            </p>
          </div>
          <button onClick={() => setShowTrans(v => !v)}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: showTrans ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
              color: showTrans ? "#D4AF37" : "rgba(248,244,236,0.4)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            Traduction
          </button>
          <button
            onClick={() => { setShowPlayer(v => !v); setPlayingAyah(1); }}
            className="rounded-full border px-3 py-1 text-xs font-semibold transition-all"
            style={{
              borderColor: showPlayer ? "rgba(212,175,55,0.4)" : "rgba(5,92,63,0.4)",
              color: showPlayer ? "#D4AF37" : "#F8F4EC",
              background: showPlayer ? "rgba(212,175,55,0.1)" : "rgba(5,92,63,0.3)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            {showPlayer ? "⏹" : "▶"} Audio
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: "#D4AF37" }} />
          </div>
        ) : (
          <div className={`flex flex-col gap-4 ${showPlayer ? "pb-36" : ""}`}>
            {ayahs.map((ayah, i) => (
              <div key={ayah.numberInSurah}
                className="rounded-xl border p-4 transition-all"
                style={{
                  background: showPlayer && playingAyah === ayah.numberInSurah
                    ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
                  borderColor: showPlayer && playingAyah === ayah.numberInSurah
                    ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "rgba(5,92,63,0.5)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                    {ayah.numberInSurah}
                  </div>
                  {showPlayer && (
                    <button
                      onClick={() => setPlayingAyah(ayah.numberInSurah)}
                      className="text-xs opacity-40 hover:opacity-80"
                      style={{ color: "#D4AF37" }}>
                      ▶
                    </button>
                  )}
                </div>
                <p className="mt-3 text-right text-xl leading-loose"
                  style={{ color: "#F8F4EC", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                  {ayah.text}
                </p>
                {showTrans && translations[i] && (
                  <p className="mt-2 text-sm leading-relaxed opacity-60"
                    style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {translations[i].text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {showPlayer && selected !== null && (
          <QuranPlayer
            surah={selected}
            totalAyahs={surah?.numberOfAyahs ?? 1}
            currentAyah={playingAyah}
            onAyahChange={setPlayingAyah}
          />
        )}
      </main>
    );
  }

  /* ── Vue liste ──────────────────────────────────────────────────────── */
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Lecture
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Coran
          </h1>
        </div>

        {/* Badge hors-ligne / téléchargement */}
        {offline ? (
          <button onClick={deleteOffline}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
            style={{ borderColor: "rgba(5,92,63,0.4)", color: "#055C3F", fontFamily: "var(--font-dm-sans)" }}>
            <WifiOff size={11} /> Hors-ligne <Trash2 size={11} />
          </button>
        ) : (
          <button onClick={downloadOffline} disabled={downloading}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all disabled:opacity-50"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            {downloading
              ? <><Loader2 size={11} className="animate-spin" /> {dlProgress}%</>
              : <><Download size={11} /> Hors-ligne</>}
          </button>
        )}
      </div>

      {/* Barre de progression téléchargement */}
      {downloading && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${dlProgress}%`, background: "linear-gradient(to right, #055C3F, #D4AF37)" }} />
        </div>
      )}

      {/* Continuer la lecture */}
      {reading.surah > 1 && (
        <button onClick={() => openSurah(reading.surah)}
          className="flex items-center gap-3 rounded-2xl p-5 text-left"
          style={{ background: "linear-gradient(135deg, #055C3F, #033d2a)", boxShadow: "0 8px 32px rgba(5,92,63,0.3)" }}>
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
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: "#D4AF37" }} />
          <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Chargement…
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {surahs.map(s => (
            <button key={s.number} onClick={() => openSurah(s.number)}
              className="flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
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
