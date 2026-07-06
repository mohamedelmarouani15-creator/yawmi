import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type Groq from 'groq-sdk';
import { getGroqClient } from '@/lib/ai/groq';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  DIRECTEUR_SYSTEM_PROMPT,
  MANAGER_SYSTEM_PROMPT,
  ADJOINT_SYSTEM_PROMPT,
} from '@/lib/maison-sagesse/agent-prompts';

// ── Types ─────────────────────────────────────────────────────────────────

type AgentId = 'directeur' | 'manager' | 'adjoint';

interface ChatRequestBody {
  agentId: AgentId;
  message: string;
  context: string;
}

// ── Constantes ────────────────────────────────────────────────────────────

const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 256; // réponses courtes (3-4 phrases)
const SESSION_LIMIT = 20; // messages max par session

const SYSTEM_PROMPTS: Record<AgentId, string> = {
  directeur: DIRECTEUR_SYSTEM_PROMPT,
  manager:   MANAGER_SYSTEM_PROMPT,
  adjoint:   ADJOINT_SYSTEM_PROMPT,
};

// ── Helpers ───────────────────────────────────────────────────────────────

function isValidAgentId(value: unknown): value is AgentId {
  return value === 'directeur' || value === 'manager' || value === 'adjoint';
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth ────────────────────────────────────────────────────────
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { data: { user } } = await supabaseAdmin().auth.getUser(auth.replace('Bearer ', ''));
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // ── Rate limit serveur (20 messages/heure) ─────────────────────
  const rl = await checkRateLimit(user.id, 'maison_sagesse_chat', SESSION_LIMIT);
  if (rl.limited) {
    return NextResponse.json(
      {
        error: 'session_limit_reached',
        message: 'Vous avez atteint la limite de 20 messages pour cette heure.',
      },
      { status: 429 }
    );
  }

  // ── Lecture et validation du body ─────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const rawBody = body as Record<string, unknown>;

  if (!rawBody || typeof rawBody !== 'object') {
    return NextResponse.json({ error: 'body_required' }, { status: 400 });
  }

  if (!isValidAgentId(rawBody.agentId)) {
    return NextResponse.json(
      { error: 'invalid_agent', message: 'agentId doit être directeur, manager ou adjoint' },
      { status: 400 }
    );
  }

  if (!rawBody.message || typeof rawBody.message !== 'string') {
    return NextResponse.json({ error: 'message_required' }, { status: 400 });
  }

  const parsedBody: ChatRequestBody = {
    agentId: rawBody.agentId,
    message:  (rawBody.message as string).slice(0, 1000), // limite longueur
    context:  typeof rawBody.context === 'string' ? rawBody.context.slice(0, 500) : '',
  };

  // ── Sélection du prompt système ───────────────────────────────
  const systemPrompt = SYSTEM_PROMPTS[parsedBody.agentId];

  // ── Appel Groq ────────────────────────────────────────────────
  let reply: string;
  try {
    const client = getGroqClient();

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Injecte le contexte de jeu si fourni
    if (parsedBody.context) {
      messages.push({
        role: 'user',
        content: parsedBody.context,
      });
      messages.push({
        role: 'assistant',
        content: 'Compris. Je tiens compte de l\'état actuel de votre progression dans la bibliothèque.',
      });
    }

    messages.push({ role: 'user', content: parsedBody.message });

    const completion = await client.chat.completions.create({
      model:       MODEL,
      messages,
      max_tokens:  MAX_TOKENS,
      temperature: 0.75,
    });

    reply = completion.choices[0]?.message?.content ?? '';

    if (!reply) {
      throw new Error('Empty response from Groq');
    }
  } catch (err) {
    logger.error('maison-sagesse/chat', 'Groq error:', err);
    return NextResponse.json(
      { error: 'ai_error', message: 'L\'agent ne répond pas pour l\'instant. Réessaie dans un instant.' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    message: reply,
    agentId: parsedBody.agentId,
  });
}
