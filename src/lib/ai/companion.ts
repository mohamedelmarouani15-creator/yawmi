// Interface publique du service Compagnon
// Les routes API importent d'ici — jamais depuis gemini.ts directement

import { geminiChat, geminiSingle } from "./gemini";
import { buildContextBlock, buildContextualMessagePrompt } from "./prompts";
import type { CompanionContext, AIMessage } from "./types";

export type { CompanionContext, AIMessage };

// ── Chat dédié ────────────────────────────────────────────────
export async function askCompanion(
  userMessage: string,
  context: CompanionContext,
  history: AIMessage[],
): Promise<string> {
  const contextBlock = buildContextBlock(context);
  return geminiChat(contextBlock, history, userMessage);
}

// ── Message contextuel du jour ────────────────────────────────
export async function generateContextualMessage(
  trigger: string,
  context: CompanionContext,
): Promise<string> {
  const prompt = buildContextualMessagePrompt(trigger, context);
  return geminiSingle(prompt);
}
