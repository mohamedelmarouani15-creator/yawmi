// ── Tajwid detection & coloring helpers ─────────────────────────
// Shared between RecitationMode and the main Quran reader.
// Detection is intentionally lightweight (regex-based) so it runs
// synchronously in the render path without blocking the UI.

export interface TajwidIssue {
  type: TajwidRule;
  position: number; // word index (0-based)
}

export type TajwidRule =
  | "qalqala"
  | "ghunna"
  | "madd"
  | "idghaam"
  | "ikhfa"
  | "iqlab";

// ── Visual palette ───────────────────────────────────────────────
// Underline style: subtle — does not overpower the Arabic calligraphy.
// Each rule gets a distinct hue from the Yawmi palette family.

export const TAJWID_STYLE: Record<
  TajwidRule,
  { color: string; labelFr: string; labelAr: string }
> = {
  qalqala: { color: "#ef4444", labelFr: "Qalqala",  labelAr: "قلقلة" },
  ghunna:  { color: "#22c55e", labelFr: "Ghunna",   labelAr: "غُنَّة"  },
  madd:    { color: "#3b82f6", labelFr: "Madd",     labelAr: "مَدّ"   },
  idghaam: { color: "#a855f7", labelFr: "Idghâm",   labelAr: "إدغام"  },
  ikhfa:   { color: "#f97316", labelFr: "Ikhfâ",    labelAr: "إخفاء"  },
  iqlab:   { color: "#ec4899", labelFr: "Iqlab",    labelAr: "إقلاب"  },
};

// ── Detection ────────────────────────────────────────────────────
// Operates word-by-word over a single ayah string.
// Returns one issue per rule per word (not per occurrence inside
// a word) to keep highlight density manageable.

export function detectTajwid(text: string): TajwidIssue[] {
  const issues: TajwidIssue[] = [];
  const words = text.split(/\s+/);

  words.forEach((word, idx) => {
    // Qalqala — letters ق ط ب ج د (in sukun or at end of word)
    if (/[قطبجد]/.test(word)) {
      issues.push({ type: "qalqala", position: idx });
    }

    // Ghunna — nun or mim with shadda (ّ)
    if (/[نم]ّ/.test(word)) {
      issues.push({ type: "ghunna", position: idx });
    }

    // Madd — alef madda (آ) or alef/waw/ya followed by sukun
    if (/آ|[وي]ْ|اً/.test(word)) {
      issues.push({ type: "madd", position: idx });
    }

    // Idghaam — nun sakin (نْ) or tanwin before ي ر م ل و ن
    if (/نْ\s*[يرملون]|[ًٌٍ]\s*[يرملون]/.test(word)) {
      issues.push({ type: "idghaam", position: idx });
    }

    // Ikhfa — nun sakin or tanwin before ikhfa letters
    if (/نْ\s*[تثجدذزسشصضطظفقك]/.test(word)) {
      issues.push({ type: "ikhfa", position: idx });
    }

    // Iqlab — nun sakin or tanwin before ب
    if (/نْ\s*ب|[ًٌٍ]\s*ب/.test(word)) {
      issues.push({ type: "iqlab", position: idx });
    }
  });

  return issues;
}

// ── Build a word-index → rule map (first match per word) ─────────
export function buildTajwidMap(text: string): Map<number, TajwidRule> {
  const issues = detectTajwid(text);
  const map = new Map<number, TajwidRule>();
  // Keep only the first rule per word position (priority: qalqala > ghunna > …)
  for (const issue of issues) {
    if (!map.has(issue.position)) {
      map.set(issue.position, issue.type);
    }
  }
  return map;
}

// ── Unique rule types in a string (for badge display) ────────────
export function getUniqueTajwidRules(text: string): TajwidRule[] {
  return [...new Set(detectTajwid(text).map((i) => i.type))];
}
