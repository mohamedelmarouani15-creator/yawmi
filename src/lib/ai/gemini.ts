// Implémentation Gemini — seul fichier à remplacer si on migre vers un autre fournisseur
// Utilisé UNIQUEMENT côté serveur (routes API Next.js)

import { SYSTEM_PROMPT } from "./prompts";
import type { AIMessage } from "./types";

// Lazy import pour éviter les erreurs si la clé est absente en dev
let genAI: InstanceType<typeof import("@google/generative-ai").GoogleGenerativeAI> | null = null;

async function getClient() {
  if (genAI) return genAI;
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquante dans les variables d'environnement");
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export async function geminiChat(
  contextBlock: string,
  history: AIMessage[],
  userMessage: string,
): Promise<string> {
  const client = await getClient();
  const model  = client.getGenerativeModel({
    model: "gemini-2.0-flash-lite",  // free tier, rapide
    systemInstruction: SYSTEM_PROMPT,
  });

  // Construit l'historique pour Gemini (format {role, parts})
  // Injecte le contexte apprenant comme premier message système
  const formattedHistory = [
    // Le contexte apprenant en premier message utilisateur (Gemini ne supporte pas system multi-turn)
    { role: "user"  as const, parts: [{ text: contextBlock }] },
    { role: "model" as const, parts: [{ text: "Compris. Je tiens compte de ce contexte pour personnaliser mes réponses." }] },
    // Historique de la conversation
    ...history.map(msg => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.content }],
    })),
  ];

  const chat   = model.startChat({ history: formattedHistory });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function geminiSingle(prompt: string): Promise<string> {
  const client = await getClient();
  const model  = client.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
