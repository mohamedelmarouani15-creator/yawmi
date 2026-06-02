"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Unlock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getEscapeRoom, getCurrentEscapeRoom } from "@/lib/game/escape-rooms";
import { gameStorage } from "@/lib/game/game-storage";
import { springTap } from "@/lib/motion";
import type { EscapeLock } from "@/lib/game/escape-rooms";

// Three.js ne tourne pas en SSR
const TapisScene = dynamic(
  () => import("@/components/escape3d/TapisScene"),
  { ssr: false },
);

// ── Expérience 3D plein écran (Bibliothèque de Tombouctou) ──────────
function BibliothequeFullscreen() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "#080502", overflow: "hidden",
    }}>
      {/* Bouton quitter */}
      <Link
        href="/oasis/escape"
        style={{
          position: "absolute", top: 16, left: 16, zIndex: 50,
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 24, padding: "8px 14px", color: "var(--gold)",
          backdropFilter: "blur(8px)", textDecoration: "none",
          fontFamily: "var(--font-dm-sans)", fontSize: 11,
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}
      >
        <ArrowLeft size={14} />
        Quitter
      </Link>

      <Suspense fallback={
        <div style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 14,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "2px solid #D4AF37", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{
            color: "rgba(212,175,55,0.5)", fontSize: 10,
            fontFamily: "var(--font-dm-sans)", letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            La bibliothèque s&apos;éveille…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <TapisScene />
      </Suspense>
    </div>
  );
}

// ── Isometric room SVG ─────────────────────────────────────────
function IsometricRoom({ theme, accentColor, wallColor, floorColor, solvedLocks }: {
  theme: string;
  accentColor: string;
  wallColor: string;
  floorColor: string;
  solvedLocks: number[];
}) {
  const W = 390;
  const H = 300;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={floorColor} stopOpacity={0.9} />
          <stop offset="100%" stopColor={floorColor} stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id="wallL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wallColor} stopOpacity={0.95} />
          <stop offset="100%" stopColor={wallColor} stopOpacity={0.6} />
        </linearGradient>
        <linearGradient id="wallR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wallColor} stopOpacity={0.7} />
          <stop offset="100%" stopColor={wallColor} stopOpacity={0.4} />
        </linearGradient>
      </defs>

      {/* Floor */}
      <polygon points="195,200 20,280 195,290 370,280" fill="url(#floor)" />
      {/* Floor tiles */}
      {[0,1,2,3].map(i => (
        <line key={`ft${i}`}
          x1={20 + i * 87} y1={280 - i * 5}
          x2={195 + i * 43} y2={200 + i * 22}
          stroke={`${accentColor}25`} strokeWidth={0.8} />
      ))}

      {/* Left wall */}
      <polygon points="195,80 20,160 20,280 195,200" fill="url(#wallL)" />
      {/* Left wall arch window */}
      <path d="M 60,155 Q 60,130 80,125 Q 100,130 100,155 L 100,175 L 60,175 Z"
        fill={`${accentColor}15`} stroke={`${accentColor}40`} strokeWidth={1} />
      {/* Left wall pattern */}
      {[0,1,2].map(i => (
        <line key={`wl${i}`}
          x1={25} y1={165 + i * 28}
          x2={190} y2={85 + i * 28}
          stroke={`${accentColor}18`} strokeWidth={0.7} />
      ))}

      {/* Right wall */}
      <polygon points="195,80 370,160 370,280 195,200" fill="url(#wallR)" />
      {/* Right wall arch */}
      <path d="M 290,155 Q 290,130 310,125 Q 330,130 330,155 L 330,175 L 290,175 Z"
        fill={`${accentColor}12`} stroke={`${accentColor}35`} strokeWidth={1} />

      {/* Ceiling edge */}
      <line x1={20} y1={160} x2={195} y2={80} stroke={`${accentColor}35`} strokeWidth={1.5} />
      <line x1={370} y1={160} x2={195} y2={80} stroke={`${accentColor}35`} strokeWidth={1.5} />

      {/* Central object — changes by theme */}
      {theme === "medersa" && (
        <g>
          {/* Wooden desk */}
          <polygon points="155,210 235,210 245,230 145,230" fill="#6B3D1E" />
          <polygon points="145,230 155,210 155,240 145,240" fill="#4A2810" />
          <polygon points="245,230 235,210 235,240 245,240" fill="#4A2810" />
          {/* Open book on desk */}
          <ellipse cx={195} cy={218} rx={28} ry={8} fill="#F5DEB3" opacity={0.9} />
          <line x1={195} y1={211} x2={195} y2={225} stroke={accentColor} strokeWidth={0.8} opacity={0.5} />
          {[0,1,2,3].map(i => (
            <line key={i} x1={170 + i * 6} y1={213 + i * 1.5} x2={193} y2={213 + i * 1.5}
              stroke={`${accentColor}60`} strokeWidth={0.5} />
          ))}
        </g>
      )}
      {theme === "bibliotheque" && (
        <g>
          {/* Bookshelf */}
          <rect x={165} y={185} width={60} height={45} fill="#5C3A1E" stroke={`${accentColor}40`} strokeWidth={1} />
          {[0,1,2].map(i => (
            <rect key={i} x={170 + i * 17} y={188} width={14} height={40} rx={1}
              fill={["#8B0000","#1A3A6B","#2E5C2E"][i]} opacity={0.9} />
          ))}
        </g>
      )}

      {/* Lantern ceiling */}
      <g transform="translate(195, 88)">
        <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <line x1={0} y1={-10} x2={0} y2={0} stroke={`${accentColor}60`} strokeWidth={1.5} />
          <rect x={-8} y={0} width={16} height={18} rx={3} fill="#2A1A06" stroke={accentColor} strokeWidth={1} opacity={0.9} />
          <ellipse cx={0} cy={9} rx={6} ry={4} fill={`${accentColor}40`} />
        </motion.g>
      </g>

      {/* Lock indicators — 4 positions */}
      {[
        { x: 80, y: 195, label: "📜" },
        { x: 310, y: 195, label: "📖" },
        { x: 120, y: 240, label: "✍️" },
        { x: 270, y: 240, label: "🪣" },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x},${pos.y})`}>
          <motion.circle r={18} fill="rgba(0,0,0,0.5)"
            animate={solvedLocks.includes(i) ? {} : { scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          />
          <circle r={18}
            fill={solvedLocks.includes(i) ? "rgba(74,222,128,0.25)" : "rgba(212,175,55,0.15)"}
            stroke={solvedLocks.includes(i) ? "rgba(74,222,128,0.6)" : `${accentColor}50`}
            strokeWidth={1.5}
          />
          <text textAnchor="middle" dominantBaseline="central" fontSize={14}>{pos.label}</text>
          {solvedLocks.includes(i) && (
            <text textAnchor="middle" dominantBaseline="central" fontSize={10} y={-22}
              fill="#4ade80">✓</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Lock puzzle modal ──────────────────────────────────────────
function LockModal({ lock, onSolve, onClose, color }: {
  lock: EscapeLock;
  onSolve: (lockId: number) => void;
  onClose: () => void;
  color: string;
}) {
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [hintUsed, setHintUsed]   = useState(false);

  const isCorrect = selected !== null && lock.options[selected]?.correct;

  const submit = useCallback(() => {
    if (selected === null) return;
    setRevealed(true);
    if (lock.options[selected]?.correct) {
      setTimeout(() => { onSolve(lock.id); onClose(); }, 1200);
    }
  }, [selected, lock, onSolve, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
        style={{ background: "linear-gradient(180deg,#0A1A0E 0%,#061A12 100%)", border: "1px solid rgba(212,175,55,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
            style={{ background: `${color}15` }}>
            {lock.icon}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5"
              style={{ color: `${color}80`, fontFamily: "var(--font-dm-sans)" }}>
              Cadenas {lock.id + 1}/4
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {lock.label}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto opacity-40 hover:opacity-70"
            style={{ color: "var(--text)", fontSize: 20 }}>✕</button>
        </div>

        {/* Question */}
        <p className="text-base font-semibold leading-snug mb-5"
          style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          {lock.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2 mb-4">
          {lock.options.map((opt, idx) => {
            let bg = "rgba(255,255,255,0.02)";
            let border = "rgba(255,255,255,0.07)";
            let textC  = "var(--text)";
            if (revealed) {
              if (opt.correct) { bg = "rgba(74,222,128,0.09)"; border = "rgba(74,222,128,0.4)"; textC = "#4ade80"; }
              else if (selected === idx) { bg = "rgba(248,113,113,0.09)"; border = "rgba(248,113,113,0.4)"; textC = "#f87171"; }
            } else if (selected === idx) {
              bg = `${color}14`; border = color; textC = color;
            }
            return (
              <motion.button key={idx}
                onClick={() => !revealed && setSelected(idx)}
                disabled={revealed}
                whileTap={!revealed ? { scale: 0.97 } : {}}
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left"
                style={{ background: bg, borderColor: border }}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.05)", color: textC, fontFamily: "var(--font-dm-sans)" }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm" style={{ color: textC, fontFamily: "var(--font-dm-sans)" }}>
                  {opt.text}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Hint */}
        {!hintUsed ? (
          <motion.button onClick={() => setHintUsed(true)} whileTap={{ scale: 0.97 }}
            className="w-full rounded-xl py-2.5 text-xs font-semibold mb-3"
            style={{ background: "rgba(255,255,255,0.03)", color: "rgba(248,244,236,0.4)",
              border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-dm-sans)" }}>
            💡 Voir l&apos;indice (-5 pièces)
          </motion.button>
        ) : (
          <p className="text-xs mb-3 px-3 py-2 rounded-xl"
            style={{ background: `${color}0d`, color: `${color}cc`, borderColor: `${color}25`,
              border: "1px solid", fontFamily: "var(--font-dm-sans)" }}>
            💡 {lock.hint}
          </p>
        )}

        {/* Submit */}
        <motion.button
          onClick={submit}
          disabled={selected === null || revealed}
          whileTap={selected !== null && !revealed ? { scale: 0.97 } : {}}
          className="w-full rounded-full py-3.5 text-sm font-semibold"
          style={{
            background: revealed
              ? isCorrect ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(248,113,113,0.2)"
              : selected !== null ? `linear-gradient(135deg,${color},#055C3F)` : "rgba(255,255,255,0.06)",
            color: revealed ? (isCorrect ? "var(--text)" : "#f87171") : selected !== null ? "var(--text)" : "var(--text-dim)",
            fontFamily: "var(--font-dm-sans)",
          }}>
          {revealed
            ? isCorrect ? "🔓 Cadenas ouvert !" : "❌ Mauvaise réponse"
            : "Valider"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function EscapeRoomPage() {
  const { room: roomId } = useParams() as { room: string };
  const router = useRouter();

  const room = roomId === "current" ? getCurrentEscapeRoom() : getEscapeRoom(roomId);

  const storageKey = `escape_${room?.id ?? "unknown"}`;
  const [solvedLocks, setSolvedLocks] = useState<number[]>(() => {
    if (typeof window === "undefined" || !room) return [];
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "[]"); } catch { return []; }
  });
  const [activeLock, setActiveLock] = useState<EscapeLock | null>(null);
  const [allSolved,  setAllSolved]  = useState(() => solvedLocks.length === 4);

  const solveLock = useCallback((lockId: number) => {
    const newSolved = [...solvedLocks, lockId];
    setSolvedLocks(newSolved);
    localStorage.setItem(storageKey, JSON.stringify(newSolved));
    if (newSolved.length === 4 && room) {
      setAllSolved(true);
      gameStorage.addXP(room.reward.xp);
      gameStorage.addCoins(room.reward.coins);
      for (let i = 0; i < room.reward.chests; i++) gameStorage.addChest();
    }
  }, [solvedLocks, room, storageKey]);

  if (!room) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
      <p style={{ color: "var(--text)" }}>Escape room introuvable.</p>
    </div>
  );

  // ── Bibliothèque de Tombouctou → expérience 3D Tapis Voyageur ────
  if (room.id === "room_bibliotheque_1") return <BibliothequeFullscreen />;

  return (
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-11 pb-3">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-tight" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {room.name}
          </h1>
          <p className="text-xs opacity-45" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {solvedLocks.length}/4 cadenas ouverts
          </p>
        </div>
        {/* Progress locks */}
        <div className="flex gap-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: solvedLocks.includes(i) ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${solvedLocks.includes(i) ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}>
              {solvedLocks.includes(i)
                ? <Unlock size={12} style={{ color: "#4ade80" }} />
                : <Lock size={12} style={{ color: "var(--text-dim)" }} />
              }
            </div>
          ))}
        </div>
      </div>

      {/* Room description */}
      <p className="px-5 mb-4 text-xs leading-relaxed"
        style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
        {room.description}
      </p>

      {/* Isometric room */}
      <div className="px-2 mb-4">
        <IsometricRoom
          theme={room.theme}
          accentColor={room.accentColor}
          wallColor={room.wallColor}
          floorColor={room.floorColor}
          solvedLocks={solvedLocks}
        />
      </div>

      {/* Lock cards */}
      <div className="px-5 flex flex-col gap-3">
        {room.locks.map((lock) => {
          const solved = solvedLocks.includes(lock.id);
          return (
            <motion.button
              key={lock.id}
              onClick={() => !solved && setActiveLock(lock)}
              whileTap={!solved ? { scale: 0.97 } : {}}
              className="flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left"
              style={{
                background: solved ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)",
                borderColor: solved ? "rgba(74,222,128,0.3)" : `${room.accentColor}22`,
                cursor: solved ? "default" : "pointer",
              }}
            >
              <span className="text-2xl shrink-0">{lock.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: solved ? "#4ade80" : "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                  {lock.label}
                </p>
                <p className="text-xs" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                  {lock.type === "arabic" ? "Arabe" : lock.type === "religion" ? "Religion" : lock.type === "calligraphy" ? "Calligraphie" : "Darija"}
                </p>
              </div>
              {solved
                ? <CheckCircle2 size={20} style={{ color: "#4ade80" }} />
                : <Lock size={18} style={{ color: `${room.accentColor}70` }} />
              }
            </motion.button>
          );
        })}
      </div>

      {/* All solved celebration */}
      <AnimatePresence>
        {allSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-5 mt-5 rounded-2xl border p-5 text-center"
            style={{ background: "var(--bg-gold)", borderColor: "rgba(212,175,55,0.35)" }}
          >
            <p className="text-2xl mb-2">🏆</p>
            <p className="font-bold text-base mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              Escape réussi !
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
              +{room.reward.xp} XP · +{room.reward.coins} 🪙 · {room.reward.chests} coffre{room.reward.chests > 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-32" />

      {/* Lock modal */}
      <AnimatePresence>
        {activeLock && (
          <LockModal
            lock={activeLock}
            color={room.accentColor}
            onSolve={solveLock}
            onClose={() => setActiveLock(null)}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
