/**
 * Seed Supabase — importe toutes les questions de questions.ts
 *
 * Prérequis :
 *   - Migration 010 appliquée (colonnes arabic_required + minigame_data)
 *   - Variables d'environnement dans .env.local
 *
 * Usage :
 *   node --experimental-vm-modules node_modules/.bin/tsx supabase/seed/seed-questions.mjs
 *   # OU (plus simple) :
 *   npx tsx supabase/seed/seed-questions.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Charger .env.local manuellement
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(s => s.trim()))
);

const SUPABASE_URL  = env.NEXT_PUBLIC_SUPABASE_URL?.replace("/rest/v1/", "") ?? "";
const SERVICE_KEY   = env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("SUPABASE_URL ou SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Importer dynamiquement les questions compilées
// (nécessite que le projet soit compilé ou qu'on utilise tsx)
const { QUESTIONS } = await import("../../src/lib/game/questions.js");

function toRow(q) {
  return {
    id:               q.id,
    category:         q.category,
    type:             q.type,
    difficulty:       q.difficulty,
    question:         q.question,
    transliteration:  q.transliteration ?? null,
    options:          q.options,
    explanation:      q.explanation ?? null,
    cultural_capsule: q.culturalCapsule ?? null,
    location_id:      q.locationId ?? null,
    event_id:         q.eventId ?? null,
    arabic_required:  q.arabicRequired ?? "none",
    minigame_data:    q.minigameData ?? null,
    is_active:        true,
  };
}

const BATCH = 100;
const rows  = QUESTIONS.map(toRow);
let inserted = 0;

console.log(`Insertion de ${rows.length} questions par batch de ${BATCH}...`);

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("questions")
    .upsert(batch, { onConflict: "id" });

  if (error) {
    console.error(`Erreur batch ${i}–${i + BATCH}:`, error.message);
  } else {
    inserted += batch.length;
    process.stdout.write(`\r${inserted}/${rows.length}`);
  }
}

console.log(`\nTerminé. ${inserted} questions insérées/mises à jour.`);
