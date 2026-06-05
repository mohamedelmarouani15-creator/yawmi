"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, BookOpen, Moon, Heart, Star } from "lucide-react";
import Link from "next/link";
import { pageVariants, itemVariants, tapScale, springTap } from "@/lib/motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { RAMADAN_DEFIS, RAMADAN_DUAS, JUZZ_PLAN } from "@/lib/ramadan-data";
import RamadanCountdown from "@/components/ramadan/RamadanCountdown";
import { formatTime } from "@/lib/prayer";

// ── localStorage keys ─────────────────────────────────────────
const DEFIS_KEY = "yawmi_ramadan_2027_defis";
const JUZZ_KEY  = "yawmi_ramadan_juzz";

type DefisState = Record<number, { completed: boolean; completedAt: string }>;
type JuzzState  = Record<number, boolean>;

function getDefis(): DefisState {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(DEFIS_KEY) ?? "{}") as DefisState; }
  catch { return {}; }
}

function saveDefis(state: DefisState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEFIS_KEY, JSON.stringify(state));
}

function getJuzz(): JuzzState {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(JUZZ_KEY) ?? "{}") as JuzzState; }
  catch { return {}; }
}

function saveJuzz(state: JuzzState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JUZZ_KEY, JSON.stringify(state));
}

// ── Bonne action counter ──────────────────────────────────────
function getBonnesActions(): number {
  if (typeof window === "undefined") return 0;
  const prayerLog: { date: string; done: Record<string, boolean> }[] =
    JSON.parse(localStorage.getItem("yawmi_prayer_log") ?? "[]");
  const today = new Date().toISOString().split("T")[0];
  const entry = prayerLog.find(l => l.date === today);
  const prayers = entry ? Object.values(entry.done).filter(Boolean).length : 0;

  const dhikrLog: { date: string; counts: Record<string, number> }[] =
    JSON.parse(localStorage.getItem("yawmi_dhikr") ?? "[]");
  const dhikrEntry = dhikrLog.find(d => d.date === today);
  const dhikrs = dhikrEntry ? Object.keys(dhikrEntry.counts).length : 0;

  const gameState = JSON.parse(localStorage.getItem("yawmi_game_state") ?? "{}") as { stats?: { correctAnswers?: number } };
  const quizCorrect = Math.min(5, Math.floor((gameState.stats?.correctAnswers ?? 0) / 10));

  return prayers + dhikrs + quizCorrect;
}

// ── Section types ─────────────────────────────────────────────
type SectionKey = "iftar" | "defis" | "coran" | "duas" | "bonnes";

const CATEGORY_COLORS: Record<string, string> = {
  coran:        "#c084fc",
  dhikr:        "#86efac",
  acte:         "#fcd34d",
  connaissance: "#93c5fd",
  famille:      "#f9a8d4",
};

// ── Main page ─────────────────────────────────────────────────
export default function RamadanPage() {
  const { times } = usePrayerTimes();
  const [defis,        setDefis]        = useState<DefisState>({});
  const [juzz,         setJuzz]         = useState<JuzzState>({});
  const [openSection,  setOpenSection]  = useState<SectionKey | null>("iftar");
  const [bonnesActions, setBonnesActions] = useState(0);
  const [expandedDua,  setExpandedDua]  = useState<string | null>(null);

  useEffect(() => {
    setDefis(getDefis());
    setJuzz(getJuzz());
    setBonnesActions(getBonnesActions());
  }, []);

  const toggleDefi = useCallback((day: number) => {
    setDefis(prev => {
      const next = { ...prev };
      if (next[day]?.completed) {
        delete next[day];
      } else {
        next[day] = { completed: true, completedAt: new Date().toISOString() };
      }
      saveDefis(next);
      return next;
    });
  }, []);

  const toggleJuzz = useCallback((day: number) => {
    setJuzz(prev => {
      const next = { ...prev, [day]: !prev[day] };
      saveJuzz(next);
      return next;
    });
  }, []);

  const toggleSection = (key: SectionKey) =>
    setOpenSection(prev => (prev === key ? null : key));

  const defisCompleted = Object.values(defis).filter(d => d.completed).length;
  const juzzCompleted  = Object.values(juzz).filter(Boolean).length;

  const iftarTime  = times ? formatTime(times.maghrib) : "--:--";
  const suhoorTime = times ? formatTime(times.fajr)    : "--:--";

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-0 pb-8"
      style={{ minHeight: "100vh" }}
    >
      {/* ── Header Ramadan ──────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center gap-4 px-5 pt-14 pb-10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0d0320 0%, #110a2a 50%, #061A12 100%)",
        }}
      >
        {/* Stars background */}
        <StarField />

        <RamadanCountdown />

        <motion.p
          variants={itemVariants}
          className="text-center text-sm"
          style={{
            color: "rgba(192,132,252,0.55)",
            fontFamily: "var(--font-dm-sans)",
            maxWidth: 280,
            lineHeight: 1.6,
          }}
        >
          Un mois de grâce, de purification et de rapprochement.
          Que ce Ramadan soit béni pour toi et ta famille.
        </motion.p>
      </div>

      {/* ── Sections ────────────────────────────────────────── */}
      <div className="flex flex-col gap-0 px-5 pt-4">

        {/* 1. Iftar / Suhoor */}
        <SectionWrapper
          id="iftar"
          open={openSection === "iftar"}
          onToggle={() => toggleSection("iftar")}
          icon={<Moon size={18} style={{ color: "#c084fc" }} />}
          title="Iftar & Suhoor"
          subtitle={`Iftar : ${iftarTime}  ·  Suhoor : ${suhoorTime}`}
          accentColor="#c084fc"
        >
          <IftarSection iftarTime={iftarTime} suhoorTime={suhoorTime} />
        </SectionWrapper>

        {/* 2. Défi 30 jours */}
        <SectionWrapper
          id="defis"
          open={openSection === "defis"}
          onToggle={() => toggleSection("defis")}
          icon={<Star size={18} style={{ color: "#fcd34d" }} />}
          title="Défi 30 jours"
          subtitle={`${defisCompleted} / 30 accomplis`}
          accentColor="#fcd34d"
          progress={defisCompleted / 30}
        >
          <DefisSection defis={defis} onToggle={toggleDefi} />
        </SectionWrapper>

        {/* 3. Coran en 30 jours */}
        <SectionWrapper
          id="coran"
          open={openSection === "coran"}
          onToggle={() => toggleSection("coran")}
          icon={<BookOpen size={18} style={{ color: "#86efac" }} />}
          title="Coran en 30 jours"
          subtitle={`${juzzCompleted} / 30 juzz lus`}
          accentColor="#86efac"
          progress={juzzCompleted / 30}
        >
          <CoranSection juzz={juzz} onToggle={toggleJuzz} />
        </SectionWrapper>

        {/* 4. Duaas du Ramadan */}
        <SectionWrapper
          id="duas"
          open={openSection === "duas"}
          onToggle={() => toggleSection("duas")}
          icon={<Heart size={18} style={{ color: "#f9a8d4" }} />}
          title="Duaas du Ramadan"
          subtitle="10 invocations essentielles"
          accentColor="#f9a8d4"
        >
          <DuasSection expandedDua={expandedDua} onExpand={setExpandedDua} />
        </SectionWrapper>

        {/* 5. Bonnes actions */}
        <SectionWrapper
          id="bonnes"
          open={openSection === "bonnes"}
          onToggle={() => toggleSection("bonnes")}
          icon={<CheckCircle2 size={18} style={{ color: "#93c5fd" }} />}
          title="Compteur de bonnes actions"
          subtitle={`${bonnesActions} action${bonnesActions > 1 ? "s" : ""} aujourd'hui`}
          accentColor="#93c5fd"
        >
          <BonnesActionsSection count={bonnesActions} />
        </SectionWrapper>

      </div>
    </motion.main>
  );
}

// ── Section wrapper ────────────────────────────────────────────
interface SectionWrapperProps {
  id:          SectionKey;
  open:        boolean;
  onToggle:    () => void;
  icon:        React.ReactNode;
  title:       string;
  subtitle:    string;
  accentColor: string;
  progress?:   number;
  children:    React.ReactNode;
}

function SectionWrapper({
  open, onToggle, icon, title, subtitle, accentColor, progress, children,
}: SectionWrapperProps) {
  return (
    <motion.div variants={itemVariants} className="mb-3">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border:     `1px solid ${open ? accentColor + "40" : "rgba(255,255,255,0.06)"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        {/* Header */}
        <motion.button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-4"
          onClick={onToggle}
          whileTap={tapScale}
          transition={springTap}
        >
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 36, height: 36,
              background: accentColor + "15",
              border: `1px solid ${accentColor}30`,
            }}
          >
            {icon}
          </div>
          <div className="flex-1 text-start">
            <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {title}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
              {subtitle}
            </p>
          </div>
          {progress !== undefined && (
            <div
              className="relative flex-shrink-0"
              style={{ width: 36, height: 36 }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={accentColor}
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
                style={{ color: accentColor }}
              >
                {Math.round(progress * 100)}%
              </span>
            </div>
          )}
          {open ? (
            <ChevronUp size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          ) : (
            <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          )}
        </motion.button>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              style={{
                height: "100%",
                width:  `${progress * 100}%`,
                background: accentColor,
                opacity: 0.5,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        )}

        {/* Content */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 pb-4 pt-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Section Iftar ─────────────────────────────────────────────
function IftarSection({ iftarTime, suhoorTime }: { iftarTime: string; suhoorTime: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <TimeCard label="Iftar (Maghrib)" time={iftarTime} arabic="الإفطار" color="#c084fc" />
        <TimeCard label="Suhoor (Fajr)"  time={suhoorTime} arabic="السحور"  color="#93c5fd" />
      </div>
      <div
        className="rounded-xl px-3 py-2.5"
        style={{ background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.12)" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          Horaires calculés selon votre ville configurée dans les réglages.
          Maghrib = heure de l&apos;iftar · Fajr = limite du suhoor.
        </p>
      </div>
      <Link
        href="/prieres"
        className="flex items-center justify-center gap-2 rounded-xl py-3"
        style={{
          background: "rgba(192,132,252,0.1)",
          border:     "1px solid rgba(192,132,252,0.25)",
          color:      "#c084fc",
          fontFamily: "var(--font-dm-sans)",
          fontSize:   "0.875rem",
          fontWeight: 600,
        }}
      >
        Voir tous les horaires
      </Link>
    </div>
  );
}

function TimeCard({ label, time, arabic, color }: { label: string; time: string; arabic: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl py-4"
      style={{ background: color + "0D", border: `1px solid ${color}25` }}
    >
      <p className="text-xs" style={{ color: color + "99", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
      <p className="font-bold text-xl" style={{ color, fontFamily: "var(--font-dm-sans)" }}>{time}</p>
      <p className="text-sm" dir="rtl" style={{ color: color + "70", fontFamily: "var(--font-arabic)" }}>{arabic}</p>
    </div>
  );
}

// ── Section Défis ─────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  coran:        "Coran",
  dhikr:        "Dhikr",
  acte:         "Bonne action",
  connaissance: "Connaissance",
  famille:      "Famille",
};

function DefisSection({
  defis, onToggle,
}: { defis: DefisState; onToggle: (day: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {RAMADAN_DEFIS.map(defi => {
        const done = defis[defi.day]?.completed ?? false;
        const color = CATEGORY_COLORS[defi.category];
        return (
          <motion.button
            key={defi.day}
            type="button"
            className="flex items-start gap-3 rounded-xl px-3 py-3 text-start w-full"
            style={{
              background: done ? color + "12" : "rgba(255,255,255,0.02)",
              border:     `1px solid ${done ? color + "35" : "rgba(255,255,255,0.05)"}`,
              transition: "all 0.25s ease",
            }}
            onClick={() => onToggle(defi.day)}
            whileTap={tapScale}
            transition={springTap}
          >
            <div className="flex-shrink-0 mt-0.5">
              {done ? (
                <CheckCircle2 size={18} style={{ color }} />
              ) : (
                <Circle size={18} style={{ color: "rgba(255,255,255,0.2)" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: color + "20", color }}
                >
                  Jour {defi.day}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(248,244,236,0.4)" }}
                >
                  {CATEGORY_LABELS[defi.category]}
                </span>
              </div>
              <p
                className="font-semibold text-sm"
                style={{
                  color:      done ? color : "var(--text)",
                  fontFamily: "var(--font-dm-sans)",
                  textDecoration: done ? "line-through" : "none",
                  opacity:    done ? 0.7 : 1,
                }}
              >
                {defi.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.5 }}>
                {defi.detail}
              </p>
              {defi.arabic && (
                <p className="text-sm mt-1" dir="rtl" style={{ color: color + "90", fontFamily: "var(--font-arabic)" }}>
                  {defi.arabic}
                </p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Section Coran ─────────────────────────────────────────────
function CoranSection({
  juzz, onToggle,
}: { juzz: JuzzState; onToggle: (day: number) => void }) {
  const completed = Object.values(juzz).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="rounded-xl px-3 py-2.5 mb-1"
        style={{ background: "rgba(134,239,172,0.06)", border: "1px solid rgba(134,239,172,0.15)" }}
      >
        <p className="text-xs" style={{ color: "rgba(134,239,172,0.7)", fontFamily: "var(--font-dm-sans)" }}>
          {completed === 30
            ? "Mashallah — tu as complété le Coran ce Ramadan !"
            : `Coche chaque juzz après l'avoir lu. Objectif : finir le Coran complet en 30 jours.`}
        </p>
      </div>
      {JUZZ_PLAN.map(({ juzz: j, surahs }) => {
        const done = juzz[j] ?? false;
        return (
          <motion.button
            key={j}
            type="button"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-start"
            style={{
              background: done ? "rgba(134,239,172,0.08)" : "rgba(255,255,255,0.02)",
              border:     `1px solid ${done ? "rgba(134,239,172,0.3)" : "rgba(255,255,255,0.05)"}`,
              transition: "all 0.2s ease",
            }}
            onClick={() => onToggle(j)}
            whileTap={tapScale}
            transition={springTap}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0 font-bold text-xs"
              style={{
                width: 32, height: 32,
                background: done ? "rgba(134,239,172,0.15)" : "rgba(255,255,255,0.04)",
                color:      done ? "#86efac" : "rgba(255,255,255,0.3)",
              }}
            >
              {j}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium"
                style={{
                  color:          done ? "#86efac" : "var(--text)",
                  fontFamily:     "var(--font-dm-sans)",
                  textDecoration: done ? "line-through" : "none",
                  opacity:        done ? 0.7 : 1,
                }}
              >
                Juzz {j}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
                {surahs}
              </p>
            </div>
            {done && <CheckCircle2 size={16} style={{ color: "#86efac", flexShrink: 0 }} />}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Section Duaas ─────────────────────────────────────────────
function DuasSection({
  expandedDua, onExpand,
}: { expandedDua: string | null; onExpand: (id: string | null) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {RAMADAN_DUAS.map(dua => {
        const isOpen = expandedDua === dua.id;
        return (
          <div
            key={dua.id}
            className="rounded-xl overflow-hidden"
            style={{
              background: isOpen ? "rgba(249,168,212,0.06)" : "rgba(255,255,255,0.02)",
              border:     `1px solid ${isOpen ? "rgba(249,168,212,0.3)" : "rgba(255,255,255,0.05)"}`,
              transition: "all 0.25s ease",
            }}
          >
            <motion.button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 text-start"
              onClick={() => onExpand(isOpen ? null : dua.id)}
              whileTap={tapScale}
              transition={springTap}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 32, height: 32,
                  background: "rgba(249,168,212,0.1)",
                  border:     "1px solid rgba(249,168,212,0.2)",
                }}
              >
                <Heart size={14} style={{ color: "#f9a8d4" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {dua.title}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
                  {dua.occasion}
                </p>
              </div>
              {isOpen ? (
                <ChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              ) : (
                <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              )}
            </motion.button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="dua-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-3 pb-4 flex flex-col gap-3">
                    <div
                      className="rounded-xl px-4 py-4 text-center"
                      style={{ background: "rgba(249,168,212,0.06)", border: "1px solid rgba(249,168,212,0.15)" }}
                    >
                      <p
                        dir="rtl"
                        className="leading-relaxed"
                        style={{
                          color:      "#f9a8d4",
                          fontSize:   "1.1rem",
                          fontFamily: "var(--font-arabic)",
                          lineHeight: 1.9,
                        }}
                      >
                        {dua.arabic}
                      </p>
                    </div>
                    <p className="text-xs italic text-center" style={{ color: "rgba(249,168,212,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                      {dua.transliteration}
                    </p>
                    <p className="text-sm text-center" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
                      {dua.translation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Section Bonnes actions ─────────────────────────────────────
function BonnesActionsSection({ count }: { count: number }) {
  const items = [
    { label: "Prières cochées",      icon: "☽", desc: "+1 point par prière marquée aujourd'hui" },
    { label: "Dhikrs complétés",     icon: "✦", desc: "+1 point par session de dhikr accomplie" },
    { label: "Quiz islamiques",      icon: "◈", desc: "+1 point par tranche de 10 bonnes réponses" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-col items-center gap-2 rounded-xl py-6"
        style={{ background: "rgba(147,197,253,0.06)", border: "1px solid rgba(147,197,253,0.15)" }}
      >
        <motion.p
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="font-bold"
          style={{ color: "#93c5fd", fontSize: "3rem", fontFamily: "var(--font-dm-sans)" }}
        >
          {count}
        </motion.p>
        <p className="text-sm" style={{ color: "rgba(147,197,253,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          bonne{count > 1 ? "s" : ""} action{count > 1 ? "s" : ""} aujourd&apos;hui
        </p>
      </div>
      <div
        className="rounded-xl px-3 py-2.5"
        style={{ background: "rgba(147,197,253,0.04)", border: "1px solid rgba(147,197,253,0.1)" }}
      >
        <p className="text-xs mb-2 font-medium" style={{ color: "rgba(147,197,253,0.7)", fontFamily: "var(--font-dm-sans)" }}>
          Ce compteur se met à jour automatiquement :
        </p>
        {items.map(({ label, icon, desc }) => (
          <div key={label} className="flex items-start gap-2 mb-1.5">
            <span style={{ color: "#93c5fd", fontSize: "0.75rem", flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <div>
              <span className="text-xs font-medium" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </span>
              <span className="text-xs ml-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
                — {desc}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Link
          href="/prieres"
          className="flex-1 flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.2)", color: "#93c5fd", fontFamily: "var(--font-dm-sans)" }}
        >
          Prières
        </Link>
        <Link
          href="/dhikr"
          className="flex-1 flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.2)", color: "#93c5fd", fontFamily: "var(--font-dm-sans)" }}
        >
          Dhikr
        </Link>
        <Link
          href="/oasis"
          className="flex-1 flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.2)", color: "#93c5fd", fontFamily: "var(--font-dm-sans)" }}
        >
          Oasis
        </Link>
      </div>
    </div>
  );
}

// ── Star field décoration ──────────────────────────────────────
function StarField() {
  const stars = [
    { x: "8%",  y: "15%", size: 1.5, delay: 0    },
    { x: "85%", y: "20%", size: 1,   delay: 0.3  },
    { x: "22%", y: "65%", size: 1,   delay: 0.7  },
    { x: "70%", y: "55%", size: 2,   delay: 0.15 },
    { x: "45%", y: "80%", size: 1.5, delay: 0.5  },
    { x: "92%", y: "70%", size: 1,   delay: 0.9  },
    { x: "15%", y: "40%", size: 1.5, delay: 0.4  },
    { x: "60%", y: "10%", size: 1,   delay: 0.6  },
    { x: "35%", y: "25%", size: 1,   delay: 0.2  },
    { x: "78%", y: "85%", size: 1.5, delay: 0.8  },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left:       s.x,
            top:        s.y,
            width:      s.size * 2,
            height:     s.size * 2,
            background: "rgba(192,132,252,0.6)",
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 2.5 + s.delay,
            repeat:   Infinity,
            delay:    s.delay,
            ease:     "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
