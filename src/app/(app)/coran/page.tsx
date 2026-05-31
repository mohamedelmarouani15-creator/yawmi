"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "@/lib/storage";
import { idbSet, idbGet, idbDel } from "@/lib/idb";
import { favorites } from "@/lib/favorites";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, Download, Loader2, Moon, Trash2, WifiOff } from "lucide-react";
import QuranPlayer from "@/components/QuranPlayer";
import SleepModeOverlay, { type SleepOption } from "@/components/SleepModeOverlay";

interface Surah { number: number; name: string; englishName: string; numberOfAyahs: number; }
interface Ayah  { numberInSurah: number; text: string; }
interface QuranData { surahs: { number: number; name: string; englishName: string; numberOfAyahs: number; ayahs: Ayah[] }[] }

const IDB_AR = "quran_ar";
const IDB_FR = "quran_fr";

// ── Données Juzz (fin de chaque juzz : sourate + dernier verset) ──
const JUZZ_ENDS: { surah: number; ayah: number }[] = [
  { surah:   2, ayah: 141 }, // Juzz 1
  { surah:   2, ayah: 252 }, // Juzz 2
  { surah:   3, ayah:  92 }, // Juzz 3
  { surah:   4, ayah:  23 }, // Juzz 4
  { surah:   4, ayah: 147 }, // Juzz 5
  { surah:   5, ayah:  81 }, // Juzz 6
  { surah:   6, ayah: 110 }, // Juzz 7
  { surah:   7, ayah:  87 }, // Juzz 8
  { surah:   8, ayah:  40 }, // Juzz 9
  { surah:   9, ayah:  92 }, // Juzz 10
  { surah:  11, ayah:   5 }, // Juzz 11
  { surah:  12, ayah:  52 }, // Juzz 12
  { surah:  14, ayah:  52 }, // Juzz 13
  { surah:  16, ayah: 128 }, // Juzz 14
  { surah:  18, ayah:  74 }, // Juzz 15
  { surah:  20, ayah: 135 }, // Juzz 16
  { surah:  22, ayah:  78 }, // Juzz 17
  { surah:  25, ayah:  20 }, // Juzz 18
  { surah:  27, ayah:  55 }, // Juzz 19
  { surah:  29, ayah:  45 }, // Juzz 20
  { surah:  33, ayah:  30 }, // Juzz 21
  { surah:  36, ayah:  27 }, // Juzz 22
  { surah:  39, ayah:  31 }, // Juzz 23
  { surah:  41, ayah:  46 }, // Juzz 24
  { surah:  45, ayah:  37 }, // Juzz 25
  { surah:  51, ayah:  30 }, // Juzz 26
  { surah:  57, ayah:  29 }, // Juzz 27
  { surah:  66, ayah:  12 }, // Juzz 28
  { surah:  77, ayah:  50 }, // Juzz 29
  { surah: 114, ayah:   6 }, // Juzz 30
];

function getJuzz(surah: number, ayah: number): number {
  for (let i = 0; i < JUZZ_ENDS.length; i++) {
    const e = JUZZ_ENDS[i];
    if (surah < e.surah || (surah === e.surah && ayah <= e.ayah)) return i + 1;
  }
  return 30;
}

export default function CoranPage() {
  const [surahs,       setSurahs]       = useState<Surah[]>([]);
  const [selected,     setSelected]     = useState<number | null>(null);
  const [ayahs,        setAyahs]        = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Ayah[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [showTrans,    setShowTrans]    = useState(false);
  const [offline,      setOffline]      = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [dlProgress,   setDlProgress]  = useState(0);
  const [playingAyah,  setPlayingAyah] = useState(1);
  const [showPlayer,   setShowPlayer]  = useState(false);
  const [favs,         setFavs]        = useState<Set<string>>(new Set());

  // ── Mode sommeil ──────────────────────────────────────────────
  const [nightMode,    setNightMode]   = useState(false);
  const [sleepOption,  setSleepOption] = useState<SleepOption | null>(null);
  const [secondsLeft,  setSecondsLeft] = useState<number | null>(null);
  const [sleepVolume,  setSleepVolume] = useState(1);
  const [sleepReciter, setSleepReciter] = useState(
    () => storage.getSettings().sleepReciter ?? "Husary_128kbps"
  );

  const sleepIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const sleepTotalRef      = useRef(0);
  const sleepStartTimeRef  = useRef(0);

  const reading = storage.getReading();

  // ── Fondu rapide puis arrêt ───────────────────────────────────
  const triggerSleepStop = useCallback(() => {
    let vol = 1;
    const fadeId = setInterval(() => {
      vol = Math.max(0, vol - 0.05);
      setSleepVolume(vol);
      if (vol <= 0) {
        clearInterval(fadeId);
        setNightMode(false);
        setSleepOption(null);
        setSecondsLeft(null);
        setSleepVolume(1);
        setShowPlayer(false);
        if (sleepIntervalRef.current) {
          clearInterval(sleepIntervalRef.current);
          sleepIntervalRef.current = null;
        }
      }
    }, 50);
  }, []);

  const exitSleepMode = useCallback(() => {
    setNightMode(false);
    setSleepOption(null);
    setSecondsLeft(null);
    setSleepVolume(1);
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
  }, []);

  function startSleepTimer(opt: SleepOption) {
    setSleepOption(opt);
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }

    const minutes = parseInt(opt);
    if (isNaN(minutes)) {
      // "surah" ou "juzz" — pas de compte à rebours
      setSecondsLeft(null);
      setSleepVolume(1);
      return;
    }

    sleepTotalRef.current     = minutes * 60;
    sleepStartTimeRef.current = Date.now();
    setSecondsLeft(sleepTotalRef.current);
    setSleepVolume(1);

    sleepIntervalRef.current = setInterval(() => {
      const elapsed    = Math.floor((Date.now() - sleepStartTimeRef.current) / 1000);
      const remaining  = Math.max(0, sleepTotalRef.current - elapsed);
      setSecondsLeft(remaining);

      // Fondu progressif les 30 dernières secondes
      if (remaining <= 30) {
        setSleepVolume(remaining > 0 ? remaining / 30 : 0);
      } else {
        setSleepVolume(1);
      }

      if (remaining <= 0) {
        clearInterval(sleepIntervalRef.current!);
        sleepIntervalRef.current = null;
        setNightMode(false);
        setSleepOption(null);
        setSecondsLeft(null);
        setSleepVolume(1);
        setShowPlayer(false);
      }
    }, 1000);
  }

  function extendTimer() {
    sleepTotalRef.current += 15 * 60;
    setSleepVolume(1);
  }

  function handleSleepReciter(id: string) {
    setSleepReciter(id);
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, sleepReciter: id });
  }

  // ── Changement de verset avec vérification mode juzz ─────────
  function handleAyahChange(nextAyah: number) {
    // Vérification fin du Juzz (le verset qui vient de se terminer = nextAyah-1)
    if (nightMode && sleepOption === "juzz" && selected !== null) {
      const justPlayed = nextAyah - 1;
      const juzz       = getJuzz(selected, justPlayed);
      const juzzEnd    = JUZZ_ENDS[juzz - 1];
      if (selected === juzzEnd.surah && justPlayed >= juzzEnd.ayah) {
        triggerSleepStop();
        return;
      }
    }
    setPlayingAyah(nextAyah);
  }

  function handleSurahComplete() {
    if (nightMode && (sleepOption === "surah" || sleepOption === "juzz")) {
      triggerSleepStop();
    }
  }

  // Nettoyage à la sortie
  useEffect(() => () => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
  }, []);

  useEffect(() => {
    const all = favorites.getAll();
    setFavs(new Set(all.map(f => `${f.surah}-${f.ayah}`)));
  }, [selected]);

  const toggleFav = useCallback((surahNum: number, surahName: string, ayahNum: number, text: string) => {
    const key = `${surahNum}-${ayahNum}`;
    if (favs.has(key)) {
      favorites.remove(surahNum, ayahNum);
      setFavs(prev => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      favorites.add({ surah: surahNum, surahName, ayah: ayahNum, text });
      setFavs(prev => new Set(prev).add(key));
    }
  }, [favs]);

  useEffect(() => {
    async function load() {
      const cached = await idbGet<QuranData>(IDB_AR);
      if (cached) {
        setOffline(true);
        setSurahs(cached.surahs.map(s => ({
          number: s.number, name: s.name,
          englishName: s.englishName, numberOfAyahs: s.numberOfAyahs,
        })));
        return;
      }
      try {
        const r = await fetch("https://api.alquran.cloud/v1/meta");
        const d = await r.json();
        setSurahs(d.data.surahs.references as Surah[]);
      } catch { /* offline sans cache */ }
    }
    load();
  }, []);

  async function openSurah(n: number) {
    setSelected(n); setAyahs([]); setTranslations([]); setLoading(true);
    try {
      const [arCache, frCache] = await Promise.all([idbGet<QuranData>(IDB_AR), idbGet<QuranData>(IDB_FR)]);
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
    setDownloading(true); setDlProgress(5);
    try {
      const [arRes, frRes] = await Promise.all([
        fetch("https://api.alquran.cloud/v1/quran/quran-uthmani").then(r => r.json()),
        fetch("https://api.alquran.cloud/v1/quran/fr.hamidullah").then(r => r.json()),
      ]);
      setDlProgress(80);
      await Promise.all([idbSet(IDB_AR, arRes.data), idbSet(IDB_FR, frRes.data)]);
      setDlProgress(100);
      setOffline(true);
      setSurahs(arRes.data.surahs.map((s: QuranData["surahs"][number]) => ({
        number: s.number, name: s.name, englishName: s.englishName, numberOfAyahs: s.numberOfAyahs,
      })));
    } catch { /* erreur réseau */ }
    setDownloading(false);
  }

  async function deleteOffline() {
    await Promise.all([idbDel(IDB_AR), idbDel(IDB_FR)]);
    setOffline(false);
  }

  /* ── Vue sourate ─────────────────────────────────────────────── */
  if (selected !== null) {
    const surah      = surahs.find(s => s.number === selected);
    const currentJuzz = getJuzz(selected, playingAyah);

    return (
      <main className="flex flex-col gap-4 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)" }}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {surah?.englishName}
            </h1>
            <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {surah?.numberOfAyahs} versets · Juzz {currentJuzz}
            </p>
          </div>
          <button onClick={() => setShowTrans(v => !v)}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: showTrans ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
              color: showTrans ? "var(--gold)" : "rgba(248,244,236,0.4)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            Traduction
          </button>
          <button
            onClick={() => { setShowPlayer(v => !v); setPlayingAyah(1); }}
            className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              borderColor: showPlayer ? "rgba(212,175,55,0.4)" : "var(--border-primary)",
              color:  showPlayer ? "var(--gold)" : "var(--text)",
              background: showPlayer ? "rgba(212,175,55,0.1)" : "rgba(5,92,63,0.3)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            {showPlayer ? "⏹" : "▶"} Audio
          </button>

          {/* Bouton Mode Sommeil */}
          <button
            onClick={() => { setNightMode(true); setShowPlayer(true); setSleepOption(null); }}
            className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              borderColor: "rgba(212,175,55,0.25)",
              color:       "rgba(212,175,55,0.7)",
              background:  "rgba(0,0,0,0.3)",
              fontFamily:  "var(--font-dm-sans)",
            }}>
            <Moon size={11} /> Dormir
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--gold)" }} />
          </div>
        ) : (
          <div className={`flex flex-col gap-4 ${showPlayer ? "pb-36" : ""}`}>
            {ayahs.map((ayah, i) => (
              <div key={ayah.numberInSurah}
                className="rounded-xl border p-4 transition-all"
                style={{
                  background:  showPlayer && playingAyah === ayah.numberInSurah ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
                  borderColor: showPlayer && playingAyah === ayah.numberInSurah ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "rgba(5,92,63,0.5)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                    {ayah.numberInSurah}
                  </div>
                  <div className="flex items-center gap-2">
                    {showPlayer && (
                      <button onClick={() => setPlayingAyah(ayah.numberInSurah)}
                        className="text-xs opacity-40" style={{ color: "var(--gold)" }}>▶</button>
                    )}
                    <button onClick={() => toggleFav(selected!, surah?.englishName ?? "", ayah.numberInSurah, ayah.text)}
                      style={{ color: favs.has(`${selected}-${ayah.numberInSurah}`) ? "var(--gold)" : "rgba(255,255,255,0.2)" }}>
                      {favs.has(`${selected}-${ayah.numberInSurah}`)
                        ? <BookmarkCheck size={15} />
                        : <Bookmark size={15} />}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-right text-xl leading-loose"
                  style={{ color: "var(--text)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                  {ayah.text}
                </p>
                {showTrans && translations[i] && (
                  <p className="mt-2 text-sm leading-relaxed opacity-60"
                    style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {translations[i].text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {showPlayer && (
          <QuranPlayer
            surah={selected}
            totalAyahs={surah?.numberOfAyahs ?? 1}
            currentAyah={playingAyah}
            onAyahChange={handleAyahChange}
            volume={sleepVolume}
            defaultReciter={nightMode ? sleepReciter : undefined}
            onSurahComplete={handleSurahComplete}
          />
        )}

        {/* ── Overlay Mode Sommeil ─────────────────────────────── */}
        {nightMode && (
          <SleepModeOverlay
            surahName={surah?.englishName ?? ""}
            surahNameAr={surah?.name ?? ""}
            currentAyah={playingAyah}
            currentJuzz={currentJuzz}
            sleepOption={sleepOption}
            secondsLeft={secondsLeft}
            reciter={sleepReciter}
            onReciter={handleSleepReciter}
            onSelect={startSleepTimer}
            onExtend={extendTimer}
            onStop={exitSleepMode}
          />
        )}
      </main>
    );
  }

  /* ── Vue liste ───────────────────────────────────────────────── */
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Lecture
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Coran
          </h1>
        </div>
        {offline ? (
          <button onClick={deleteOffline}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
            style={{ borderColor: "var(--border-primary)", color: "var(--primary)", fontFamily: "var(--font-dm-sans)" }}>
            <WifiOff size={11} /> Hors-ligne <Trash2 size={11} />
          </button>
        ) : (
          <button onClick={downloadOffline} disabled={downloading}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs disabled:opacity-50"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            {downloading
              ? <><Loader2 size={11} className="animate-spin" /> {dlProgress}%</>
              : <><Download size={11} /> Hors-ligne</>}
          </button>
        )}
      </div>

      {downloading && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${dlProgress}%`, background: "var(--gradient-bar)" }} />
        </div>
      )}

      {(() => {
        const favList = favorites.getAll();
        if (!favList.length) return null;
        return (
          <div>
            <p className="mb-2 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Favoris · {favList.length} verset{favList.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-2">
              {favList.slice(0, 3).map(f => (
                <button key={`${f.surah}-${f.ayah}`} onClick={() => openSurah(f.surah)}
                  className="rounded-xl border p-3 text-right active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--gold-faint)" }}>
                  <p className="text-xs opacity-40 text-left mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {f.surahName} · verset {f.ayah}
                  </p>
                  <p className="text-base leading-loose line-clamp-2"
                    style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                    {f.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {reading.surah > 1 && (
        <button onClick={() => openSurah(reading.surah)}
          className="flex items-center gap-3 rounded-2xl p-5 text-left"
          style={{ background: "linear-gradient(135deg, #055C3F, #033d2a)", boxShadow: "0 8px 32px rgba(5,92,63,0.3)" }}>
          <BookOpen size={20} style={{ color: "var(--gold)" }} />
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Continuer la lecture
            </p>
            <p className="text-xs opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Sourate {reading.surah}
            </p>
          </div>
          <span className="ml-auto text-sm" style={{ color: "var(--text-dim)" }}>→</span>
        </button>
      )}

      {surahs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--gold)" }} />
          <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Chargement…
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {surahs.map(s => (
            <button key={s.number} onClick={() => openSurah(s.number)}
              className="flex items-center gap-4 rounded-xl border px-4 py-3 text-left active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: "var(--border-primary)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                {s.number}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {s.englishName}
                </p>
                <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {s.numberOfAyahs} versets
                </p>
              </div>
              <p className="text-base" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                {s.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
