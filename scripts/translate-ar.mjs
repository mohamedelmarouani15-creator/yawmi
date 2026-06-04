#!/usr/bin/env node
/**
 * Traduction automatique FR → AR via Google Translate (API gratuite, sans clé)
 * Cible : questions quiz (273) + chapitres histoire (~63)
 *
 * Usage :
 *   node scripts/translate-ar.mjs [--questions] [--stories] [--dry-run]
 *   node scripts/translate-ar.mjs          # traduit tout
 *
 * Prérequis : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Env ────────────────────────────────────────────────────────
const __dir  = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(resolve(__dir, "../.env.local"), "utf8");
const env    = Object.fromEntries(
  envRaw.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/rest\/v1\/?$/, "");
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Args ───────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const doQ       = args.includes("--questions") || (!args.includes("--stories") && !args.includes("--questions"));
const doS       = args.includes("--stories")   || (!args.includes("--stories") && !args.includes("--questions"));
const dryRun    = args.includes("--dry-run");

// ── Google Translate free API ──────────────────────────────────
const DELAY_MS  = 300; // respecter les limites Google Translate gratuit

async function translateFrToAr(text) {
  if (!text || text.trim() === "") return "";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=ar&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res  = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    // Format retourné : [[[translated, original, ...], ...], ...]
    const translated = data[0]?.map(chunk => chunk[0]).join("") ?? "";
    return translated.trim();
  } catch (e) {
    console.warn(`  ⚠ Échec traduction: "${text.slice(0,40)}…" — ${e.message}`);
    return "";
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Questions ──────────────────────────────────────────────────
async function translateQuestions() {
  console.log("\n📚 Chargement des questions…");
  const { data: questions, error } = await supabase
    .from("questions")
    .select("id, question, options, explanation, question_ar")
    .is("question_ar", null)   // seulement celles sans traduction
    .eq("is_active", true);

  if (error) { console.error("❌ Supabase:", error.message); return; }
  console.log(`   ${questions.length} questions sans traduction AR`);

  let done = 0;
  for (const q of questions) {
    process.stdout.write(`  [${++done}/${questions.length}] ${q.id}… `);

    const question_ar    = await translateFrToAr(q.question);
    await sleep(DELAY_MS);

    const explanation_ar = q.explanation ? await translateFrToAr(q.explanation) : null;
    if (q.explanation) await sleep(DELAY_MS);

    // Traduire chaque option
    const options_ar = [];
    for (const opt of (q.options ?? [])) {
      const text_ar = await translateFrToAr(opt.text);
      await sleep(DELAY_MS);
      options_ar.push({ ...opt, text: text_ar });
    }

    process.stdout.write(`✓ "${question_ar.slice(0,40)}"\n`);

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from("questions")
        .update({ question_ar, options_ar, explanation_ar })
        .eq("id", q.id);
      if (upErr) console.warn(`  ⚠ Update échoué: ${upErr.message}`);
    }
  }
  console.log(`✅ Questions: ${done} traduites${dryRun ? " (dry-run)" : ""}`);
}

// ── Chapitres histoire ─────────────────────────────────────────
async function translateStories() {
  console.log("\n📖 Chargement des chapitres…");
  const { data: chapters, error } = await supabase
    .from("story_chapters")
    .select("id, title, narrative, title_ar")
    .is("title_ar", null);   // seulement ceux sans traduction

  if (error) { console.error("❌ Supabase:", error.message); return; }
  console.log(`   ${chapters.length} chapitres sans traduction AR`);

  let done = 0;
  for (const ch of chapters) {
    process.stdout.write(`  [${++done}/${chapters.length}] "${ch.title.slice(0,40)}"… `);

    const title_ar     = await translateFrToAr(ch.title);
    await sleep(DELAY_MS);

    // narrative peut être long — Google Translate gratuit limite ~5000 chars
    // Découper en paragraphes si nécessaire
    const paragraphs   = ch.narrative.split("\n\n");
    const parts_ar     = [];
    for (const para of paragraphs) {
      if (para.trim() === "") { parts_ar.push(""); continue; }
      const translated = await translateFrToAr(para);
      parts_ar.push(translated);
      await sleep(DELAY_MS);
    }
    const narrative_ar = parts_ar.join("\n\n");

    process.stdout.write(`✓ "${title_ar.slice(0,40)}"\n`);

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from("story_chapters")
        .update({ title_ar, narrative_ar })
        .eq("id", ch.id);
      if (upErr) console.warn(`  ⚠ Update échoué: ${upErr.message}`);
    }
  }
  console.log(`✅ Chapitres: ${done} traduits${dryRun ? " (dry-run)" : ""}`);
}

// ── Main ───────────────────────────────────────────────────────
console.log(`🌐 Traduction FR → AR${dryRun ? " [DRY RUN]" : ""}`);
console.log(`   URL Supabase: ${SUPABASE_URL}`);

if (doQ) await translateQuestions();
if (doS) await translateStories();

console.log("\n🎉 Terminé. Invalide le cache questions côté client (localStorage).");
