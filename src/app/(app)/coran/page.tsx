"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "@/lib/storage";
import { idbSet, idbGet, idbDel } from "@/lib/idb";
import { favorites } from "@/lib/favorites";
import { getLocalChallengeStatus, getSurahRangeForJuzz } from "@/lib/juzz-challenge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, Download, Loader2, Moon, RefreshCw, Trash2, WifiOff } from "lucide-react";
import QuranPlayer from "@/components/QuranPlayer";
import SleepModeOverlay, { type SleepOption } from "@/components/SleepModeOverlay";
import HifzMode, { getTotalMasteredCount } from "@/components/HifzMode";
import RecitationMode from "@/components/RecitationMode";
import RecitationDashboard from "@/components/RecitationDashboard";
import TajwidText, { TajwidLegend } from "@/components/TajwidText";
import QuranProgressMap from "@/components/QuranProgressMap";
import { getRecitationStats, getAllSurahStats } from "@/lib/quran-recitation";
import { gameStorage } from "@/lib/game/game-storage";
import { ageGroupToMode } from "@/hooks/useAgeMode";
import { pageVariants, itemVariants, slideUp, tapScale, springTap } from "@/lib/motion";

// ── Waqf markers renderer ─────────────────────────────────────────────────
function AyahWithWaqf({ text, fontSize }: { text: string; fontSize: number }) {
  const parts: { text: string; isWaqf: boolean }[] = [];
  let last = 0;
  const regex = /[ۖ-ۜ۞۩]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ text: text.slice(last, match.index), isWaqf: false });
    }
    parts.push({ text: match[0], isWaqf: true });
    last = match.index + 1;
  }
  if (last < text.length) parts.push({ text: text.slice(last), isWaqf: false });

  return (
    <p
      className="text-right leading-loose"
      style={{ fontSize, color: "var(--text)", fontFamily: "var(--font-amiri)", direction: "rtl" }}
    >
      {parts.map((p, i) =>
        p.isWaqf ? (
          <span key={i} style={{ color: "#f59e0b", fontSize: fontSize * 0.7, verticalAlign: "super", opacity: 0.9 }}>
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </p>
  );
}

interface Surah { number: number; name: string; englishName: string; numberOfAyahs: number; }
interface Ayah  { numberInSurah: number; text: string; }
interface QuranData { surahs: { number: number; name: string; englishName: string; numberOfAyahs: number; ayahs: Ayah[] }[] }

const IDB_AR   = "quran_ar";
const IDB_FR   = "quran_fr";   // clé générique — stocke la traduction active
const IDB_META = "quran_meta"; // cache léger : liste des 114 sourates sans ayahs

const QURAN_EDITIONS: Record<string, { key: string; label: string }> = {
  anglais:  { key: "en.pickthall",  label: "Pickthall (EN)" },
  espagnol: { key: "es.asad",       label: "Asad (ES)" },
  turc:     { key: "tr.diyanet",    label: "Diyanet (TR)" },
};

function getEdition(motherTongue: string | null): { key: string; label: string } {
  return QURAN_EDITIONS[motherTongue ?? ""] ?? { key: "fr.hamidullah", label: "Hamidullah (FR)" };
}

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

const JUZZ_FIRST_SURAH: number[] = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8,
  9, 11, 12, 15, 17, 18, 21, 23, 25, 27,
  29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
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
  const [fetchError,   setFetchError]   = useState(false);
  const settings           = storage.getSettings();
  const ageMode            = ageGroupToMode(settings.ageGroup);
  const isKids             = ageMode === "kids";
  const isElder            = ageMode === "elder";
  const edition            = getEdition(settings.motherTongue);
  const gameState          = gameStorage.get();
  const juzzChallenge      = getLocalChallengeStatus();
  const juzzRange          = getSurahRangeForJuzz(juzzChallenge.juzz);
  const quranStreak        = gameState.quranStreak        ?? 0;
  const quranBestStreak    = gameState.quranBestStreak    ?? 0;
  const quranStreakShields = gameState.quranStreakShields  ?? 0;
  // Kids et aînés voient la traduction par défaut (aide à la compréhension)
  const [showTrans, setShowTrans] = useState(isKids || isElder);
  const [offline,      setOffline]      = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [dlProgress,   setDlProgress]  = useState(0);
  const [dlConfirm,    setDlConfirm]   = useState(false);
  const [playingAyah,  setPlayingAyah] = useState(1);
  const [showPlayer,   setShowPlayer]  = useState(false);
  const [favs,         setFavs]        = useState<Set<string>>(new Set());
  const [hifzMode,       setHifzMode]      = useState(false);
  const [recitationMode,  setRecitationMode]  = useState(false);
  const [recitationGuided, setRecitationGuided] = useState(false);
  const [surahDueCount,   setSurahDueCount]   = useState(0);
  const [search,          setSearch]          = useState("");
  const [surahStats,      setSurahStats]      = useState<Map<number, { masteredCount: number; dueCount: number }>>(new Map());
  const surahRowRefs  = useRef<Map<number, HTMLDivElement>>(new Map());
  const surahListRef  = useRef<HTMLDivElement>(null);
  const [tajwidEnabled, setTajwidEnabled] = useState(!isKids);
  const [viewMode,      setViewMode]      = useState<"list" | "map">("list");

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
      // 1. Vérifier d'abord si le Coran complet est disponible offline (IDB_AR)
      const arFull = await idbGet<QuranData>(IDB_AR);
      if (arFull && arFull.surahs.length === 114) {
        setOffline(true);
        setSurahs(arFull.surahs.map(s => ({
          number: s.number, name: s.name,
          englishName: s.englishName, numberOfAyahs: s.numberOfAyahs,
        })));
        return;
      }
      // 2. Sinon, essayer le cache léger de la liste (IDB_META)
      const metaCached = await idbGet<Surah[]>(IDB_META);
      if (metaCached && metaCached.length === 114) {
        setSurahs(metaCached);
        return;
      }
      // 3. Appeler l'API meta et mettre en cache IDB_META
      try {
        const r = await fetch("https://api.alquran.cloud/v1/meta");
        const d = await r.json();
        const list = d.data.surahs.references as Surah[];
        setSurahs(list);
        setFetchError(false);
        await idbSet(IDB_META, list);
      } catch {
        setFetchError(true);
      }
    }
    load();
  }, []);

  useEffect(() => {
    getAllSurahStats().then(setSurahStats).catch(() => {});
  }, []);

  async function openSurah(n: number, mode: "read" | "recite" | "guided" = "read") {
    setSelected(n); setAyahs([]); setTranslations([]); setLoading(true); setFetchError(false);
    setRecitationMode(false);
    // Load SM-2 review count for this surah (non-blocking)
    getRecitationStats(n).then(s => setSurahDueCount(s.dueToday)).catch(() => {});
    try {
      const [arCache, frCache] = await Promise.all([idbGet<QuranData>(IDB_AR), idbGet<QuranData>(IDB_FR)]);
      if (arCache && frCache) {
        const arS = arCache.surahs.find(s => s.number === n);
        const frS = frCache.surahs.find(s => s.number === n);
        if (arS) setAyahs(arS.ayahs);
        if (frS) setTranslations(frS.ayahs);
      } else {
        // Appels via le proxy interne /api/quran (avec cache serveur)
        const [arRes, frRes] = await Promise.all([
          fetch(`/api/quran?surah=${n}&edition=quran-uthmani`).then(r => { if (!r.ok) throw new Error("proxy error"); return r.json(); }),
          fetch(`/api/quran?surah=${n}&edition=${edition.key}`).then(r => { if (!r.ok) throw new Error("proxy error"); return r.json(); }),
        ]);
        setAyahs(arRes.data.ayahs);
        setTranslations(frRes.data.ayahs);
        // Cache local IndexedDB pour offline (sourate par sourate)
        const arIdb = await idbGet<QuranData>(IDB_AR) ?? { surahs: [] };
        const frIdb = await idbGet<QuranData>(IDB_FR) ?? { surahs: [] };
        const filterOld = (d: QuranData) => ({ surahs: d.surahs.filter(s => s.number !== n) });
        await Promise.all([
          idbSet(IDB_AR, { surahs: [...filterOld(arIdb).surahs, arRes.data] }),
          idbSet(IDB_FR, { surahs: [...filterOld(frIdb).surahs, frRes.data] }),
        ]);
      }
    } catch {
      setFetchError(true);
    }
    setLoading(false);
    storage.saveReading({ surah: n, ayah: 1 });
    if (mode === "recite") { setRecitationGuided(false); setRecitationMode(true); }
    if (mode === "guided") { setRecitationGuided(true);  setRecitationMode(true); }
  }

  async function downloadOffline() {
    setDownloading(true); setDlProgress(5);
    try {
      // Téléchargement complet : on passe par l'API externe directement (pas de proxy pour le Coran entier)
      const [arRes, frRes] = await Promise.all([
        fetch("https://api.alquran.cloud/v1/quran/quran-uthmani").then(r => r.json()),
        fetch(`https://api.alquran.cloud/v1/quran/${edition.key}`).then(r => r.json()),
      ]);
      setDlProgress(80);
      const metaList: Surah[] = arRes.data.surahs.map((s: QuranData["surahs"][number]) => ({
        number: s.number, name: s.name, englishName: s.englishName, numberOfAyahs: s.numberOfAyahs,
      }));
      await Promise.all([
        idbSet(IDB_AR, arRes.data),
        idbSet(IDB_FR, frRes.data),
        idbSet(IDB_META, metaList),
      ]);
      setDlProgress(100);
      setOffline(true);
      setSurahs(metaList);
    } catch { /* erreur réseau */ }
    setDownloading(false);
  }

  async function deleteOffline() {
    await Promise.all([idbDel(IDB_AR), idbDel(IDB_FR)]);
    setOffline(false);
  }

  /* ── Hifz mastered callback ──────────────────────────────────── */
  const handleHifzMastered = useCallback((totalMastered: number) => {
    // Unlock achievement "hafiz_start" on first ever mastered ayah
    if (totalMastered >= 1) {
      const state = gameStorage.get();
      if (!state.achievements.includes("hafiz_start")) {
        gameStorage.unlockAchievement("hafiz_start");
        gameStorage.push().catch(() => {/* non-blocking */});
      }
    }
  }, []);

  /* ── Vue sourate ─────────────────────────────────────────────── */
  if (selected !== null) {
    const surah      = surahs.find(s => s.number === selected);
    const currentJuzz = getJuzz(selected, playingAyah);

    return (
      <motion.main
        key={`surah-${selected}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-4 px-5 pt-12 pb-4"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <button onClick={() => setSelected(null)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)" }}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {surah?.englishName}
            </h1>
            <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {surah?.numberOfAyahs} versets · Juzz {currentJuzz}
              {surahDueCount > 0 && (
                <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                  {surahDueCount} à réviser
                </span>
              )}
            </p>
          </div>
          <p className="text-xl shrink-0" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
            {surah?.name}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => setShowTrans(v => !v)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              borderColor: showTrans ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
              color: showTrans ? "var(--gold)" : "rgba(248,244,236,0.4)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            Traduction
          </button>

          <button onClick={() => { setShowPlayer(v => !v); setPlayingAyah(1); }}
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              borderColor: showPlayer ? "rgba(212,175,55,0.4)" : "var(--border-primary)",
              color: showPlayer ? "var(--gold)" : "var(--text)",
              background: showPlayer ? "rgba(212,175,55,0.1)" : "rgba(5,92,63,0.3)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            {showPlayer ? "⏹" : "▶"} Audio
          </button>

          {ayahs.length > 0 && (
            <button onClick={() => setHifzMode(true)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "rgba(212,175,55,0.3)", color: "var(--gold)", background: "rgba(212,175,55,0.07)", fontFamily: "var(--font-dm-sans)" }}>
              Mémoriser
            </button>
          )}

          {ayahs.length > 0 && (
            <button onClick={() => { setRecitationGuided(false); setRecitationMode(true); }}
              className="shrink-0 flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "rgba(5,92,63,0.6)", color: "var(--primary)", background: "rgba(5,92,63,0.12)", fontFamily: "var(--font-dm-sans)" }}>
              🎙 Réciter
            </button>
          )}

          {ayahs.length > 0 && (
            <button onClick={() => { setRecitationGuided(true); setRecitationMode(true); }}
              className="shrink-0 flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "rgba(212,175,55,0.4)", color: "var(--gold)", background: "rgba(212,175,55,0.06)", fontFamily: "var(--font-dm-sans)" }}>
              📚 Guidé
            </button>
          )}

          {!isKids && (
            <button onClick={() => { setNightMode(true); setShowPlayer(true); setSleepOption(null); }}
              className="shrink-0 flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "rgba(212,175,55,0.25)", color: "rgba(212,175,55,0.7)", background: "rgba(0,0,0,0.3)", fontFamily: "var(--font-dm-sans)" }}>
              <Moon size={11} /> Dormir
            </button>
          )}

          {!isKids && (
            <button onClick={() => setTajwidEnabled(v => !v)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{
                borderColor: tajwidEnabled ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
                color: tajwidEnabled ? "var(--gold)" : "rgba(248,244,236,0.4)",
                background: tajwidEnabled ? "rgba(212,175,55,0.07)" : "transparent",
                fontFamily: "var(--font-dm-sans)",
              }}>
              Tajwid
            </button>
          )}
        </motion.div>

        {fetchError ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
            <WifiOff size={40} style={{ color: "rgba(248,244,236,0.2)" }} />
            <p className="text-base font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Contenu Coran indisponible hors-ligne
            </p>
            <p className="text-sm opacity-50 leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Consulte Quran.com ou télécharge l&apos;app Coran+
            </p>
            <button
              onClick={() => openSurah(selected!)}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "rgba(212,175,55,0.4)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        ) : loading ? (
          /* ── Micro-animation 1 : skeleton shimmer au chargement d'une sourate ── */
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-3"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border p-4"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              >
                {/* Ayah number skeleton */}
                <div
                  className="mb-3 h-6 w-6 rounded-full"
                  style={{ background: "rgba(212,175,55,0.07)", animation: "shimmer 1.5s infinite" }}
                />
                {/* Arabic text skeleton — 3 lines decreasing width */}
                {[100, 85, 60].map((w, j) => (
                  <div
                    key={j}
                    className="mb-2 h-5 rounded-lg"
                    style={{
                      width: `${w}%`,
                      background: "rgba(255,255,255,0.05)",
                      animation: `shimmer 1.5s infinite ${j * 0.15}s`,
                      marginLeft: "auto",
                    }}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
            initial="initial"
            animate="animate"
            className={`flex flex-col gap-4 ${showPlayer ? "pb-36" : ""}`}
          >
            {/* Bismillah — toutes les sourates sauf Al-Fatiha (1) et At-Tawbah (9) */}
            {selected !== 1 && selected !== 9 && (
              <motion.div
                variants={slideUp}
                className="text-center py-4"
              >
                <p style={{
                  fontFamily: "var(--font-amiri)",
                  fontSize: isKids || isElder ? 28 : 24,
                  color: "var(--gold)",
                  direction: "rtl",
                  letterSpacing: "0.02em",
                  lineHeight: 1.9,
                  opacity: 0.85,
                }}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <div className="mt-3 mx-auto" style={{ width: 60, height: 1, background: "rgba(212,175,55,0.2)" }} />
              </motion.div>
            )}
            {ayahs.map((ayah, i) => {
              const isPlaying = showPlayer && playingAyah === ayah.numberInSurah;
              return (
                /* ── Micro-animation 2 : changement de verset en lecture ── */
                <motion.div
                  key={ayah.numberInSurah}
                  variants={itemVariants}
                  animate={isPlaying
                    ? { scale: 1.01, transition: { duration: 0.25, ease: "easeOut" } }
                    : { scale: 1,    transition: { duration: 0.2 } }
                  }
                  className="rounded-xl border p-4"
                  style={{
                    background:  isPlaying ? "rgba(5,92,63,0.2)"    : "rgba(255,255,255,0.02)",
                    borderColor: isPlaying ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
                    // Subtle left glow on active verse
                    boxShadow:   isPlaying ? "0 0 0 1px rgba(212,175,55,0.12), 0 4px 24px rgba(5,92,63,0.18)" : "none",
                    transition:  "background 0.4s, border-color 0.4s, box-shadow 0.4s",
                  }}
                >
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
                  {/* ── Tajwid-aware text renderer / Waqf markers fallback ── */}
                  {tajwidEnabled ? (
                    <TajwidText
                      text={ayah.text}
                      fontSize={isKids || isElder ? 26 : 21}
                      enabled={tajwidEnabled}
                      className="mt-3"
                    />
                  ) : (
                    <div className="mt-3">
                      <AyahWithWaqf
                        text={ayah.text}
                        fontSize={isKids || isElder ? 26 : 21}
                      />
                    </div>
                  )}
                  {/* Tajwid legend under each verse when enabled */}
                  {tajwidEnabled && !isKids && (
                    <TajwidLegend text={ayah.text} isElder={isElder} />
                  )}
                  {showTrans && translations[i] && (
                    <p className="mt-2 leading-relaxed opacity-60"
                      style={{ fontSize: isElder ? 15 : 14, color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                      {translations[i].text}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
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

        {/* ── Overlay Mode Hifz ────────────────────────────────── */}
        <AnimatePresence>
          {hifzMode && ayahs.length > 0 && (
            <HifzMode
              surahNumber={selected}
              surahName={surah?.englishName ?? ""}
              ayahs={ayahs}
              translations={translations}
              startIndex={0}
              fontSize={isKids || isElder ? 26 : 21}
              onClose={() => setHifzMode(false)}
              onMastered={handleHifzMastered}
            />
          )}
        </AnimatePresence>

        {/* ── Overlay Récitation guidée ─────────────────────────── */}
        <AnimatePresence>
          {recitationMode && ayahs.length > 0 && (
            <RecitationMode
              surahNumber={selected}
              surahName={surah?.englishName ?? ""}
              surahNameAr={surah?.name ?? ""}
              ayahs={ayahs}
              translations={translations}
              startIndex={0}
              guided={recitationGuided}
              onClose={() => setRecitationMode(false)}
            />
          )}
        </AnimatePresence>
      </motion.main>
    );
  }

  /* ── Vue liste ───────────────────────────────────────────────── */
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {isKids ? "📖 Le livre d'Allah" : "Lecture"}
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Coran
          </h1>
        </div>
        <div className="flex items-center gap-2">
        {/* Toggle Carte / Liste */}
        {surahs.length > 0 && (
          <div className="flex rounded-full border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => setViewMode("list")}
              className="px-3 py-1.5 text-xs font-semibold"
              style={{
                background: viewMode === "list" ? "rgba(5,92,63,0.5)" : "transparent",
                color: viewMode === "list" ? "var(--gold)" : "rgba(248,244,236,0.3)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode("map")}
              className="px-3 py-1.5 text-xs font-semibold"
              style={{
                background: viewMode === "map" ? "rgba(5,92,63,0.5)" : "transparent",
                color: viewMode === "map" ? "var(--gold)" : "rgba(248,244,236,0.3)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Carte
            </button>
          </div>
        )}
        {!isKids && offline ? (
          <button onClick={deleteOffline}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
            style={{ borderColor: "var(--border-primary)", color: "var(--primary)", fontFamily: "var(--font-dm-sans)" }}>
            <WifiOff size={11} /> Hors-ligne <Trash2 size={11} />
          </button>
        ) : !isKids && (
          dlConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                ~12 Mo · {edition.label}
              </span>
              <button onClick={() => { setDlConfirm(false); downloadOffline(); }} disabled={downloading}
                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs"
                style={{ borderColor: "rgba(212,175,55,0.5)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                <Download size={11} /> Confirmer
              </button>
              <button onClick={() => setDlConfirm(false)} className="text-xs opacity-40" style={{ color: "var(--text)" }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setDlConfirm(true)} disabled={downloading}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs disabled:opacity-50"
              style={{ borderColor: "rgba(212,175,55,0.3)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              {downloading
                ? <><Loader2 size={11} className="animate-spin" /> {dlProgress}%</>
                : <><Download size={11} /> Hors-ligne</>}
            </button>
          )
        )}
        </div>
      </div>

      {/* ── Recitation dashboard (hidden for kids) ───────────────── */}
      {!isKids && (
        <RecitationDashboard
          onScrollToList={() => surahListRef.current?.scrollIntoView({ behavior: "smooth" })}
        />
      )}

      {downloading && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${dlProgress}%`, background: "var(--gradient-bar)" }} />
        </div>
      )}

      {/* Streak récitation */}
      {quranStreak > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: "rgba(212,175,55,0.15)", background: "rgba(5,92,63,0.08)" }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {quranStreak} jour{quranStreak > 1 ? "s" : ""} de récitation
            </p>
            {quranBestStreak > quranStreak && (
              <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Record : {quranBestStreak} jours
              </p>
            )}
          </div>
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} style={{ fontSize: 16, opacity: i < quranStreakShields ? 1 : 0.15 }}>🛡️</span>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Sourate, numéro ou nom arabe…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-2xl border px-4 py-3 pr-10 text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: search ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)",
            color: "var(--text)",
            fontFamily: "var(--font-dm-sans)",
          }}
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
            style={{ color: "var(--text)" }}>
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {JUZZ_FIRST_SURAH.map((_, idx) => (
          <button
            key={idx + 1}
            onClick={() => {
              const targetSurah = JUZZ_FIRST_SURAH[idx];
              const el = surahRowRefs.current.get(targetSurah);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              borderColor: "rgba(212,175,55,0.2)",
              color: "rgba(212,175,55,0.6)",
              background: "rgba(212,175,55,0.04)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            J{idx + 1}
          </button>
        ))}
      </div>

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

      {/* ── Challenge Juzz du Jour ────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4"
        style={{
          background: juzzChallenge.completed
            ? "linear-gradient(135deg, rgba(5,92,63,0.25), rgba(34,197,94,0.1))"
            : "linear-gradient(135deg, rgba(5,92,63,0.15), rgba(212,175,55,0.07))",
          borderColor: juzzChallenge.completed
            ? "rgba(34,197,94,0.3)"
            : "rgba(212,175,55,0.2)",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs uppercase tracking-widest opacity-50"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Challenge du jour
          </p>
          {juzzChallenge.completed && (
            <span className="text-xs font-bold" style={{ color: "#22c55e", fontFamily: "var(--font-dm-sans)" }}>
              ✓ Complété
            </span>
          )}
        </div>
        <p className="font-bold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          Juzz {juzzChallenge.juzz} · Sourates {juzzRange.first}–{juzzRange.last}
        </p>
        <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {juzzChallenge.completed
            ? "+20 XP · +5 pièces gagnés"
            : `${juzzChallenge.ayahsToday}/5 versets · Récite pour débloquer +20 XP`}
        </p>
        {!juzzChallenge.completed && (
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(juzzChallenge.ayahsToday / 5 * 100, 100)}%`,
                background: "var(--gradient-bar)",
              }}
            />
          </div>
        )}
      </div>

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
        fetchError ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
            <WifiOff size={40} style={{ color: "rgba(248,244,236,0.2)" }} />
            <p className="text-base font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Contenu Coran temporairement indisponible
            </p>
            <p className="text-sm opacity-50 leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Vérifiez votre connexion. Consulte Quran.com ou télécharge l&apos;app Coran+
            </p>
            <button
              onClick={() => { setFetchError(false); window.location.reload(); }}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "rgba(212,175,55,0.4)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--gold)" }} />
            <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Chargement…
            </p>
          </div>
        )
      ) : viewMode === "map" ? (
        <QuranProgressMap
          surahs={surahs.map(s => ({
            ...s,
            masteredCount: surahStats.get(s.number)?.masteredCount ?? 0,
            dueCount:      surahStats.get(s.number)?.dueCount      ?? 0,
          }))}
          onSelect={(n) => openSurah(n)}
        />
      ) : (
        <div ref={surahListRef} className="flex flex-col gap-2">
          {(() => {
            const filteredSurahs = search.trim()
              ? surahs.filter(s =>
                  s.number.toString().includes(search.trim()) ||
                  s.englishName.toLowerCase().includes(search.trim().toLowerCase()) ||
                  s.name.includes(search.trim())
                )
              : surahs;
            return filteredSurahs.map(s => (
            <div key={s.number}
              ref={el => { if (el) surahRowRefs.current.set(s.number, el); }}
              className="flex items-center gap-2 rounded-xl border"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              {/* Main tap area — opens for reading */}
              <button
                onClick={() => openSurah(s.number)}
                className="flex flex-1 items-center gap-4 px-4 py-3 text-left active:opacity-70"
              >
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{ background: "var(--border-primary)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  {s.number}
                  {/* Dot progression récitation */}
                  {(() => {
                    const stats = surahStats.get(s.number);
                    if (!stats) return null;
                    const color = stats.dueCount > 0 ? "#f59e0b" : stats.masteredCount > 0 ? "#22c55e" : null;
                    if (!color) return null;
                    return (
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: color,
                        position: "absolute", top: 2, right: 2,
                      }} />
                    );
                  })()}
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
              {/* ── Micro-animation 3 : bouton réciter (idle → press → release) ── */}
              <motion.button
                onClick={(e) => { e.stopPropagation(); openSurah(s.number, isElder ? "guided" : "recite"); }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mr-2"
                style={{ background: "rgba(5,92,63,0.15)", border: "1px solid rgba(5,92,63,0.3)" }}
                title="Pratiquer la récitation"
                whileHover={{ scale: 1.08, background: "rgba(5,92,63,0.28)" }}
                whileTap={tapScale}
                transition={springTap}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              </motion.button>
            </div>
          ));
          })()}
        </div>
      )}
    </main>
  );
}
