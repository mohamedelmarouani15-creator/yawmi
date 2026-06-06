"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Trophy } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { gameStorage, computeCurrentEnergy, computeCurrentEnergyFromState, ENERGY_COST, ENERGY_MAX } from "@/lib/game/game-storage";
import { stagesDone, getStageConfig, currentStageIndex, ERA_CONDITIONS } from "@/lib/game/stages";
import { getActiveEvents } from "@/lib/game/events";
import { springTap } from "@/lib/motion";
import { LOCATIONS } from "@/lib/game/locations";
import { SAGES } from "@/lib/game/sages";

const ERE3_ORDER = ["kairouan", "alexandrie", "chiraz", "tolede", "nishapur"];

const THEME = { bg: "linear-gradient(180deg,#020a05 0%,#04111a 100%)", accent: "#60a5fa" };

const LORE = [
  { year: "670",  event: "Fondation de Kairouan" },
  { year: "IXe",  event: "Maison de la Sagesse — Bagdad" },
  { year: "965",  event: "Ibn al-Haytham — optique" },
  { year: "XIe",  event: "École de traduction de Tolède" },
  { year: "1048", event: "Omar Khayyam — algèbre" },
];

export default function Ere3Page() {
  const router = useRouter();
  const { state } = useGameState();
  const liveState  = gameStorage.get();
  const energy     = computeCurrentEnergyFromState(liveState);
  const activeEvents = getActiveEvents();

  const level          = state?.level ?? 1;
  const completedArcs  = liveState.completedArcs ?? [];
  const avgMastery     = Math.round(Object.values(liveState.categoryMastery ?? {}).reduce((a: number, b: number) => a + b, 0) / 5);
  const era3Cond       = ERA_CONDITIONS.find(e => e.eraIndex === 3)!;
  const eraUnlocked    = level >= era3Cond.minLevel && completedArcs.length >= era3Cond.minArcsRead && avgMastery >= era3Cond.minAvgMastery;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: THEME.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ background: "rgba(2,10,5,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${THEME.accent}18` }}>
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-widest opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Ère III</p>
          <h1 className="text-base font-black" style={{ color: THEME.accent, fontFamily: "var(--font-bricolage)" }}>L&apos;Âge d&apos;Or</h1>
        </div>
        <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
          style={{ background: `${THEME.accent}10`, border: `1px solid ${THEME.accent}20` }}>
          <span className="text-[10px]">⚡</span>
          <span className="text-xs font-bold" style={{ color: energy < ENERGY_COST ? "#f87171" : THEME.accent, fontFamily: "var(--font-dm-sans)" }}>
            {energy}/{ENERGY_MAX}
          </span>
        </div>
      </div>

      {/* Gate */}
      {!eraUnlocked && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center gap-5 py-16">
          <div className="text-5xl">🔒</div>
          <div>
            <h2 className="text-xl font-black mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>Ère III verrouillée</h2>
            <p className="text-sm opacity-50 mb-4" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Complète l&apos;Ère II et monte en niveau
            </p>
            {[
              { label: `Niveau ${era3Cond.minLevel}`, done: level >= era3Cond.minLevel, val: `${level}/${era3Cond.minLevel}` },
              { label: `${era3Cond.minArcsRead} histoires terminées`, done: completedArcs.length >= era3Cond.minArcsRead, val: `${completedArcs.length}/${era3Cond.minArcsRead}` },
              { label: `Maîtrise ${era3Cond.minAvgMastery}%`, done: avgMastery >= era3Cond.minAvgMastery, val: `${avgMastery}/${era3Cond.minAvgMastery}%` },
            ].map(({ label, done, val }) => (
              <div key={label} className="flex items-center gap-2 justify-center mb-2">
                <span>{done ? "✅" : "⬜"}</span>
                <span className="text-sm" style={{ color: done ? "#4ade80" : "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                  {label} <span className="font-bold">{val}</span>
                </span>
              </div>
            ))}
          </div>
          <motion.button onClick={() => router.push("/oasis/ere2")} whileTap={{ scale: 0.96 }} transition={springTap}
            className="rounded-full px-8 py-3.5 text-sm font-bold"
            style={{ background: `${THEME.accent}18`, color: THEME.accent, border: `1px solid ${THEME.accent}35`, fontFamily: "var(--font-dm-sans)" }}>
            ← Continuer l&apos;Ère II
          </motion.button>
        </div>
      )}

      {eraUnlocked && (
        <div className="flex flex-col px-4 py-4 gap-5">
          {/* Active event */}
          {activeEvents.length > 0 && (
            <div className="rounded-2xl border px-4 py-3 flex items-center gap-3"
              style={{ background: `${activeEvents[0].color}10`, borderColor: `${activeEvents[0].color}30` }}>
              <span className="text-xl">{activeEvents[0].emoji}</span>
              <p className="text-xs font-bold" style={{ color: activeEvents[0].color, fontFamily: "var(--font-bricolage)" }}>
                {activeEvents[0].name} — {activeEvents[0].description}
              </p>
            </div>
          )}

          {/* Lore strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LORE.map(({ year, event }) => (
              <div key={year} className="flex-shrink-0 rounded-xl px-3 py-2 text-center min-w-[100px]"
                style={{ background: `${THEME.accent}08`, border: `1px solid ${THEME.accent}15` }}>
                <p className="text-[10px] font-black" style={{ color: THEME.accent, fontFamily: "var(--font-bricolage)" }}>{year}</p>
                <p className="text-[9px] opacity-50 leading-tight mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{event}</p>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4">
            {ERE3_ORDER.map((locId, i) => {
              const loc     = LOCATIONS.find(l => l.id === locId);
              const sage    = SAGES.find(s => s.locationId === locId);
              if (!loc) return null;
              const stagesDoneN = stagesDone(liveState.locationStages ?? {}, locId);
              const stageIdx    = currentStageIndex(liveState.locationStages ?? {}, locId);
              const stageCfg    = getStageConfig(stageIdx);
              const mastered    = stagesDoneN >= 3;
              const hasEnergy   = energy >= ENERGY_COST;

              return (
                <motion.div key={locId}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-3xl border overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: `${loc.color}28` }}>
                  <div className="flex items-center gap-4 p-4"
                    style={{ background: `linear-gradient(135deg,${loc.color}10 0%,transparent 100%)` }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base font-black"
                      style={{ background: `${loc.color}20`, color: loc.color, fontFamily: "var(--font-bricolage)" }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black" style={{ color: loc.color, fontFamily: "var(--font-bricolage)" }}>{loc.nameFr}</h3>
                        {mastered && <Trophy size={12} style={{ color: loc.color }} />}
                      </div>
                      {sage && <p className="text-[10px] opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>⚔ {sage.name}</p>}
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(s => <span key={s} style={{ color: stagesDoneN >= s ? loc.color : "rgba(255,255,255,0.1)" }}>{stagesDoneN >= s ? "★" : "☆"}</span>)}
                    </div>
                  </div>
                  <p className="px-4 pb-3 text-xs opacity-45 leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {loc.description}
                  </p>
                  <div className="flex items-center justify-between gap-3 px-4 pb-4">
                    <span className="text-[10px]" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                      {mastered ? <span style={{ color: loc.color }}>✦ Maîtrisé</span> : `${stageCfg.name} · ${stageCfg.victoryReq}/10`}
                    </span>
                    <motion.button onClick={() => hasEnergy && router.push(`/oasis/quiz/${locId}`)}
                      whileTap={hasEnergy ? { scale: 0.96 } : {}} transition={springTap} disabled={!hasEnergy}
                      className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black"
                      style={{
                        background: hasEnergy ? `linear-gradient(135deg,${loc.color},${THEME.accent})` : "rgba(255,255,255,0.05)",
                        color: hasEnergy ? "#0a0f0d" : "rgba(255,255,255,0.2)",
                        fontFamily: "var(--font-bricolage)",
                        boxShadow: hasEnergy ? `0 2px 12px ${loc.color}44` : "none",
                      }}>
                      {hasEnergy ? <><Swords size={12} /> {mastered ? "Rejouer" : stageCfg.name}</> : "⚡ Vide"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center pb-6">
            <p className="text-xs opacity-25" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Ère IV — Les Empires · Niv. 50 + 6 arcs + maîtrise 70%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
