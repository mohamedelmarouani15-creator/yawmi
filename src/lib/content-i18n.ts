import type { AppLang } from "@/lib/i18n";
import type { QuestionOption } from "@/lib/game/types";

// ── DB content (questions, story_chapters) ─────────────────────

interface QuestionTrans {
  question?: string;
  options?: QuestionOption[];
  explanation?: string;
}

interface ChapterTrans {
  title?: string;
  narrative?: string;
}

export function getQuestionLang(
  q: { question: string; options: QuestionOption[]; explanation?: string; translations?: Partial<Record<AppLang, QuestionTrans>>; question_ar?: string; options_ar?: QuestionOption[]; explanation_ar?: string },
  lang: AppLang
): { question: string; options: QuestionOption[]; explanation?: string } {
  if (lang === "fr") return { question: q.question, options: q.options, explanation: q.explanation };
  if (lang === "ar") return { question: q.question_ar ?? q.question, options: q.options_ar ?? q.options, explanation: q.explanation_ar ?? q.explanation };
  const t = q.translations?.[lang];
  return {
    question:    t?.question    ?? q.question,
    options:     t?.options     ?? q.options,
    explanation: t?.explanation ?? q.explanation,
  };
}

export function getChapterLang(
  ch: { title: string; narrative: string; translations?: Partial<Record<AppLang, ChapterTrans>>; title_ar?: string; narrative_ar?: string },
  lang: AppLang
): { title: string; narrative: string } {
  if (lang === "fr") return { title: ch.title, narrative: ch.narrative };
  if (lang === "ar") return { title: ch.title_ar ?? ch.title, narrative: ch.narrative_ar ?? ch.narrative };
  const t = ch.translations?.[lang];
  return {
    title:     t?.title     ?? ch.title,
    narrative: t?.narrative ?? ch.narrative,
  };
}

// ── Static content (sages, locations, achievements, escape rooms) ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pick(t: unknown, lang: string, field: string, fallback: string): string {
  if (lang === "fr" || !t) return fallback;
  return (t as Record<string, Record<string, string>>)[lang]?.[field] ?? fallback;
}
