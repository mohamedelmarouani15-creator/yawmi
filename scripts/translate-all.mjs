#!/usr/bin/env node
/**
 * Traduction complète FR → EN, ES, TR, Darija (+ statique : sages, lieux, achievements, escape rooms)
 * Via Google Translate gratuit (sans clé API)
 *
 * Usage :
 *   node scripts/translate-all.mjs [--questions] [--stories] [--static] [--dry-run]
 *   node scripts/translate-all.mjs          # traduit tout
 *
 * Prérequis : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
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
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Args ────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const doQ     = args.includes("--questions") || !args.some(a => a.startsWith("--") && a !== "--dry-run");
const doS     = args.includes("--stories")   || !args.some(a => a.startsWith("--") && a !== "--dry-run");
const doStat  = args.includes("--static")    || !args.some(a => a.startsWith("--") && a !== "--dry-run");
const dryRun  = args.includes("--dry-run");

const LANGS  = [
  { code: "en", name: "Anglais"  },
  { code: "es", name: "Espagnol" },
  { code: "tr", name: "Turc"     },
  { code: "da", name: "Darija", supabaseCode: "darija" }, // Google uses "crs" or just "fr" — use "ar" as proxy
];
const DELAY  = 350;

// ── Google Translate ───────────────────────────────────────────
async function translate(text, targetLang) {
  if (!text || text.trim() === "") return "";
  // Darija: Google Translate doesn't have it, use Arabic as base then note it's approximate
  const gl = targetLang === "darija" ? "ar" : targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${gl}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res  = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    return data[0]?.map(c => c[0]).join("").trim() ?? "";
  } catch {
    process.stdout.write(`⚠`);
    return "";
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Questions ──────────────────────────────────────────────────
async function translateQuestions() {
  console.log("\n📚 Questions — chargement…");
  const { data, error } = await supabase.from("questions")
    .select("id, question, options, explanation, translations")
    .eq("is_active", true);
  if (error || !data) { console.error("❌", error?.message); return; }

  const toTranslate = data.filter(q => {
    const t = q.translations ?? {};
    return LANGS.some(l => !t[l.supabaseCode ?? l.code]?.question);
  });
  console.log(`   ${toTranslate.length}/${data.length} questions à traduire`);

  let done = 0;
  for (const q of toTranslate) {
    process.stdout.write(`  [${++done}/${toTranslate.length}] ${q.id}… `);
    const existing = q.translations ?? {};
    const newTrans = { ...existing };

    for (const lang of LANGS) {
      const key = lang.supabaseCode ?? lang.code;
      if (newTrans[key]?.question) continue;
      const question_t    = await translate(q.question, lang.code); await sleep(DELAY);
      const explanation_t = q.explanation ? await translate(q.explanation, lang.code) : null;
      if (q.explanation) await sleep(DELAY);
      const options_t = [];
      for (const opt of (q.options ?? [])) {
        options_t.push({ ...opt, text: await translate(opt.text, lang.code) });
        await sleep(DELAY);
      }
      newTrans[key] = { question: question_t, options: options_t, explanation: explanation_t };
    }
    process.stdout.write(`✓\n`);
    if (!dryRun) {
      await supabase.from("questions").update({ translations: newTrans }).eq("id", q.id);
    }
  }
  console.log(`✅ Questions: ${done} traitées`);
}

// ── Chapitres ──────────────────────────────────────────────────
async function translateStories() {
  console.log("\n📖 Chapitres — chargement…");
  const { data, error } = await supabase.from("story_chapters")
    .select("id, title, narrative, translations");
  if (error || !data) { console.error("❌", error?.message); return; }

  const toTranslate = data.filter(ch => {
    const t = ch.translations ?? {};
    return LANGS.some(l => !t[l.supabaseCode ?? l.code]?.title);
  });
  console.log(`   ${toTranslate.length}/${data.length} chapitres à traduire`);

  let done = 0;
  for (const ch of toTranslate) {
    process.stdout.write(`  [${++done}/${toTranslate.length}] "${ch.title.slice(0,35)}"… `);
    const existing = ch.translations ?? {};
    const newTrans = { ...existing };

    for (const lang of LANGS) {
      const key = lang.supabaseCode ?? lang.code;
      if (newTrans[key]?.title) continue;
      const title_t     = await translate(ch.title, lang.code); await sleep(DELAY);
      const paragraphs  = ch.narrative.split("\n\n");
      const parts_t     = [];
      for (const para of paragraphs) {
        parts_t.push(para.trim() ? await translate(para, lang.code) : "");
        if (para.trim()) await sleep(DELAY);
      }
      newTrans[key] = { title: title_t, narrative: parts_t.join("\n\n") };
    }
    process.stdout.write(`✓\n`);
    if (!dryRun) {
      await supabase.from("story_chapters").update({ translations: newTrans }).eq("id", ch.id);
    }
  }
  console.log(`✅ Chapitres: ${done} traités`);
}

// ── Contenu statique (sages, lieux, achievements, escape rooms) ─
async function translateStatic() {
  console.log("\n🏛️ Contenu statique — génération…");

  const STATIC_STRINGS = {
    // Achievements titles + descriptions
    achievements: {
      first_correct:    { title: "Première lumière", description: "Répondre à ta première question juste" },
      sage_1:           { title: "Cartographe apprenti", description: "Vaincre ton premier sage" },
      sage_3:           { title: "Savant en herbe", description: "Vaincre 3 sages" },
      sage_all:         { title: "Maître des sagesses", description: "Vaincre tous les sages" },
      streak_3:         { title: "Assidu", description: "3 jours de suite" },
      streak_7:         { title: "Fidèle", description: "7 jours de suite" },
      streak_30:        { title: "Pèlerin patient", description: "30 jours de suite" },
      questions_50:     { title: "Curieux", description: "50 questions répondues" },
      questions_100:    { title: "Cent sagesses", description: "100 questions répondues" },
      questions_500:    { title: "Encyclopédiste", description: "500 questions répondues" },
      perfect_game:     { title: "Parfait", description: "10/10 à un défi" },
      level_10:         { title: "Érudit", description: "Atteindre le niveau 10" },
      level_25:         { title: "Sage", description: "Atteindre le niveau 25" },
      level_50:         { title: "Grand maître", description: "Atteindre le niveau 50" },
      coins_100:        { title: "Petit trésor", description: "Accumuler 100 pièces d'or" },
      mosque_1:         { title: "Bâtisseur", description: "Ajouter un premier objet à ta mosquée" },
      category_quran:   { title: "Mémorisateur", description: "Atteindre niveau 5 en Coran" },
      category_arabic:  { title: "Linguiste", description: "Atteindre niveau 5 en Arabe" },
      sage_card_all:    { title: "Bibliothécaire", description: "Collecter toutes les cartes de sages" },
      la_mecque:        { title: "Le pèlerin", description: "Atteindre La Mecque" },
    },
    // Sage titles + dialogues
    sages: {
      al_idrissi:   { title: "Cartographe du monde", dialogueIntro: "Ah, un voyageur qui cherche sa route ! Je suis Al-Idrissi, et j'ai cartographié le monde entier sur un disque d'argent pour le roi Roger II de Sicile. Avant d'entrer dans ma médersa, prouve-moi que tu mérites de naviguer dans les eaux du savoir…", dialogueSuccess: "Excellent ! Tu as la boussole du cœur et la carte de l'esprit. La Méditerranée ne te retient plus — file vers Cordoue, où le sage Ibn Rushd t'attend.", dialogueFailure: "Les étoiles ne te guident pas encore assez bien, ami voyageur. Retourne étudier, et reviens. La connaissance n'est pas une destination — c'est un chemin." },
      ibn_rushd:    { title: "Philosophe d'Andalousie", dialogueIntro: "Aristote a été oublié en Europe — c'est grâce à mes traductions en arabe qu'il a survécu. Je suis Ibn Rushd. La raison et la foi ne s'opposent pas : elles s'éclairent.", dialogueSuccess: "Tu raisonnes avec la clarté d'un philosophe ! Cap sur Marrakech.", dialogueFailure: "La raison a besoin d'exercice, comme le muscle. Reviens après avoir étudié." },
      ibn_toumert:  { title: "Fondateur des Almohades", dialogueIntro: "J'ai traversé le désert pour ramener la vérité à mon peuple. Je suis Ibn Toumert. Montre-moi la solidité de ton savoir.", dialogueSuccess: "Tu as la fermeté du Haut-Atlas ! Damas est la prochaine étape.", dialogueFailure: "Même les montagnes ont été façonnées par le temps. Persévère." },
      ibn_asaker:   { title: "Historien de Damas", dialogueIntro: "J'ai consacré ma vie à ne rien oublier : j'ai compilé 1300 biographies. Je suis Ibn Asaker. La mémoire est le trésor des nations.", dialogueSuccess: "Ta mémoire est précieuse comme un manuscrit rare ! Bagdad t'attend.", dialogueFailure: "Même mon encyclopédie de 80 volumes a pris 60 ans. La patience est la première vertu de l'historien." },
      al_khwarizmi: { title: "Père de l'algèbre", dialogueIntro: "Mon nom a donné 'algorithme' et mon traité 'algèbre'. Je suis Al-Khwarizmi. Les nombres ont une logique implacable.", dialogueSuccess: "Parfait ! Tu calcules comme un astronome de Bagdad. Samarcande t'attend.", dialogueFailure: "L'équation est simple : connaissance = effort × temps. Reviens !" },
      ibn_sina:     { title: "Prince des médecins", dialogueIntro: "J'ai écrit le Canon de la médecine à 21 ans. À Samarcande, je t'invite à mesurer l'étendue de ton savoir.", dialogueSuccess: "Ton esprit est sain et ton savoir florissant ! Tombouctou t'attend.", dialogueFailure: "Un médecin qui ne connaît pas ses limites est dangereux. Étudie, puis reviens." },
      ahmad_baba:   { title: "Gardien des manuscrits", dialogueIntro: "Tombouctou n'est pas le bout du monde — c'est son centre ! J'ai réuni 700 000 manuscrits ici. Je suis Ahmad Baba.", dialogueSuccess: "Magnifique ! Tu portes la lumière de Tombouctou en toi. Le Caire t'attend.", dialogueFailure: "Les manuscrits de Tombouctou ont survécu aux invasions. Reviens !" },
      ibn_khaldoun: { title: "Père de la sociologie", dialogueIntro: "J'ai compris avant tout le monde que les sociétés naissent, prospèrent et déclinent selon des lois précises. Je suis Ibn Khaldoun.", dialogueSuccess: "Tu as l'œil d'un sociologue et l'âme d'un historien ! La Mecque est à portée.", dialogueFailure: "Toute civilisation a ses hauts et ses bas. Reviens quand ton savoir sera au zénith." },
    },
    // Location descriptions
    locations: {
      medine:     { description: "La ville du Prophète ﷺ. Ton point de départ vers la sagesse.", country: "Arabie Saoudite" },
      fes:        { description: "Cité des savants et des médersa. Al-Idrissi y cartographia le monde.", country: "Maroc" },
      cordoue:    { description: "La perle de l'Occident islamique. Averroès y réconcilia raison et foi.", country: "Espagne (Andalousie)" },
      marrakech:  { description: "La ville ocre, berceau des Almohades et de la Koutoubia.", country: "Maroc" },
      damas:      { description: "La plus ancienne capitale islamique. Ibn Asaker y préserva 1300 biographies.", country: "Syrie" },
      bagdad:     { description: "La Maison de la Sagesse. Al-Khwarizmi y inventa l'algèbre.", country: "Irak" },
      samarcande: { description: "Carrefour des routes de la soie. Ibn Sina y rédigea le Canon de la médecine.", country: "Ouzbékistan" },
      tombouctou: { description: "La cité des 333 saints. Ahmad Baba y réunit 700 000 manuscrits.", country: "Mali" },
      le_caire:   { description: "Siège d'Al-Azhar. Ibn Khaldoun y fonda la sociologie moderne.", country: "Égypte" },
      la_mecque:  { description: "Le sommet du voyage. Que ta quête de sagesse soit acceptée.", country: "Arabie Saoudite" },
    },
    // Escape rooms
    escape_rooms: {
      room_medersa_1:    { name: "La Médersa Secrète", description: "Une chambre de la médersa Al-Qarawiyyin de Fès. Quatre cadenas gardent le savoir." },
      room_bibliotheque_1: { name: "La Bibliothèque de Tombouctou", description: "Parmi 700 000 manuscrits, Ahmad Baba a caché le secret ultime. Résous les 4 énigmes." },
    },
  };

  const output = {};

  for (const [category, items] of Object.entries(STATIC_STRINGS)) {
    output[category] = {};
    for (const [id, fields] of Object.entries(items)) {
      output[category][id] = {};
      for (const lang of LANGS) {
        const key = lang.supabaseCode ?? lang.code;
        output[category][id][key] = {};
        process.stdout.write(`  ${category}.${id} [${key}]… `);
        for (const [field, text] of Object.entries(fields)) {
          output[category][id][key][field] = await translate(text, lang.code);
          await sleep(DELAY);
        }
        process.stdout.write(`✓\n`);
      }
    }
  }

  const outPath = resolve(__dir, "../src/lib/static-translations.json");
  if (!dryRun) {
    writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
    console.log(`✅ Écrit dans ${outPath}`);
  } else {
    console.log("✅ [dry-run] JSON généré (non écrit)");
  }

  return output;
}

// ── Main ────────────────────────────────────────────────────────
console.log(`🌐 Traduction FR → EN/ES/TR/Darija${dryRun ? " [DRY RUN]" : ""}`);
if (doQ)    await translateQuestions();
if (doS)    await translateStories();
if (doStat) await translateStatic();
console.log("\n🎉 Terminé.");
