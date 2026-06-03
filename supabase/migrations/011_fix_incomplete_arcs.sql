-- ═══════════════════════════════════════════════════════════════
-- Migration 011 — Passe les arcs incomplets en draft
-- Les arcs publiés avec moins de chapitres que prévu trompent
-- les utilisateurs qui voient un arc "complet" mais vide.
-- ═══════════════════════════════════════════════════════════════

-- arc_ibrahim   : 5 chapitres insérés sur 8 déclarés
-- arc_moussa    : 2/10
-- arc_maryam    : 1/6
-- arc_sira      : 1/12
-- arc_sahaba    : 1/10
-- arc_hijra     : 1/5
-- arc_souleimane: 1/7

UPDATE stories SET status = 'draft'
WHERE id IN (
  'arc_ibrahim',
  'arc_moussa',
  'arc_maryam',
  'arc_sira',
  'arc_sahaba',
  'arc_hijra',
  'arc_souleimane'
);

-- arc_isra_miraj : 4 chapitres insérés, total_chapters déclaré = 5
-- On corrige le total pour correspondre à ce qui existe réellement
UPDATE stories SET total_chapters = 4 WHERE id = 'arc_isra_miraj';

-- Reste publiés : arc_yusuf (10/10) et arc_ismail (4/4) et arc_isra_miraj (4/4)
