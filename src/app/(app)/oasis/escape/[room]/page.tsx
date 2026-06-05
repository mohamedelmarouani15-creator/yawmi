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
import EscapeLoadingScreen from "@/components/escape3d/EscapeLoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { pick } from "@/lib/content-i18n";
import staticT from "@/lib/static-translations.json";
import ErrorBoundary from "@/components/ErrorBoundary";

// Three.js lobby — chargé uniquement quand la salle de Tombouctou est demandée
const EscapeLobby = dynamic(
  () => import("@/components/escape3d/EscapeLobby"),
  { ssr: false, loading: () => <div style={{ position: "fixed", inset: 0, background: "#030C06" }} /> },
);

// Fonction de génération inline pour éviter l'import statique de EscapeLobby
function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}


// Three.js ne tourne pas en SSR
const TapisScene = dynamic(
  () => import("@/components/escape3d/TapisScene"),
  { ssr: false },
);

// ── Expérience 3D plein écran (Bibliothèque de Tombouctou) ──────────
function BibliothequeFullscreen() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "#080502", overflow: "hidden",
    }}>
      {/* Scène 3D — charge en parallèle dès le montage */}
      <ErrorBoundary name="scène 3D" fallback={
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#080502" }}>
          <p style={{ color: "rgba(212,175,55,0.5)", fontFamily: "var(--font-dm-sans)", fontSize: 13 }}>
            La scène 3D n&apos;a pas pu se charger.
          </p>
        </div>
      }>
        <Suspense fallback={null}>
          <TapisScene />
        </Suspense>
      </ErrorBoundary>

      {/* Bouton quitter — toujours au-dessus */}
      <Link
        href="/oasis/escape"
        style={{
          position: "absolute",
          top: "calc(16px + env(safe-area-inset-top))",
          left: "calc(16px + env(safe-area-inset-left))",
          zIndex: 80,
          display: "flex", alignItems: "center", gap: 8,
          minHeight: 44,
          background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.35)",
          borderRadius: 24, padding: "10px 16px", color: "var(--gold)",
          backdropFilter: "blur(10px)", textDecoration: "none",
          fontFamily: "var(--font-dm-sans)", fontSize: 12,
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}
      >
        <ArrowLeft size={14} />
        Quitter
      </Link>

      {/* Écran de chargement — overlay 2 secondes minimum */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0, zIndex: 70 }}
          >
            <EscapeLoadingScreen onDone={() => setLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Mode picker + Lobby (Tombouctou) ────────────────────────────────
type EscapeScreen = "mode" | "lobby" | "game";

function TombouctouExperience() {
  const { user }   = useAuth();
  const [screen,      setScreen]      = useState<EscapeScreen>("mode");
  const [sessionCode, setSessionCode] = useState(() => generateSessionCode());
  const [joinCode,    setJoinCode]    = useState("");
  const [showJoin,    setShowJoin]    = useState(false);

  const playerName =
    (user?.user_metadata?.display_name as string | undefined)?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "Joueur";

  if (screen === "game")  return <BibliothequeFullscreen />;

  if (screen === "lobby") return (
    <EscapeLobby
      sessionCode={sessionCode}
      playerName={playerName}
      onStart={() => setScreen("game")}
      onLeave={() => { setScreen("mode"); setSessionCode(generateSessionCode()); setShowJoin(false); }}
    />
  );

  // ── Écran de sélection du mode ──────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60, overflow: "hidden",
      background: "linear-gradient(160deg, #040E08 0%, #071A0E 50%, #030C06 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Particules dorées légères */}
      {Array.from({ length: 16 }, (_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -14, 0], opacity: [0.1, 0.45, 0.1] }}
          transition={{ duration: 2.8 + (i % 4) * 0.6, delay: i * 0.22, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: `${(i * 41 + 7) % 94}%`, top: `${(i * 57 + 13) % 88}%`,
            width: 2 + (i % 2), height: 2 + (i % 2), borderRadius: "50%",
            background: "#D4AF37", pointerEvents: "none",
          }}
        />
      ))}

      {/* Bouton retour */}
      <Link href="/oasis/escape" style={{
        position: "absolute", top: "calc(16px + env(safe-area-inset-top))", left: 20,
        display: "flex", alignItems: "center", gap: 6, color: "rgba(212,175,55,0.6)",
        textDecoration: "none", fontFamily: "var(--font-dm-sans)", fontSize: 11,
        letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        <ArrowLeft size={13} /> Retour
      </Link>

      <div style={{ textAlign: "center", padding: "0 28px", maxWidth: 360, width: "100%" }}>
        {/* Titre jeu */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p style={{ color: "#D4AF37", fontSize: 20, fontFamily: "var(--font-amiri, serif)",
            direction: "rtl", marginBottom: 4, opacity: 0.7 }}>
            مكتبة تمبكتو
          </p>
          <h1 style={{ color: "var(--text)", fontSize: 20, fontWeight: 800,
            fontFamily: "var(--font-bricolage)", lineHeight: 1.2, marginBottom: 6 }}>
            La Bibliothèque de Tombouctou
          </h1>
          <p style={{ color: "rgba(248,244,236,0.35)", fontSize: 11,
            fontFamily: "var(--font-dm-sans)", marginBottom: 32, letterSpacing: "0.08em" }}>
            Mali · XIVème siècle · 4 cadenas à ouvrir
          </p>
        </motion.div>

        {/* Bouton SOLO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <motion.button
            onClick={() => setScreen("game")}
            whileTap={{ scale: 0.97 }}
            style={{
              width: "100%", height: 54, borderRadius: 27,
              background: "#D4AF37", border: "none", cursor: "pointer",
              color: "#061A12", fontSize: 15, fontWeight: 800,
              fontFamily: "var(--font-bricolage)", letterSpacing: "2px",
              textTransform: "uppercase",
              boxShadow: "0 0 28px rgba(212,175,55,0.45)",
              marginBottom: 12,
            }}
          >
            ✈ Jouer en solo
          </motion.button>
        </motion.div>

        {/* Section Famille */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {!showJoin ? (
            <motion.button
              onClick={() => setShowJoin(true)}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%", height: 54, borderRadius: 27,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.25)", cursor: "pointer",
                color: "rgba(248,244,236,0.75)", fontSize: 14, fontWeight: 700,
                fontFamily: "var(--font-bricolage)", letterSpacing: "1px",
              }}
            >
              👨‍👩‍👧 Jouer en famille
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 20, padding: "18px 16px",
              }}
            >
              {/* Créer */}
              <p style={{ color: "rgba(248,244,236,0.45)", fontSize: 10, letterSpacing: "0.1em",
                textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", marginBottom: 8 }}>
                Crée ta session · partage le code
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ color: "#D4AF37", fontSize: 24, fontWeight: 900,
                  fontFamily: "var(--font-bricolage)", letterSpacing: "0.18em" }}>
                  {sessionCode}
                </span>
                <motion.button
                  onClick={() => { navigator.clipboard.writeText(sessionCode).catch(() => {}); }}
                  whileTap={{ scale: 0.85 }}
                  style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: 8, padding: "4px 8px", cursor: "pointer",
                    color: "rgba(212,175,55,0.6)", fontSize: 10 }}
                >
                  Copier
                </motion.button>
              </div>
              <motion.button
                onClick={() => { setSessionCode(sessionCode); setScreen("lobby"); }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%", height: 44, borderRadius: 22,
                  background: "linear-gradient(135deg, #15803d, #16a34a)",
                  border: "none", cursor: "pointer",
                  color: "#F8F4EC", fontSize: 13, fontWeight: 700,
                  fontFamily: "var(--font-bricolage)", marginBottom: 12,
                  boxShadow: "0 0 18px rgba(22,163,74,0.3)",
                }}
              >
                Créer la salle d&apos;attente
              </motion.button>

              {/* Rejoindre */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <p style={{ color: "rgba(248,244,236,0.35)", fontSize: 10, letterSpacing: "0.1em",
                  textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", marginBottom: 8 }}>
                  Ou rejoins une session
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="CODE"
                    maxLength={4}
                    style={{
                      flex: 1, height: 44, borderRadius: 12, border: "1px solid rgba(212,175,55,0.25)",
                      background: "rgba(255,255,255,0.04)", color: "#D4AF37",
                      fontSize: 16, fontWeight: 800, textAlign: "center",
                      fontFamily: "var(--font-bricolage)", letterSpacing: "0.2em",
                      outline: "none",
                    }}
                  />
                  <motion.button
                    onClick={() => { if (joinCode.length === 4) { setSessionCode(joinCode); setScreen("lobby"); } }}
                    disabled={joinCode.length !== 4}
                    whileTap={joinCode.length === 4 ? { scale: 0.95 } : {}}
                    style={{
                      height: 44, paddingInline: 16, borderRadius: 12,
                      background: joinCode.length === 4 ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${joinCode.length === 4 ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
                      cursor: joinCode.length === 4 ? "pointer" : "default",
                      color: joinCode.length === 4 ? "#D4AF37" : "rgba(255,255,255,0.2)",
                      fontSize: 12, fontWeight: 700, fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    OK
                  </motion.button>
                </div>
              </div>

              <motion.button
                onClick={() => setShowJoin(false)}
                style={{ marginTop: 10, background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
              >
                Annuler
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
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
function LockModal({ lock, onSolve, onClose, color, lang }: {
  lock: EscapeLock;
  onSolve: (lockId: number) => void;
  onClose: () => void;
  color: string;
  lang: string;
}) {
  const isRtl = lang === "ar" || lang === "darija";
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [hintUsed, setHintUsed]   = useState(false);

  const displayOptions = (lang !== "fr" && lock.t?.[lang]?.options) ? lock.t[lang]!.options! : (isRtl && lock.optionsAr ? lock.optionsAr : lock.options);
  const isCorrect = selected !== null && displayOptions[selected]?.correct;

  const submit = useCallback(() => {
    if (selected === null) return;
    setRevealed(true);
    if (displayOptions[selected]?.correct) {
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
              {isRtl ? `قفل ${lock.id + 1}/4` : `Cadenas ${lock.id + 1}/4`}
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-bricolage)" }}>
              {isRtl ? lock.labelAr : lock.label}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto opacity-40 hover:opacity-70"
            style={{ color: "var(--text)", fontSize: 20 }}>✕</button>
        </div>

        {/* Question */}
        <p className="text-base font-semibold leading-snug mb-5"
          style={{ color: "var(--text)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-bricolage)", direction: isRtl ? "rtl" : "ltr" }}>
          {pick(lock.t as Record<string, Record<string,string>> | undefined, lang, "question", isRtl ? (lock.questionAr ?? lock.question) : lock.question)}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2 mb-4">
          {displayOptions.map((opt, idx) => {
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
                <span className="text-sm" style={{ color: textC, fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
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
            {isRtl ? "💡 اعرض التلميح (-5 قطع)" : "💡 Voir l'indice (-5 pièces)"}
          </motion.button>
        ) : (
          <p className="text-xs mb-3 px-3 py-2 rounded-xl"
            style={{ background: `${color}0d`, color: `${color}cc`, borderColor: `${color}25`,
              border: "1px solid", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
            💡 {pick(lock.t as Record<string, Record<string,string>> | undefined, lang, "hint", isRtl ? (lock.hintAr ?? lock.hint) : lock.hint)}
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
  const lang = useLang();
  const isRtl = lang === "ar" || lang === "darija";

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
      gameStorage.push(); // sync vers Supabase après escape game terminé
    }
  }, [solvedLocks, room, storageKey]);

  if (!room) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
      <p style={{ color: "var(--text)" }}>Escape room introuvable.</p>
    </div>
  );

  // ── Bibliothèque de Tombouctou → mode picker → lobby → jeu ────────
  if (room.id === "room_bibliotheque_1") return <TombouctouExperience />;

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
          <h1 className="text-base font-bold leading-tight" style={{ color: "var(--text)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-bricolage)" }}>
            {pick((staticT.escape_rooms as Record<string, Record<string, Record<string,string>>>)[room.id], lang, "name", isRtl ? (room.nameAr ?? room.name) : room.name)}
          </h1>
          <p className="text-xs opacity-45" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {solvedLocks.length}/4 {isRtl ? "أقفال مفتوحة" : "cadenas ouverts"}
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
        style={{ color: "rgba(248,244,236,0.45)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
        {pick((staticT.escape_rooms as Record<string, Record<string, Record<string,string>>>)[room.id], lang, "description", isRtl ? (room.descriptionAr ?? room.description) : room.description)}
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
            lang={lang}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
