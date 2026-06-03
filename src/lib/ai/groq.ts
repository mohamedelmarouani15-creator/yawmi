import { SYSTEM_PROMPT } from "./prompts";
import type { AIMessage } from "./types";
import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getClient() {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY manquante dans les variables d'environnement");
  groqClient = new Groq({ apiKey });
  return groqClient;
}

const MODEL = "llama-3.3-70b-versatile";

export async function groqChat(
  contextBlock: string,
  history: AIMessage[],
  userMessage: string,
): Promise<string> {
  const client = getClient();

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: contextBlock },
    { role: "assistant", content: "Compris. Je tiens compte de ce contexte pour personnaliser mes réponses." },
    ...history.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function groqSingle(prompt: string): Promise<string> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: prompt },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "";
}
