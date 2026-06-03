"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Scissors, Shield, Zap, Snowflake } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { gameStorage } from "@/lib/game/game-storage";
import { POWERUPS } from "@/lib/game/powerups";
import { springTap } from "@/lib/motion";
import type { PowerUpType } from "@/lib/game/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Scissors: <Scissors size={22} />,
  Shield:   <Shield size={22} />,
  Zap:      <Zap size={22} />,
  Snowflake: <Snowflake size={22} />,
};

// ── Chest opening animation ────────────────────────────────────
function ChestModal({ onClose, reward }: {
  onClose: () => void;
  reward: { coins: number; powerup: PowerUpType | null; object: string | null } | null;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-5"
        style={{
          background: "linear-gradient(180deg,#0A1A0E 0%,#061A12 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          boxShadow: "0 0 60px rgba(212,175,55,0.15)",
        }}
      >
        {/* Chest SVG */}
        <motion.div
          className="relative cursor-pointer"
          onClick={() => !opened && setOpened(true)}
          whileTap={!opened ? { scale: 0.95 } : {}}
        >
          <svg width={140} height={110} viewBox="0 0 140 110">
            {/* Body */}
            <rect x={15} y={55} width={110} height={48} rx={8} fill="#5C3A1E" stroke="rgba(212,175,55,0.5)" strokeWidth={2} />
            <rect x={15} y={68} width={110} height={6} fill="rgba(212,175,55,0.4)" />
            <rect x={64} y={55} width={12} height={48} fill="rgba(212,175,55,0.4)" />
            {/* Lock */}
            <rect x={62} y={72} width={16} height={13} rx={3} fill="var(--gold)" />
            <path d="M 66 72 Q 66 65 70 65 Q 74 65 74 72" fill="none" stroke="var(--gold)" strokeWidth={3} strokeLinecap="round" />
            {/* Lid */}
            <motion.g
              animate={{ rotateX: opened ? -80 : 0, y: opened ? -22 : 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 18 }}
              style={{ transformOrigin: "70px 55px" }}
            >
              <rect x={15} y={20} width={110} height={36} rx={8} fill="#7B4F2E" stroke="rgba(212,175,55,0.5)" strokeWidth={2} />
              <rect x={15} y={33} width={110} height={6} fill="rgba(212,175,55,0.3)" />
              {/* Hinges */}
              <rect x={22} y={52} width={10} height={8} rx={2} fill="rgba(212,175,55,0.6)" />
              <rect x={108} y={52} width={10} height={8} rx={2} fill="rgba(212,175,55,0.6)" />
            </motion.g>

            {/* Glow when opened */}
            {opened && (
              <motion.ellipse
                cx={70} cy={60} rx={45} ry={20}
                fill="rgba(212,175,55,0.3)"
                initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.2] }}
                transition={{ duration: 0.6 }}
              />
            )}
          </svg>

          {!opened && (
            <p className="text-center text-xs mt-2" style={{ color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)" }}>
              Appuie pour ouvrir
            </p>
          )}
        </motion.div>

        {/* Reward reveal */}
        <AnimatePresence>
          {opened && reward && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <p className="text-lg font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                Vous avez obtenu !
              </p>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-3 rounded-2xl border p-3"
                  style={{ background: "var(--bg-gold)", borderColor: "rgba(212,175,55,0.3)" }}>
                  <span className="text-xl">🪙</span>
                  <span className="font-semibold text-sm" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                    +{reward.coins} pièces d&apos;or
                  </span>
                </div>
                {reward.powerup && (
                  <div className="flex items-center gap-3 rounded-2xl border p-3"
                    style={{ background: "rgba(74,222,128,0.06)", borderColor: "rgba(74,222,128,0.25)" }}>
                    <span className="text-xl">⚡</span>
                    <span className="font-semibold text-sm" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>
                      Power-up : {POWERUPS.find(p => p.id === reward.powerup)?.name}
                    </span>
                  </div>
                )}
                {reward.object && (
                  <div className="flex items-center gap-3 rounded-2xl border p-3"
                    style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.25)" }}>
                    <span className="text-xl">🕌</span>
                    <span className="font-semibold text-sm" style={{ color: "#a78bfa", fontFamily: "var(--font-dm-sans)" }}>
                      Objet mosquée débloqué
                    </span>
                  </div>
                )}
              </div>
              <motion.button
                onClick={onClose} whileTap={{ scale: 0.96 }} transition={springTap}
                className="w-full rounded-full py-3.5 text-sm font-semibold mt-2"
                style={{ background: "linear-gradient(135deg,#D4AF37,#8B6914)", color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
                Parfait !
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Gold particles ─────────────────────────────────────────────
function GoldParticles({ show }: { show: boolean }) {
  if (!show) return null;
  const p = Array.from({ length: 24 }, (_, i) => ({
    x: 20 + Math.random() * 350, delay: Math.random() * 0.4,
    color: ["var(--gold)","#FFD700","var(--text)"][i % 3],
    size: 3 + Math.random() * 5,
    rot: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {p.map((pt, i) => (
        <motion.div key={i} className="absolute rounded-sm"
          style={{ left: pt.x, top: -8, width: pt.size, height: pt.size, background: pt.color }}
          initial={{ y: -8, opacity: 1, rotate: 0 }}
          animate={{ y: 750, opacity: 0, rotate: pt.rot }}
          transition={{ duration: 1.6 + Math.random() * 0.9, delay: pt.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const { state, refresh } = useGameState();
  const [toast,   setToast]   = useState<string | null>(null);
  const [chest,   setChest]   = useState<{ coins: number; powerup: PowerUpType | null; object: string | null } | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  const coins    = state?.coins ?? 0;
  const chests   = state?.chestsAvailable ?? 0;
  const powerups = state?.powerupCounts ?? {};

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const buyPowerUp = useCallback((id: PowerUpType, cost: number) => {
    if (coins < cost) { showToast("Pas assez de pièces d'or !"); return; }
    const spent = gameStorage.spendCoins(cost);
    if (!spent) { showToast("Impossible d'acheter"); return; }
    gameStorage.addPowerUp(id);
    gameStorage.push(); // sync vers Supabase après achat
    refresh?.();
    showToast("Power-up ajouté !");
  }, [coins, refresh]);

  const openChest = useCallback(() => {
    const reward = gameStorage.openChest();
    if (!reward) return;
    gameStorage.push(); // sync vers Supabase après ouverture coffre
    refresh?.();
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 2200);
    setChest(reward);
  }, [refresh]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col px-5 pt-11 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 55%)" }}
    >
      <GoldParticles show={showParticles} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Boutique
          </h1>
        </div>
        {/* Coins */}
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>
          <span style={{ fontSize: 14 }}>🪙</span>
          <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
            {coins}
          </span>
        </div>
      </div>

      {/* Coffres disponibles */}
      {chests > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border p-5 mb-6 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg,rgba(30,20,5,0.95),rgba(20,14,3,0.95))",
            border: "1px solid rgba(212,175,55,0.35)",
            boxShadow: "0 0 24px rgba(212,175,55,0.08)",
          }}
        >
          <motion.div
            animate={{ rotate: [-3, 3, -3], scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-4xl">
            📦
          </motion.div>
          <div className="flex-1">
            <p className="font-bold text-sm mb-0.5" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              {chests} Coffre{chests > 1 ? "s" : ""} disponible{chests > 1 ? "s" : ""}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
              Pièces, power-ups, objets mosquée…
            </p>
          </div>
          <motion.button
            onClick={openChest} whileTap={{ scale: 0.95 }} transition={springTap}
            className="rounded-full px-4 py-2 text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#D4AF37,#8B6914)", color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
            Ouvrir
          </motion.button>
        </motion.div>
      )}

      {/* Power-ups shop */}
      <p className="text-xs uppercase tracking-widest mb-3"
        style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
        Power-ups
      </p>
      <div className="flex flex-col gap-3 mb-8">
        {POWERUPS.map(pu => {
          const count = (powerups as Record<string, number>)[pu.id] ?? 0;
          const canBuy = coins >= pu.cost;
          return (
            <motion.div
              key={pu.id}
              className="flex items-center gap-4 rounded-2xl border p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: `${pu.color}22`,
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: pu.bgColor, color: pu.color }}>
                {ICON_MAP[pu.icon] ?? <span>⚡</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                  {pu.name}
                </p>
                <p className="text-xs opacity-50 truncate" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {pu.description}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                  En stock : <span style={{ color: pu.color, fontWeight: 600 }}>{count}</span>
                </p>
              </div>
              <motion.button
                onClick={() => buyPowerUp(pu.id, pu.cost)}
                disabled={!canBuy}
                whileTap={canBuy ? { scale: 0.95 } : {}}
                transition={springTap}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold shrink-0"
                style={{
                  background: canBuy ? `${pu.color}20` : "rgba(255,255,255,0.04)",
                  color: canBuy ? pu.color : "rgba(255,255,255,0.2)",
                  border: `1px solid ${canBuy ? pu.color + "40" : "rgba(255,255,255,0.06)"}`,
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                🪙 {pu.cost}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Info coffres */}
      <div className="rounded-2xl border p-4"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
          Comment obtenir des coffres ?
        </p>
        <ul className="text-xs flex flex-col gap-1" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
          <li>• Vaincre un sage → 1 coffre</li>
          <li>• 10/10 à un défi → 1 coffre</li>
          <li>• Streak de 7 jours → 1 coffre</li>
          <li>• Compléter un escape game → 2 coffres</li>
        </ul>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-semibold z-40"
            style={{ background: "rgba(15,35,22,0.97)", border: "1px solid rgba(212,175,55,0.3)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chest modal */}
      <AnimatePresence>
        {chest && <ChestModal reward={chest} onClose={() => setChest(null)} />}
      </AnimatePresence>
    </motion.main>
  );
}
