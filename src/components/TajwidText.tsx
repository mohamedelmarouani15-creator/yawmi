"use client";

// ── TajwidText ───────────────────────────────────────────────────
// Drop-in replacement for a plain <p> rendering Arabic ayah text.
// Splits the text word-by-word and applies a colored underline to
// each word that matches a tajwid rule.
//
// Underline (not background) keeps the calligraphy legible and
// matches the established WordHighlight style in RecitationMode.
//
// Usage:
//   <TajwidText text={ayah.text} fontSize={21} />
//   <TajwidText text={ayah.text} fontSize={21} enabled={false} />

import { useMemo } from "react";
import { buildTajwidMap, TAJWID_STYLE, type TajwidRule } from "@/lib/tajwid";

interface TajwidTextProps {
  text: string;
  fontSize?: number;
  /** Set to false to render plain text (user pref / kids mode) */
  enabled?: boolean;
  className?: string;
}

export default function TajwidText({
  text,
  fontSize = 21,
  enabled = true,
  className = "",
}: TajwidTextProps) {
  const tajwidMap = useMemo<Map<number, TajwidRule>>(
    () => (enabled ? buildTajwidMap(text) : new Map<number, TajwidRule>()),
    [text, enabled],
  );

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  if (!enabled) {
    // Plain render — no cost
    return (
      <p
        className={`text-right leading-loose ${className}`}
        style={{
          fontFamily: "var(--font-amiri)",
          direction: "rtl",
          fontSize,
          color: "var(--text)",
        }}
        lang="ar"
      >
        {text}
      </p>
    );
  }

  return (
    <p
      className={`text-right leading-loose ${className}`}
      style={{
        fontFamily: "var(--font-amiri)",
        direction: "rtl",
        fontSize,
        color: "var(--text)",
      }}
      lang="ar"
    >
      {words.map((word, i) => {
        const rule = tajwidMap.get(i);
        if (!rule) {
          return (
            <span key={i}>
              {word}
              {" "}
            </span>
          );
        }
        const { color } = TAJWID_STYLE[rule];
        return (
          <span
            key={i}
            title={`${TAJWID_STYLE[rule].labelFr} — ${TAJWID_STYLE[rule].labelAr}`}
            style={{
              textDecoration: "underline",
              textDecorationColor: color,
              textDecorationThickness: 2,
              textUnderlineOffset: 4,
              // No background — keeps Arabic letterforms unobstructed
            }}
          >
            {word}
            {" "}
          </span>
        );
      })}
    </p>
  );
}

// ── TajwidLegend ─────────────────────────────────────────────────
// Optional compact legend to display beneath a verse.
// Shows only rules that are actually present in the given text.

interface TajwidLegendProps {
  text: string;
  isElder?: boolean;
}

export function TajwidLegend({ text, isElder = false }: TajwidLegendProps) {
  const rules = useMemo(() => {
    const map = buildTajwidMap(text);
    return [...new Set(map.values())];
  }, [text]);

  if (rules.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-1.5 mt-2"
      aria-label="Règles de tajwid présentes"
    >
      {rules.map((rule) => {
        const { color, labelFr, labelAr } = TAJWID_STYLE[rule];
        return (
          <span
            key={rule}
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}33`,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {isElder ? `${labelAr} · ` : ""}
            {labelFr}
          </span>
        );
      })}
    </div>
  );
}
