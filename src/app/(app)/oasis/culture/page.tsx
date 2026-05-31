"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { QUESTIONS } from "@/lib/game/questions";
import { pageVariants, itemVariants } from "@/lib/motion";

// Déduplique les capsules par titre et enrichit avec la catégorie
const ALL_CAPSULES = (() => {
  const seen = new Set<string>();
  const out: { title: string; text: string; category: string }[] = [];
  for (const q of QUESTIONS) {
    if (!q.culturalCapsule) continue;
    const { title, text } = q.culturalCapsule;
    if (seen.has(title)) continue;
    seen.add(title);
    out.push({ title, text, category: q.category });
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
})();

const CATEGORY_LABELS: Record<string, string> = {
  religion: "Religion",
  history:  "Histoire",
  arabic:   "Arabe",
  darija:   "Darija",
  quran:    "Coran",
};

const CATEGORY_COLORS: Record<string, string> = {
  religion: "#D4AF37",
  history:  "#60a5fa",
  arabic:   "#34d399",
  darija:   "#f87171",
  quran:    "#a78bfa",
};

export default function CulturePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [...new Set(ALL_CAPSULES.map(c => c.category))];

  const filtered = ALL_CAPSULES.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
      || c.text.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-5 px-5 pt-12 pb-24"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC" }}
          aria-label="Retour">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <p className="text-xs tracking-widest uppercase opacity-40"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Oasis du Savoir
          </p>
          <h1 className="text-xl font-bold"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Capsules culturelles
          </h1>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
          {ALL_CAPSULES.length} savoirs
        </span>
      </motion.div>

      {/* Sous-titre */}
      <motion.p variants={itemVariants} className="text-sm leading-relaxed"
        style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
        Des faits surprenants sur la civilisation islamique — science, histoire, langue et culture.
      </motion.p>

      {/* Recherche */}
      <motion.div variants={itemVariants}
        className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.15)" }}>
        <Search size={15} style={{ color: "rgba(212,175,55,0.5)", flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Chercher une capsule…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
        />
      </motion.div>

      {/* Filtres catégorie */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory(null)}
          className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
          style={{
            background: !activeCategory ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.03)",
            borderColor: !activeCategory ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)",
            color: !activeCategory ? "#D4AF37" : "rgba(248,244,236,0.5)",
            fontFamily: "var(--font-dm-sans)",
          }}>
          Tout
        </button>
        {categories.map(cat => (
          <button key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              background: activeCategory === cat ? `${CATEGORY_COLORS[cat]}18` : "rgba(255,255,255,0.03)",
              borderColor: activeCategory === cat ? `${CATEGORY_COLORS[cat]}60` : "rgba(255,255,255,0.08)",
              color: activeCategory === cat ? CATEGORY_COLORS[cat] : "rgba(248,244,236,0.5)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </motion.div>

      {/* Liste des capsules */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm opacity-40 py-8"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Aucune capsule trouvée
          </p>
        )}
        {filtered.map((cap, idx) => (
          <motion.div key={cap.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(18,12,3,0.97) 0%, rgba(12,8,2,0.97) 100%)",
              borderColor: "rgba(212,175,55,0.2)",
            }}>
            {/* Header capsule */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2.5"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                style={{ background: "rgba(212,175,55,0.12)" }}>
                ✦
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight truncate"
                  style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                  {cap.title}
                </p>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: `${CATEGORY_COLORS[cap.category] ?? "#D4AF37"}15`,
                  color: CATEGORY_COLORS[cap.category] ?? "#D4AF37",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                {CATEGORY_LABELS[cap.category] ?? cap.category}
              </span>
            </div>
            {/* Corps */}
            <p className="px-4 pt-3 pb-4 text-sm leading-relaxed"
              style={{ color: "rgba(248,244,236,0.72)", fontFamily: "var(--font-dm-sans)" }}>
              {cap.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}
