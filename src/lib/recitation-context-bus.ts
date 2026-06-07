// Event bus léger — partage le contexte récitation avec le Parchemin
// Utilise CustomEvent sur window pour traverser les frontières composant
// sans prop drilling ni store global.

export interface RecitationContext {
  surahNumber: number;
  surahName:   string;
  ayahNumber:  number;
  ayahText:    string;
  score:       number;
  errors:      { word: string; suggestion: string }[];
  timestamp:   number;
}

const EVENT_NAME = "yawmi:recitation_complete";

export function emitRecitationContext(ctx: RecitationContext): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: ctx }));
}

export function onRecitationContext(
  handler: (ctx: RecitationContext) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) =>
    handler((e as CustomEvent<RecitationContext>).detail);
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
