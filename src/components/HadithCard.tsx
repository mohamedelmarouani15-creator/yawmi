"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/motion";
import Link from "next/link";

export interface Hadith {
  id: string;
  text_fr: string;
  text_ar: string;
  source: string;
  reference: string;
  category: string;
  difficulty: number;
  is_active: boolean;
}

interface HadithCardProps {
  /** Override the rotation logic with a specific hadith */
  hadith?: Hadith;
  /** Show Arabic text. Defaults to true. */
  showArabic?: boolean;
  /** Show the "En savoir plus" button. Defaults to false. */
  showLearnMore?: boolean;
  className?: string;
}

/**
 * HadithCard — carte réutilisable affichant un hadith authentique.
 *
 * Sans prop `hadith`, elle fetch automatiquement le hadith du jour depuis
 * Supabase (rotation par day_of_week % 7).
 */
export function HadithCard({
  hadith: propHadith,
  showArabic = true,
  showLearnMore = false,
  className = "",
}: HadithCardProps) {
  const [hadith, setHadith] = useState<Hadith | null>(propHadith ?? null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (propHadith) return;

    async function fetchDailyHadith() {
      // Rotation par jour de la semaine (0–6)
      const dayOfWeek = new Date().getDay();

      const { data, error } = await supabase
        .from("hadiths")
        .select("*")
        .eq("is_active", true)
        .limit(80);

      if (error || !data || data.length === 0) return;

      // Sélectionner un hadith différent chaque jour
      const idx = (Math.floor(Date.now() / 86_400_000) + dayOfWeek) % data.length;
      setHadith(data[idx] as Hadith);
    }

    fetchDailyHadith();
  }, [propHadith]);

  if (!hadith) return null;

  // Tronquer le texte français à 3 lignes ~120 caractères
  const maxChars = 160;
  const isLong = hadith.text_fr.length > maxChars;
  const displayText =
    isLong && !expanded
      ? hadith.text_fr.slice(0, maxChars).trimEnd() + "…"
      : hadith.text_fr;

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-2xl border px-4 py-4 flex flex-col gap-3 ${className}`}
      style={{
        background: "rgba(212,175,55,0.04)",
        borderColor: "rgba(212,175,55,0.18)",
      }}
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <p
          className="text-xs tracking-widest uppercase opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
        >
          Hadith du jour
        </p>
        <span
          className="text-xs opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
        >
          {hadith.source} · {hadith.reference}
        </span>
      </div>

      {/* Texte arabe */}
      {showArabic && (
        <p
          className="text-lg font-bold leading-loose text-right"
          style={{
            color: "var(--gold)",
            fontFamily: "var(--font-amiri)",
            direction: "rtl",
            lineHeight: "2rem",
          }}
        >
          {hadith.text_ar}
        </p>
      )}

      {/* Texte français */}
      <p
        className="text-sm leading-relaxed"
        style={{
          color: "rgba(248,244,236,0.75)",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        &ldquo;{displayText}&rdquo;
      </p>

      {/* Lire plus / moins si le texte est tronqué */}
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-xs opacity-50 hover:opacity-80 transition-opacity"
          style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}

      {/* Bouton "En savoir plus" */}
      {showLearnMore && (
        <Link
          href="/hadiths"
          className="self-end text-xs opacity-60 hover:opacity-90 transition-opacity"
          style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}
        >
          En savoir plus →
        </Link>
      )}
    </motion.div>
  );
}
