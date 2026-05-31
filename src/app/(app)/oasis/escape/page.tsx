"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Clock, Users, Boxes } from "lucide-react";

// ── Données des jeux ──────────────────────────────────────────────────
const GAMES = [
  {
    id: "room_bibliotheque_1",
    name: "La Bibliothèque de Tombouctou",
    subtitle: "Mali · XIVème siècle",
    level: "Moyen" as const,
    players: "1–4 joueurs",
    duration: "30 min",
    locked: false,
    description: "Des manuscrits précieux sont en danger. Pilote ton tapis volant à travers la bibliothèque et résous 4 énigmes pour sauver la connaissance.",
    accentColor: "#D4AF37",
    gradient: "linear-gradient(135deg, #1A0A02 0%, #3A1800 40%, #0A0502 100%)",
  },
  {
    id: "palais_cordoue",
    name: "Le Palais de Cordoue",
    subtitle: "Espagne · XIème siècle",
    level: "Difficile" as const,
    players: "1–4 joueurs",
    duration: "45 min",
    locked: true,
    description: "Dans les jardins de l'Alhambra, des secrets sont gravés dans les mosaïques.",
    accentColor: "#7C3AED",
    gradient: "linear-gradient(135deg, #0D0618 0%, #1E0A3C 40%, #060208 100%)",
  },
  {
    id: "observatoire_samarcande",
    name: "L'Observatoire de Samarcande",
    subtitle: "Ouzbékistan · XVème siècle",
    level: "Difficile" as const,
    players: "1–4 joueurs",
    duration: "40 min",
    locked: true,
    description: "Les étoiles d'Oulougbek renferment la clé d'une formule mathématique oubliée.",
    accentColor: "#0EA5E9",
    gradient: "linear-gradient(135deg, #020A18 0%, #051A30 40%, #010810 100%)",
  },
  {
    id: "maison_sagesse",
    name: "La Maison de la Sagesse",
    subtitle: "Bagdad · IXème siècle",
    level: "Facile" as const,
    players: "1–4 joueurs",
    duration: "25 min",
    locked: true,
    description: "Bayt al-Hikma : là où les savants du monde entier se rencontraient.",
    accentColor: "#10B981",
    gradient: "linear-gradient(135deg, #020A06 0%, #052014 40%, #010604 100%)",
  },
] as const;

const LEVEL_COLOR: Record<string, string> = {
  Facile:   "#4ade80",
  Moyen:    "#fb923c",
  Difficile: "#f87171",
};
const LEVEL_BG: Record<string, string> = {
  Facile:   "rgba(74,222,128,0.12)",
  Moyen:    "rgba(251,146,60,0.12)",
  Difficile: "rgba(248,113,113,0.12)",
};

// ── Décoration d'ambiance SVG pour chaque carte ───────────────────────
function TombouktouAmbiance() {
  return (
    <svg viewBox="0 0 360 180" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }}>
      {/* Sol */}
      <rect x={0} y={130} width={360} height={50} fill="#1A0800" />
      {/* Étagères */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={i === 1 ? 220 : i === 0 ? 10 : 280} y={50 + i * 25} width={i === 1 ? 80 : 60} height={4} fill="#4A2810" opacity={0.9} />
          {[0,1,2,3].map(b => (
            <rect key={b}
              x={(i === 1 ? 225 : i === 0 ? 14 : 283) + b * (i === 1 ? 18 : 14)}
              y={30 + i * 25} width={i === 1 ? 14 : 11} height={24}
              rx={1}
              fill={["#6B0000","#1A2A5B","#2E4C2E","#5C3A00"][b % 4]}
              opacity={0.85}
            />
          ))}
        </g>
      ))}
      {/* Bougies */}
      {[[60, 110], [180, 100], [300, 115]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 3} y={y} width={6} height={16} fill="#E8D5A3" opacity={0.7} />
          <ellipse cx={x} cy={y - 2} rx={4} ry={6} fill="#FFB347" opacity={0.85} />
          <ellipse cx={x} cy={y - 4} rx={2} ry={3} fill="#FFF5C0" opacity={0.7} />
          {/* Lueur */}
          <circle cx={x} cy={y} r={18} fill="#FF9040" opacity={0.06} />
        </g>
      ))}
      {/* Tapis volant discret */}
      <ellipse cx={180} cy={88} rx={28} ry={7} fill="#055C3F" opacity={0.5} />
      <rect x={155} y={83} width={50} height={10} rx={3} fill="#055C3F" opacity={0.4} />
      <line x1={155} y1={86} x2={205} y2={86} stroke="#D4AF37" strokeWidth={0.8} opacity={0.6} />
      <line x1={155} y1={90} x2={205} y2={90} stroke="#D4AF37" strokeWidth={0.8} opacity={0.6} />
      {/* Étoile centrale */}
      <polygon points="180,79 182,84 187,84 183,87 185,92 180,89 175,92 177,87 173,84 178,84"
        fill="#D4AF37" opacity={0.6} />
    </svg>
  );
}

function LockedAmbiance({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 360 180" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.20 }}>
      {/* Silhouettes floues */}
      <rect x={20} y={40} width={70} height={100} rx={4} fill={color} opacity={0.3} />
      <rect x={100} y={60} width={50} height={80} rx={4} fill={color} opacity={0.2} />
      <rect x={250} y={35} width={80} height={105} rx={4} fill={color} opacity={0.25} />
      <circle cx={180} cy={90} r={30} fill={color} opacity={0.1} />
      <text x={180} y={96} textAnchor="middle" fontSize={28} fill={color} opacity={0.4}>🔒</text>
    </svg>
  );
}

// ── Composant carte ───────────────────────────────────────────────────
function GameCard({ game, index }: { game: typeof GAMES[number]; index: number }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 300, damping: 28 }}
      style={{
        position: "relative",
        height: 180,
        borderRadius: 20,
        overflow: "hidden",
        background: game.gradient,
        border: `1px solid ${game.locked ? "rgba(255,255,255,0.06)" : `${game.accentColor}30`}`,
        cursor: game.locked ? "default" : "pointer",
        flexShrink: 0,
      }}
      whileTap={game.locked ? {} : { scale: 0.975 }}
      onClick={() => !game.locked && router.push(`/oasis/escape/${game.id}`)}
    >
      {/* Ambiance visuelle */}
      {game.id === "room_bibliotheque_1" ? <TombouktouAmbiance /> : <LockedAmbiance color={game.accentColor} />}

      {/* Overlay sombre bas → haut */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
      }} />

      {/* Badge niveau — haut gauche */}
      <div style={{
        position: "absolute", top: 14, left: 14,
        padding: "4px 10px", borderRadius: 20,
        background: LEVEL_BG[game.level],
        border: `1px solid ${LEVEL_COLOR[game.level]}40`,
      }}>
        <span style={{ color: LEVEL_COLOR[game.level], fontSize: 10, fontWeight: 700,
          fontFamily: "var(--font-dm-sans)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {game.level}
        </span>
      </div>

      {/* Cadenas si verrouillé — haut droite */}
      {game.locked && (
        <div style={{ position: "absolute", top: 12, right: 14 }}>
          <Lock size={16} style={{ color: "rgba(255,255,255,0.25)" }} />
        </div>
      )}

      {/* Contenu bas */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 14px" }}>
        <p style={{
          color: game.locked ? "rgba(255,255,255,0.3)" : "var(--text)",
          fontSize: 15, fontWeight: 700, lineHeight: 1.25, marginBottom: 3,
          fontFamily: "var(--font-bricolage)",
        }}>
          {game.name}
        </p>
        <p style={{
          color: game.locked ? "rgba(255,255,255,0.18)" : `${game.accentColor}cc`,
          fontSize: 11, marginBottom: 10,
          fontFamily: "var(--font-dm-sans)", letterSpacing: "0.06em",
        }}>
          {game.subtitle}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Méta gauche */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Users size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "var(--font-dm-sans)" }}>
                {game.players}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "var(--font-dm-sans)" }}>
                {game.duration}
              </span>
            </div>
          </div>

          {/* Bouton JOUER ou BIENTÔT */}
          {game.locked ? (
            <div style={{
              padding: "6px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700,
                fontFamily: "var(--font-dm-sans)", letterSpacing: "0.1em" }}>
                BIENTÔT
              </span>
            </div>
          ) : (
            <motion.div
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "7px 18px", borderRadius: 20,
                background: "#D4AF37",
                boxShadow: "0 0 16px rgba(212,175,55,0.4)",
              }}
            >
              <span style={{ color: "#061A12", fontSize: 11, fontWeight: 800,
                fontFamily: "var(--font-dm-sans)", letterSpacing: "0.12em" }}>
                JOUER
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page principale ───────────────────────────────────────────────────
export default function EscapeSelectPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100svh", background: "#061A12", overflowY: "auto" }}>

      {/* Header */}
      <div style={{
        paddingTop: "calc(52px + env(safe-area-inset-top))",
        paddingLeft: 20, paddingRight: 20, paddingBottom: 8,
      }}>
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.9 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid rgba(212,175,55,0.18)",
            background: "transparent", color: "var(--text)",
            marginBottom: 24, cursor: "pointer",
          }}
        >
          <ArrowLeft size={15} />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 style={{
            color: "var(--text)", fontSize: 26, fontWeight: 800, lineHeight: 1.1,
            fontFamily: "var(--font-bricolage)", marginBottom: 4,
          }}>
            Escape Games
          </h1>
          <p style={{
            color: "#D4AF37", fontSize: 18, fontFamily: "var(--font-amiri, serif)",
            direction: "rtl", opacity: 0.75, marginBottom: 6,
          }}>
            ألعاب الهروب
          </p>
          <p style={{
            color: "rgba(248,244,236,0.4)", fontSize: 12,
            fontFamily: "var(--font-dm-sans)", marginBottom: 28,
          }}>
            Explore des lieux historiques islamiques · Résous des énigmes
          </p>
        </motion.div>
      </div>

      {/* ── Expériences phares ───────────────────────────────── */}
      <div style={{ paddingLeft: 16, paddingRight: 16, display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>

        {/* Tombouctou */}
        <motion.button
          onClick={() => router.push("/escape/tombouctou")}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", borderRadius: 16, border: "1px solid rgba(212,175,55,0.55)",
            padding: "18px 20px", textAlign: "left", position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg,rgba(212,175,55,0.18) 0%,rgba(6,10,6,0.97) 60%,rgba(1,8,4,1) 100%)",
            boxShadow: "0 0 36px rgba(212,175,55,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Boxes size={22} style={{ color: "#D4AF37" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#D4AF37", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", fontFamily: "var(--font-dm-sans)", marginBottom: 2 }}>
                ✦ Exclusif · Escape islamique
              </p>
              <p style={{ color: "var(--text)", fontSize: 15, fontWeight: 700,
                fontFamily: "var(--font-bricolage)", marginBottom: 2 }}>
                La Bibliothèque de Tombouctou
              </p>
              <p style={{ color: "rgba(248,244,236,0.5)", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}>
                Sauve 5 manuscrits · 30 min · Histoire vraie
              </p>
            </div>
            <span style={{ color: "#D4AF37", fontSize: 18 }}>→</span>
          </div>
        </motion.button>

        {/* Riad 3D */}
        <motion.button
          onClick={() => router.push("/escape3d")}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", borderRadius: 16, border: "1px solid rgba(5,195,111,0.4)",
            padding: "18px 20px", textAlign: "left",
            background: "linear-gradient(135deg,rgba(5,92,63,0.35) 0%,rgba(4,6,8,0.9) 100%)",
            boxShadow: "0 0 28px rgba(5,195,111,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: "rgba(5,195,111,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Boxes size={22} style={{ color: "#05C36F" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#05C36F", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", fontFamily: "var(--font-dm-sans)", marginBottom: 2 }}>
                ✦ Expérience 3D
              </p>
              <p style={{ color: "var(--text)", fontSize: 15, fontWeight: 700,
                fontFamily: "var(--font-bricolage)", marginBottom: 2 }}>
                Le Riad des Secrets
              </p>
              <p style={{ color: "rgba(248,244,236,0.45)", fontSize: 11, fontFamily: "var(--font-dm-sans)" }}>
                Explore le riad · 5 énigmes en arabe
              </p>
            </div>
            <span style={{ color: "#05C36F", fontSize: 18 }}>→</span>
          </div>
        </motion.button>
      </div>

      {/* Grille de cartes */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 14,
        paddingLeft: 16, paddingRight: 16,
        paddingBottom: "calc(48px + env(safe-area-inset-bottom))",
      }}>
        {GAMES.map((game, i) => (
          <GameCard key={game.id} game={game} index={i} />
        ))}
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        style={{
          textAlign: "center", fontSize: 10,
          color: "rgba(212,175,55,0.25)", fontFamily: "var(--font-dm-sans)",
          letterSpacing: "0.12em", textTransform: "uppercase",
          paddingBottom: "calc(28px + env(safe-area-inset-bottom))",
        }}
      >
        De nouveaux jeux arrivent chaque saison
      </motion.p>
    </div>
  );
}
