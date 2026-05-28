import { Bell, Globe, Moon, Shield, ChevronRight } from "lucide-react";

const SETTINGS = [
  { icon: Bell,   label: "Notifications",  desc: "Rappels de prières" },
  { icon: Globe,  label: "Ville",          desc: "Paris, France" },
  { icon: Moon,   label: "Méthode de calcul", desc: "UOIF" },
  { icon: Shield, label: "Confidentialité", desc: "Données locales" },
];

export default function ProfilPage() {
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Mon compte
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Profil
        </h1>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
          style={{ background: "linear-gradient(135deg, #055C3F, #0a8a5e)", color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}
        >
          Y
        </div>
        <div>
          <p className="text-lg font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Famille Yawmi
          </p>
          <p className="text-sm opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            4 membres · Paris
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: "12",  label: "Jours actifs" },
          { value: "847", label: "Dhikrs" },
          { value: "3",   label: "Juz lus" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl border py-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(212,175,55,0.12)",
            }}
          >
            <p className="text-xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
              {value}
            </p>
            <p className="mt-1 text-center text-xs opacity-50 leading-tight" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Paramètres */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Paramètres
        </p>
        <div className="flex flex-col gap-2">
          {SETTINGS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-xl border px-4 py-3.5"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {label}
                </p>
                <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {desc}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "rgba(248,244,236,0.2)" }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
