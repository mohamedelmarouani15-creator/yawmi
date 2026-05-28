import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#061A12]">

      {/* Fond radial subtil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(5,92,63,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Cercle décoratif doré — haut droite */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
        }}
      />

      {/* Cercle décoratif vert — bas gauche */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #055C3F 0%, transparent 70%)",
        }}
      />

      {/* Ligne dorée horizontale centrée */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-px opacity-20"
        style={{
          background: "linear-gradient(to right, transparent, #D4AF37, transparent)",
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">

        {/* Badge discret */}
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs tracking-widest uppercase"
          style={{
            borderColor: "rgba(212,175,55,0.3)",
            color: "#D4AF37",
            background: "rgba(212,175,55,0.06)",
          }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "#D4AF37" }}
          />
          Application familiale musulmane
        </div>

        {/* Titre latin */}
        <h1
          className="text-[clamp(5rem,15vw,10rem)] font-extrabold leading-none tracking-tight"
          style={{
            fontFamily: "var(--font-bricolage)",
            color: "#F8F4EC",
          }}
        >
          Yawmi
        </h1>

        {/* Séparateur doré */}
        <div className="flex items-center gap-4">
          <span
            className="block h-px w-16"
            style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }}
          />
          <span
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: "rgba(212,175,55,0.6)" }}
          >
            ✦
          </span>
          <span
            className="block h-px w-16"
            style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }}
          />
        </div>

        {/* Titre arabe */}
        <p
          className="text-[clamp(3rem,10vw,6rem)] font-bold leading-none"
          style={{
            fontFamily: "var(--font-amiri)",
            color: "#D4AF37",
            direction: "rtl",
          }}
        >
          يومي
        </p>

        {/* Sous-titre */}
        <p
          className="mt-4 max-w-sm text-base leading-relaxed opacity-60"
          style={{
            fontFamily: "var(--font-dm-sans)",
            color: "#F8F4EC",
          }}
        >
          Votre espace familial au quotidien, ancré dans vos valeurs.
        </p>

        {/* CTA */}
        <Link
          href="/accueil"
          className="mt-8 rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #055C3F 0%, #0a8a5e 100%)",
            color: "#F8F4EC",
            boxShadow: "0 0 32px rgba(5,92,63,0.4)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Commencer →
        </Link>
      </div>

      {/* Motif de points décoratif */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-8 right-8 grid grid-cols-5 gap-2 opacity-10"
      >
        {Array.from({ length: 25 }).map((_, i) => (
          <span
            key={i}
            className="block h-1 w-1 rounded-full"
            style={{ background: "#D4AF37" }}
          />
        ))}
      </div>
    </main>
  );
}
