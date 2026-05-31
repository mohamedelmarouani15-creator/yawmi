"use client";

import { motion } from "framer-motion";
import { useArabicAudio } from "@/hooks/useArabicAudio";

interface Props {
  arabic: string;
  translit?: string;
  fontSize?: number;
  color?: string;
  showAudio?: boolean;
  className?: string;
}

export function ArabicText({
  arabic,
  translit,
  fontSize = 22,
  color = "var(--gold)",
  showAudio = true,
  className = "",
}: Props) {
  const { speak, speaking } = useArabicAudio();

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span
          style={{
            color,
            fontSize,
            fontFamily: "var(--font-amiri)",
            direction: "rtl",
            lineHeight: 1.4,
          }}
        >
          {arabic}
        </span>

        {showAudio && (
          <motion.button
            onClick={() => speak(arabic)}
            whileTap={{ scale: 0.9 }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{
              background: speaking ? `${color}30` : `${color}15`,
              border: `1px solid ${color}35`,
            }}
            aria-label="Écouter la prononciation"
          >
            <motion.span
              animate={speaking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.6, repeat: speaking ? Infinity : 0 }}
              style={{ fontSize: 12 }}
            >
              {speaking ? "🔊" : "▶"}
            </motion.span>
          </motion.button>
        )}
      </div>

      {translit && (
        <span
          style={{
            color: `${color}80`,
            fontSize: 11,
            fontFamily: "var(--font-dm-sans)",
            fontStyle: "italic",
            letterSpacing: "0.02em",
          }}
        >
          {translit}
        </span>
      )}
    </div>
  );
}
