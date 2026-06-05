// Layout public — aucun auth guard
// Utilisé pour les pages de démo accessibles sans compte

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
