// Interface publique du service Compagnon
// Les routes API importent d'ici — jamais depuis groq.ts directement

import { groqChat, groqSingle } from "./groq";
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
  return groqChat(contextBlock, history, userMessage);
}

// ── Message contextuel du jour ────────────────────────────────
export async function generateContextualMessage(
  trigger: string,
  context: CompanionContext,
): Promise<string> {
  const prompt = buildContextualMessagePrompt(trigger, context);
  return groqSingle(prompt);
}
