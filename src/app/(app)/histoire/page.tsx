"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/lib/motion";

const ARCS = [
  // ── Disponible ──────────────────────────────────────────────
  {
    id: "arc_yusuf",
    title: "L'histoire de Yûsuf",
    titleAr: "قِصَّةُ يُوسُفَ",
    subtitle: "La plus belle des histoires — Sourate 12",
    chapters: 10,
    status: "available",
    color: "#D4AF37",
    emoji: "⭐",
    description: "Dix chapitres pour découvrir l'histoire de Yûsuf — la jalousie, le puits, l'Égypte, la prison et le pardon.",
  },

  {
    id: "arc_ibrahim",
    title: "Ibrahim et le Feu",
    titleAr: "إِبْرَاهِيمُ وَالنَّارُ",
    subtitle: "Le père des prophètes — Sourates 21, 37",
    chapters: 8,
    status: "available",
    color: "#f97316",
    emoji: "🔥",
    description: "De la destruction des idoles à la construction de la Ka'ba — le courage inébranlable d'Ibrahim face au roi Nimrod.",
  },
  {
    id: "arc_moussa",
    title: "Moussa et Pharaon",
    titleAr: "مُوسَى وَفِرْعَوْنُ",
    subtitle: "La confrontation des prophètes — Sourate 20",
    chapters: 10,
    status: "available",
    color: "#06b6d4",
    emoji: "🌊",
    description: "Du berceau sur le Nil à la traversée de la mer Rouge — Moussa face au plus grand tyran de son époque.",
  },
  {
    id: "arc_maryam",
    title: "Maryam, la choisie",
    titleAr: "مَرْيَمُ الصِّدِّيقَةُ",
    subtitle: "La femme la plus mentionnée — Sourate 19",
    chapters: 6,
    status: "available",
    color: "#a78bfa",
    emoji: "🌿",
    description: "L'histoire de la femme la plus mentionnée dans le Coran — sa dévotion, sa pureté et la naissance miraculeuse.",
  },
  {
    id: "arc_sira",
    title: "La Sîra — La vie du Prophète ﷺ",
    titleAr: "السِّيرَةُ النَّبَوِيَّةُ",
    subtitle: "De La Mecque à Médine",
    chapters: 12,
    status: "available",
    color: "#34d399",
    emoji: "🌙",
    description: "Les grandes étapes de la vie du Prophète Muhammad ﷺ — la révélation, les épreuves et la construction de la communauté.",
  },
  {
    id: "arc_sahaba",
    title: "Les Compagnons du Prophète ﷺ",
    titleAr: "الصَّحَابَةُ الْكِرَامُ",
    subtitle: "Histoires de courage et de foi",
    chapters: 10,
    status: "available",
    color: "#fbbf24",
    emoji: "🛡️",
    description: "Abu Bakr, Omar, Bilal, Khadija, Fatima — les hommes et femmes qui ont porté l'islam à ses débuts.",
  },
  {
    id: "arc_hijra",
    title: "La Hijra — La Grande Migration",
    titleAr: "الْهِجْرَةُ الْمُبَارَكَةُ",
    subtitle: "Le début du calendrier islamique",
    chapters: 5,
    status: "available",
    color: "#60a5fa",
    emoji: "🐫",
    description: "La migration de La Mecque à Médine — un voyage de foi qui a changé le cours de l'histoire.",
  },
  {
    id: "arc_ismail",
    title: "Ismaïl et le Sacrifice",
    titleAr: "إِسْمَاعِيلُ وَالذَّبْحُ",
    subtitle: "L'origine de l'Aïd al-Adha — Sourate 37",
    chapters: 4,
    status: "available",
    color: "#f43f5e",
    emoji: "🐑",
    description: "Le test suprême d'Ibrahim et de son fils Ismaïl — la naissance du sacrifice et de la foi absolue.",
  },
  {
    id: "arc_isra_miraj",
    title: "Al-Isrâ wal-Miraj",
    titleAr: "الْإِسْرَاءُ وَالْمِعْرَاجُ",
    subtitle: "Le voyage nocturne — Sourate 17",
    chapters: 5,
    status: "available",
    color: "#c084fc",
    emoji: "✨",
    description: "Le voyage miraculeuse du Prophète ﷺ de La Mecque à Jérusalem, puis son ascension aux sept cieux.",
  },
  {
    id: "arc_souleimane",
    title: "Souleimane, le Roi Sage",
    titleAr: "سُلَيْمَانُ الْحَكِيمُ",
    subtitle: "Sagesse et pouvoir — Sourates 21, 27",
    chapters: 7,
    status: "available",
    color: "#84cc16",
    emoji: "👑",
    description: "Le roi qui parlait aux oiseaux et commandait aux djinns — l'histoire de la sagesse divine au service de la justice.",
  },
];

// Tapis voyageur SVG
function TapisVoyageur() {
  return (
    <svg width={180} height={100} viewBox="0 0 180 100">
      {/* Corps du tapis */}
      <rect x={10} y={20} width={160} height={60} rx={6}
        fill="#8B2500" stroke="rgba(212,175,55,0.6)" strokeWidth={1.5} />
      {/* Bordure intérieure */}
      <rect x={16} y={26} width={148} height={48} rx={4}
        fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth={1} />
      {/* Motif central géométrique */}
      <polygon points="90,38 100,50 90,62 80,50"
        fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth={1} />
      <circle cx={90} cy={50} r={4} fill="rgba(212,175,55,0.4)" />
      {/* Franges gauche */}
      {[0,1,2,3,4].map(i => (
        <line key={`fl${i}`} x1={10} y1={30 + i * 10} x2={2} y2={33 + i * 10}
          stroke="rgba(212,175,55,0.5)" strokeWidth={1.2} strokeLinecap="round" />
      ))}
      {/* Franges droite */}
      {[0,1,2,3,4].map(i => (
        <line key={`fr${i}`} x1={170} y1={30 + i * 10} x2={178} y2={33 + i * 10}
          stroke="rgba(212,175,55,0.5)" strokeWidth={1.2} strokeLinecap="round" />
      ))}
      {/* Étoiles décoratives */}
      {[[35,50],[145,50],[90,32],[90,68]].map(([cx, cy], i) => (
        <text key={i} x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={8} fill="rgba(212,175,55,0.35)">✦</text>
      ))}
    </svg>
  );
}

export default function HistoirePage() {
  const router = useRouter();

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col px-5 pt-12 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <p className="text-xs tracking-widest uppercase opacity-50 mb-1"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          La Grande Histoire
        </p>
        <h1 className="text-2xl font-bold mb-1"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Le Tapis Voyageur
        </h1>
        <p className="text-xs leading-relaxed opacity-45"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Voyage à travers les histoires de l&apos;islam.
          Un chapitre par jour, une leçon pour la vie.
        </p>
      </motion.div>

      {/* Tapis illustration */}
      <motion.div variants={itemVariants} className="flex justify-center mb-8">
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <TapisVoyageur />
        </motion.div>
      </motion.div>

      {/* Arcs disponibles */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        {ARCS.map((arc, idx) => {
          const available = arc.status === "available";
          return (
            <motion.button
              key={arc.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.35 }}
              onClick={() => available ? router.push(`/histoire/${arc.id}`) : undefined}
              whileTap={available ? { scale: 0.97 } : {}}
              className="rounded-3xl border p-5 text-left w-full relative overflow-hidden"
              style={{
                background: available
                  ? "linear-gradient(135deg,rgba(212,175,55,0.1) 0%,rgba(6,26,18,0.95) 100%)"
                  : "rgba(255,255,255,0.02)",
                borderColor: available ? `${arc.color}50` : "rgba(255,255,255,0.06)",
                boxShadow: available ? `0 0 24px ${arc.color}10` : "none",
                opacity: available ? 1 : 0.7,
                cursor: available ? "pointer" : "default",
              }}
            >
              {!available && (
                <div className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                  Bientôt
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <span style={{ fontSize: 28, opacity: available ? 1 : 0.6 }}>{arc.emoji}</span>
                <div className="flex-1 pr-12">
                  <p className="font-bold text-base leading-tight mb-0.5"
                    style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
                    {arc.title}
                  </p>
                  <p lang="ar" className="text-base leading-tight mb-1"
                    style={{ color: arc.color, fontFamily: "var(--font-amiri)", direction: "rtl", opacity: available ? 1 : 0.6 }}>
                    {arc.titleAr}
                  </p>
                  <p className="text-xs opacity-55"
                    style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {arc.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4 opacity-60"
                style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {arc.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs"
                  style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                  {arc.chapters} chapitres
                </span>
                {available && (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: `${arc.color}20`,
                      color: arc.color,
                      border: `1px solid ${arc.color}40`,
                      fontFamily: "var(--font-dm-sans)",
                    }}>
                    Commencer →
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Note de validation */}
      <motion.div variants={itemVariants} className="mt-6 rounded-xl border p-3"
        style={{ borderColor: "rgba(212,175,55,0.12)", background: "rgba(212,175,55,0.04)" }}>
        <p className="text-xs leading-relaxed opacity-50 text-center"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          ✦ Sources : Coran & Sîra fiable. Aucun dialogue inventé dans la bouche des prophètes.
          Ce contenu est en cours de validation religieuse avant diffusion publique.
        </p>
      </motion.div>
    </motion.main>
  );
}
