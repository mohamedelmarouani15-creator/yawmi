# SESSION — 31 mai 2026

## Ce qu'on a fait aujourd'hui

### Grande Histoire — Activation des 9 arcs
- Migration `006_v3_all_stories.sql` : seed Ibrahim, Moussa, Maryam, Sîra,
  Sahaba, Hijra, Ismaïl, Isrâ wal-Miraj, Souleimane (1-2 chapitres chacun)
- Tous les 10 arcs passent de `coming_soon` à `available`
- `isLast` dynamique basé sur `total_chapters` de la DB (était hardcodé à 10)
- TITLES map dans `[storyId]/page.tsx` mis à jour pour tous les arcs

### Narrateur audio (VoiceRSS)
- Nouveau hook `src/hooks/useNarrator.ts` : ambiance sonore procédurale par arc
  (feu/eau/vent/nuit/désert via Web Audio API)
- Route API `src/app/api/story/narrate/route.ts` via VoiceRSS (gratuit, 350 req/jour)
- POST avec body de texte, retour audio/mpeg direct
- Parcours essayé avant d'arriver à VoiceRSS : Web Speech API (qualité),
  Edge TTS (403), ElevenLabs (free tier bloqué API), HuggingFace (TTS non supporté),
  Azure (CB obligatoire)

### Mode Sommeil Coran
- Nouveau composant `src/components/SleepModeOverlay.tsx`
- Timer : 15/30/45/60 min + fin de sourate + fin du Juzz (30 juzz définis)
- Fondu progressif volume sur 30 dernières secondes
- Dimming progressif de l'écran sur 4 minutes
- +15 min pour prolonger, arrêt immédiat
- Sélecteur récitateur dédié mode sommeil (sauvegardé dans `sleepReciter`)
- Wake Lock API (garde l'écran allumé sur Android/Desktop)
- `QuranPlayer.tsx` : nouvelles props `volume`, `defaultReciter`, `onSurahComplete`

### Déploiements
- 2 déploiements en production sur https://yawmi-delta.vercel.app
- `VOICERSS_API_KEY` ajoutée sur Vercel (production uniquement)

---

## Ce qui est en cours

- **Chapitres histoire** : l'UI affiche 4-12 chapitres par arc mais la DB n'en
  contient que 1-2. Les chapitres 3+ retournent une erreur 404 API.
  Prochaine étape : écrire et migrer les chapitres manquants.

- **VOICERSS_API_KEY manquante en preview** : ajoutée seulement en production
  sur Vercel. Les déploiements preview n'ont pas accès au narrateur.

---

## Bugs connus

### 🔴 Clé HuggingFace exposée dans le chat
- Le token `hf_xKDbck...` a été partagé dans cette conversation.
- **ACTION REQUISE : révoquer sur https://huggingface.co/settings/tokens
  et générer un nouveau token.**
- Mettre à jour `.env.local` avec le nouveau token.

### 🔴 Chapitres histoire 404
- Cliquer sur le chapitre 3+ de n'importe quel arc (sauf Yûsuf) renvoie
  une erreur API `chapter_not_found`.
- Cause : migration 006 n'a seedé que 1-2 chapitres par arc.
- Fix : écrire les chapitres manquants et les migrer dans Supabase.

### 🟠 Adhan push ne fonctionne pas app fermée
- Les notifications prière utilisent `setTimeout` côté client.
- Si l'app est fermée ou en arrière-plan, l'adhan ne se déclenche pas.
- Fix propre : Web Push côté serveur (cron Vercel ou Supabase Edge Function
  qui appelle `/api/push/notify` à chaque heure de prière).

### 🟠 Wake Lock iOS (mode sommeil)
- Safari sur iPhone ne supporte pas la Wake Lock API.
- En mode sommeil Coran, l'écran se verrouille normalement après 30 secondes.
- Contournement partiel : l'utilisateur doit désactiver le verrouillage auto
  dans les réglages iPhone pendant la récitation.

### 🟡 VoiceRSS 350 req/jour
- Le plan gratuit VoiceRSS limite à 350 requêtes/jour.
- Pour une famille qui lit chaque soir, la limite peut être atteinte.
- Chaque chapitre est généré à la volée (pas de cache).
- Fix : ajouter le cache Supabase Storage (déjà prévu dans le code, commenté).
- Alternative long terme : ElevenLabs Starter ($5/mois) avec cache = qualité
  cinématique pour ~$5 one-shot une fois tous les chapitres générés.

### 🟡 Modes par âge non implémentés visuellement
- Le hook `useAgeMode.ts` existe et injecte une classe CSS.
- Aucune page ne s'adapte selon l'âge du profil.
- L'ageGroup est collecté à l'onboarding et stocké mais sans effet.

---

## Prochaine étape exacte à reprendre

**Priorité 1 — Compléter les chapitres de La Grande Histoire**

Chaque arc a un nombre cible de chapitres (total_chapters en DB) :
- arc_ibrahim : 8 chapitres (2 faits, 6 à écrire)
- arc_moussa : 10 chapitres (2 faits, 8 à écrire)
- arc_maryam : 6 chapitres (1 fait, 5 à écrire)
- arc_sira : 12 chapitres (1 fait, 11 à écrire)
- arc_sahaba : 10 chapitres (1 fait, 9 à écrire)
- arc_hijra : 5 chapitres (1 fait, 4 à écrire)
- arc_ismail : 4 chapitres (1 fait, 3 à écrire)
- arc_isra_miraj : 5 chapitres (1 fait, 4 à écrire)
- arc_souleimane : 7 chapitres (1 fait, 6 à écrire)
- arc_yusuf : 10 chapitres (10 faits ✅)

Commande pour la prochaine session :
```
Écris les chapitres manquants pour arc_ibrahim (chapitres 3 à 8).
Même structure que les chapitres 1 et 2 déjà en base :
narrative (vue du tapis voyageur), vocabulary (1 mot arabe), 
4 questions (compréhension/vocabulaire/réflexion/spaced_repetition),
values_shown, rewards (xp + coins).
Sources : Coran et Sîra fiables uniquement.
Aucun dialogue inventé dans la bouche des prophètes.
```

**Priorité 2 — Modes par âge visuels**
Implémenter les adaptations UI dans au moins 3 pages clés (accueil, coran, oasis)
selon les 5 modes (kids/teen/adult/parent/elder).

**Priorité 3 — Cache narrateur**
Activer le cache Supabase Storage dans `/api/story/narrate/route.ts`
pour éviter de consommer les 350 req/jour VoiceRSS sur chaque relecture.

---

## Variables d'environnement (état au 31/05/2026)

Toutes présentes dans `.env.local` et sur Vercel production :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `VAPID_SUBJECT` (mailto:mohamed.elmarouani15@gmail.com)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VOICERSS_API_KEY` (production Vercel seulement, pas preview)
- `ELEVENLABS_API_KEY` (non utilisé actuellement)
- `HUGGINGFACE_TOKEN` (⚠️ À RÉVOQUER ET RENOUVELER)

## Supabase

Projet : `ipxzrblmjebgpnejmhpn`
Migrations exécutées manuellement via dashboard SQL :
- 001_v2_game.sql
- 002_v2_live_features.sql
- 003_v3_companion_stories.sql (partiel — trigger existant ignoré)
- 004_v3_seed_arc_yusuf.sql
- 005_onboarding_profile.sql
- 006_v3_all_stories.sql
