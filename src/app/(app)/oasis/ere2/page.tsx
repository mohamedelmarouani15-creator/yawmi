"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Star, Swords, Trophy } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { gameStorage, computeCurrentEnergy, ENERGY_COST, ENERGY_MAX } from "@/lib/game/game-storage";
import { stagesDone, getStageConfig, currentStageIndex, ERA_CONDITIONS } from "@/lib/game/stages";
import { getActiveEvents } from "@/lib/game/events";
import { springTap } from "@/lib/motion";
import { LOCATIONS } from "@/lib/game/locations";
import { SAGES } from "@/lib/game/sages";

const ERE2_ORDER = ["abyssinie", "jerusalem", "taif", "medine_hijra", "khaybar"];

const ERE2_THEME = {
  bg:     "linear-gradient(180deg, #020a05 0%, #061a1a 100%)",
  accent: "#34d399",
  glow:   "rgba(52,211,153,0.15)",
};

// Approximate hijri era for era 2 visual flavor
const ERA2_LORE = [
  { year: "615", event: "Première Hijra en Abyssinie" },
  { year: "621", event: "Isra' wal Mi'raj — voyage nocturne" },
  { year: "622", event: "Hégire — Médine" },
  { year: "627", event: "Bataille de Khandak — le fossé" },
  { year: "628", event: "Conquête de Khaybar" },
];

export default function Ere2Page() {
  const router = useRouter();
  const { state } = useGameState();
  const liveState  = gameStorage.get();
  const energy     = computeCurrentEnergy(liveState.energy, liveState.lastEnergyUpdate);
  const activeEvents = getActiveEvents();

  const level        = state?.level ?? 1;
  const completedArcs = liveState.completedArcs ?? [];
  const categoryMastery = liveState.categoryMastery ?? {};
  const avgMastery   = Math.round(Object.values(categoryMastery).reduce((a: number, b: number) => a + b, 0) / 5);
  const era2Cond     = ERA_CONDITIONS.find(e => e.eraIndex === 2)!;

  const eraUnlocked =
    level >= era2Cond.minLevel &&
    completedArcs.length >= era2Cond.minArcsRead &&
    avgMastery >= era2Cond.minAvgMastery;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: ERE2_THEME.bg }}>

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ background: "rgba(2,10,5,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(52,211,153,0.1)" }}>
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-widest opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Ère II
          </p>
          <h1 className="text-base font-black leading-tight" style={{ color: ERE2_THEME.accent, fontFamily: "var(--font-bricolage)" }}>
            L&apos;Aube de l&apos;Islam
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <span className="text-[10px]">⚡</span>
          <span className="text-xs font-bold" style={{ color: energy < ENERGY_COST ? "#f87171" : ERE2_THEME.accent, fontFamily: "var(--font-dm-sans)" }}>
            {energy}/{ENERGY_MAX}
          </span>
        </div>
      </div>

      {/* Era locked gate */}
      {!eraUnlocked && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-5 py-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
            className="text-5xl">🔒</motion.div>
          <div>
            <h2 className="text-xl font-black mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Ère II verrouillée
            </h2>
            <p className="text-sm opacity-50 mb-4" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {era2Cond.subtitle} s&apos;ouvre quand tu remplis les conditions
            </p>
            {[
              { label: `Niveau ${era2Cond.minLevel}`, done: level >= era2Cond.minLevel, val: `${level}/${era2Cond.minLevel}` },
              { label: `${era2Cond.minArcsRead} histoires terminées`, done: completedArcs.length >= era2Cond.minArcsRead, val: `${completedArcs.length}/${era2Cond.minArcsRead}` },
              { label: `Maîtrise moyenne ${era2Cond.minAvgMastery}%`, done: avgMastery >= era2Cond.minAvgMastery, val: `${avgMastery}/${era2Cond.minAvgMastery}%` },
            ].map(({ label, done, val }) => (
              <div key={label} className="flex items-center gap-2 justify-center mb-2">
                <span>{done ? "✅" : "⬜"}</span>
                <span className="text-sm" style={{ color: done ? "#4ade80" : "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                  {label} <span className="font-bold">{val}</span>
                </span>
              </div>
            ))}
          </div>
          <motion.button onClick={() => router.push("/oasis")} whileTap={{ scale: 0.96 }} transition={springTap}
            className="rounded-full px-8 py-3.5 text-sm font-bold"
            style={{ background: `${ERE2_THEME.accent}18`, color: ERE2_THEME.accent, border: `1px solid ${ERE2_THEME.accent}35`, fontFamily: "var(--font-dm-sans)" }}>
            ← Retour à l&apos;Ère I
          </motion.button>
        </div>
      )}

      {eraUnlocked && (
        <div className="flex flex-col px-4 py-4 gap-5">

          {/* Active events banner */}
          {activeEvents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border px-4 py-3 flex items-center gap-3"
              style={{ background: `${activeEvents[0].color}10`, borderColor: `${activeEvents[0].color}35` }}>
              <span className="text-xl">{activeEvents[0].emoji}</span>
              <div>
                <p className="text-xs font-black" style={{ color: activeEvents[0].color, fontFamily: "var(--font-bricolage)" }}>
                  {activeEvents[0].name} actif !
                </p>
                <p className="text-[10px] opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {activeEvents[0].description}
                </p>
              </div>
            </motion.div>
          )}

          {/* Timeline lore strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {ERA2_LORE.map(({ year, event }) => (
              <div key={year} className="flex-shrink-0 rounded-xl px-3 py-2 text-center min-w-[100px]"
                style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
                <p className="text-[10px] font-black" style={{ color: ERE2_THEME.accent, fontFamily: "var(--font-bricolage)" }}>{year} EC</p>
                <p className="text-[9px] opacity-50 leading-tight mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{event}</p>
              </div>
            ))}
          </div>

          {/* Location cards */}
          <div className="flex flex-col gap-4">
            {ERE2_ORDER.map((locId, i) => {
              const loc     = LOCATIONS.find(l => l.id === locId);
              const sage    = SAGES.find(s => s.locationId === locId);
              if (!loc) return null;

              const stagesDoneN = stagesDone(liveState.locationStages ?? {}, locId);
              const stageIdx    = currentStageIndex(liveState.locationStages ?? {}, locId);
              const stageCfg    = getStageConfig(stageIdx);
              const mastered    = stagesDoneN >= 3;
              const defeated    = (liveState.defeatedSages ?? []).includes(sage?.id ?? "");
              const hasEnergy   = energy >= ENERGY_COST;
              const canPlay     = hasEnergy;

              return (
                <motion.div key={locId}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-3xl border overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: `${loc.color}30` }}>

                  {/* Card header */}
                  <div className="flex items-center gap-4 p-4"
                    style={{ background: `linear-gradient(135deg, ${loc.color}12 0%, transparent 100%)` }}>
                    {/* Location number */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base font-black"
                      style={{ background: `${loc.color}22`, color: loc.color, fontFamily: "var(--font-bricolage)" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black" style={{ color: loc.color, fontFamily: "var(--font-bricolage)" }}>
                          {loc.nameFr}
                        </h3>
                        {mastered && <Trophy size={12} style={{ color: loc.color }} />}
                      </div>
                      {sage && (
                        <p className="text-[10px] opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                          ⚔ {sage.name} — {sage.specialty}
                        </p>
                      )}
                    </div>
                    {/* Stage stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(s => (
                        <span key={s} className="text-sm" style={{ color: stagesDoneN >= s ? loc.color : "rgba(255,255,255,0.12)" }}>
                          {stagesDoneN >= s ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="px-4 pb-3 text-xs opacity-50 leading-relaxed"
                    style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {loc.description}
                  </p>

                  {/* Stage info + CTA */}
                  <div className="flex items-center justify-between gap-3 px-4 pb-4">
                    <div className="text-[10px]" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                      {mastered
                        ? <span style={{ color: loc.color }}>✦ Maîtrisé</span>
                        : <>{stageCfg.name} · {stageCfg.victoryReq}/10 requis</>}
                    </div>
                    <motion.button
                      onClick={() => canPlay && router.push(`/oasis/quiz/${locId}`)}
                      whileTap={canPlay ? { scale: 0.96 } : {}}
                      transition={springTap}
                      disabled={!canPlay}
                      className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black"
                      style={{
                        background: canPlay ? `linear-gradient(135deg, ${loc.color}, #055C3F)` : "rgba(255,255,255,0.05)",
                        color: canPlay ? "#0a0f0d" : "rgba(255,255,255,0.2)",
                        fontFamily: "var(--font-bricolage)",
                        boxShadow: canPlay ? `0 2px 12px ${loc.color}44` : "none",
                      }}>
                      {!canPlay
                        ? "⚡ Énergie vide"
                        : mastered
                          ? <><Swords size={12} /> Rejouer</>
                          : <><Swords size={12} /> {stageCfg.name}</>
                      }
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom hint */}
          <div className="text-center pb-6">
            <p className="text-xs opacity-30" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Ère III — L&apos;Âge d&apos;Or · Niv. 30 + 4 arcs + maîtrise 50%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
