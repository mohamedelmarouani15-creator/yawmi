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

### Mode Sommeil Coran
- Nouveau composant `src/components/SleepModeOverlay.tsx`
- Timer : 15/30/45/60 min + fin de sourate + fin du Juzz (30 juzz définis)
- Fondu progressif volume sur 30 dernières secondes
- Dimming progressif de l'écran sur 4 minutes

### DESIGN — Session 2 (31 mai 2026)

#### Chantier 1 — Tokens CSS (✅ FAIT)
- 900 remplacements de couleurs en dur → CSS vars sur 57 fichiers
- `#D4AF37` → `var(--gold)`, `#055C3F` → `var(--primary)`, `#F8F4EC` → `var(--text)`, etc.
- Exceptions préservées (canvas/Three.js, manifest JSON, données hex-alpha interpolées)
- `location.color`, `pu.color`, `MEMBER_COLORS`, `arc.color` gardent hex (utilisés en `${color}33`)

#### Chantier 2 — Mode jour/nuit (✅ FAIT)
- `[data-theme="day"]` CSS block dans globals.css : thème marbre chaud + texte sombre
- Hook `src/hooks/usePrayerTheme.ts` : bascule automatiquement entre Fajr et Maghrib
- Monté dans `src/app/(app)/layout.tsx` à côté de `useAgeMode`
- Transition CSS 1.5s sur background/color
- Gold assombri en jour (#9A7000) pour le contraste sur fond clair

#### Chantier 3 — Icônes islamiques + bordures mihrab (✅ FAIT)
- `src/components/IslamicIcons.tsx` avec 7 icônes SVG :
  `CrescentStar`, `Star8`, `BismillahIcon`, `MosqueIcon`, `GeometricTile`,
  `MihrabArch`, `TasbihIcon`
- Classes CSS dans globals.css : `.mihrab-card`, `.divider-gold`,
  `.frame-arabic`, `.glow-gold`, `.glow-primary`

#### Chantier 4 — useAgeMode dans les pages (✅ FAIT)
- CSS `age-kids` enrichi : border-radius, espacement, cibles 52px, `.hide-kids`/`.show-kids`
- CSS `age-elder` enrichi : contraste via `--text-muted`/`--text-dim` overrides,
  icônes scale 1.15, nav 5rem, `.hide-elder`
- CSS `age-teen` ajouté

### Déploiements
- 2 déploiements en production sur https://yawmi-delta.vercel.app

---

## Ce qui est en cours

- **Chapitres histoire** : les chapitres 3+ retournent une erreur 404 API.
  Prochaine étape : écrire et migrer les chapitres manquants.

- **IslamicIcons non intégrées dans les pages** : composant créé, pas encore branché.

- **VOICERSS_API_KEY manquante en preview** : production seulement.

---

## Bugs connus

### 🔴 Clé HuggingFace exposée dans le chat
- **ACTION REQUISE : révoquer sur https://huggingface.co/settings/tokens**

### 🔴 Chapitres histoire 404
- Cause : migration 006 n'a seedé que 1-2 chapitres par arc.

### 🟠 Adhan push ne fonctionne pas app fermée

### 🟠 Wake Lock iOS (mode sommeil)

### 🟡 VoiceRSS 350 req/jour — fix : cache Supabase Storage

### 🟡 IslamicIcons pas encore intégrées dans les pages

---

## Prochaine étape exacte à reprendre

**Priorité 1 — Intégrer les IslamicIcons dans les pages clés**
- `/accueil` : CrescentStar (prières), TasbihIcon (dhikr)
- `/prieres` : MosqueIcon header, MihrabArch sur la card active
- `/dhikr` : TasbihIcon header
- Ajouter `.mihrab-card` et `.frame-arabic` sur les cards importantes

**Priorité 2 — Compléter les chapitres de La Grande Histoire**
- arc_ibrahim : 6 chapitres à écrire (3→8)
- arc_moussa : 8 chapitres à écrire (3→10)
- arc_maryam : 5 chapitres à écrire (2→6)
- arc_sira : 11 chapitres à écrire (2→12)
- arc_sahaba, hijra, ismail, isra_miraj, souleimane : voir SESSION précédente

**Priorité 3 — Cache narrateur**
Activer le cache Supabase Storage dans `/api/story/narrate/route.ts`.

---

## Variables d'environnement (état au 31/05/2026)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- `VOICERSS_API_KEY` (production Vercel seulement)
- `ELEVENLABS_API_KEY` (non utilisé)
- `HUGGINGFACE_TOKEN` (⚠️ À RÉVOQUER ET RENOUVELER)

## Supabase
Projet : `ipxzrblmjebgpnejmhpn`
Migrations : 001→006 exécutées manuellement via dashboard SQL
