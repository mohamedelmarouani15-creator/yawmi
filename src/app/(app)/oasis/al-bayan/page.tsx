"use client";

import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import IntroScreen from "@/components/al-bayan/ui/IntroScreen";

// Cette page ne rend jamais la scène 3D du hub elle-même : le layout
// (al-bayan/layout.tsx) s'en charge directement via roomKey, pour éviter de
// faire passer la scène par `children` à l'intérieur du Canvas R3F (ça casse
// le reconciler — voir le commentaire dans layout.tsx). Cette page ne sert
// donc qu'à afficher l'écran d'intro tant que la partie n'a pas démarré.
export default function AlBayanHubPage() {
  const phase = useAlBayanStore((s) => s.phase);
  if (phase === "idle") return <IntroScreen />;
  return null;
}
