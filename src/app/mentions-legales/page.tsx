import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — Yawmi",
  description: "Mentions légales de l'application Yawmi.",
};

export default function MentionsLegalesPage() {
  return (
    <main
      className="min-h-screen px-5 py-12"
      style={{ background: "#0A0F0D", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
    >
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "#F8F4EC" }}
          >
            ← Retour
          </Link>
          <h1
            className="mt-6 text-3xl font-extrabold"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}
          >
            Mentions légales
          </h1>
          <p className="mt-2 text-sm opacity-40">
            Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
            l&apos;économie numérique (LCEN)
          </p>
        </div>

        <Section title="Éditeur de l'application">
          <dl className="space-y-2 text-sm opacity-80">
            <div className="flex gap-2">
              <dt className="font-semibold opacity-60 shrink-0 w-32">Nom :</dt>
              <dd>Yawmi</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold opacity-60 shrink-0 w-32">Contact :</dt>
              <dd>
                <a
                  href="mailto:mobileotelecom@gmail.com"
                  className="underline"
                  style={{ color: "#D4AF37" }}
                >
                  mobileotelecom@gmail.com
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold opacity-60 shrink-0 w-32">Directeur de publication :</dt>
              <dd>Équipe Yawmi</dd>
            </div>
          </dl>
        </Section>

        <Section title="Hébergement">
          <div className="space-y-4 text-sm opacity-80">
            <div>
              <p className="font-semibold mb-1">Application web — Vercel Inc.</p>
              <p>340 Pine Street, Suite 701</p>
              <p>San Francisco, CA 94104, États-Unis</p>
              <p>
                Site :{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#D4AF37" }}
                >
                  vercel.com
                </a>
              </p>
              <p className="mt-1 opacity-60 text-xs">
                Les données des utilisateurs européens sont traitées dans des centres de données
                situés dans l&apos;Union Européenne.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Base de données — Supabase Inc.</p>
              <p>970 Toa Payoh North #07-04</p>
              <p>Singapore 318992</p>
              <p>
                Site :{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#D4AF37" }}
                >
                  supabase.com
                </a>
              </p>
              <p className="mt-1 opacity-60 text-xs">
                Région de stockage : EU West (données hébergées dans l&apos;Union Européenne).
              </p>
            </div>
          </div>
        </Section>

        <Section title="Propriété intellectuelle">
          <p className="text-sm opacity-80 leading-relaxed">
            L&apos;ensemble des contenus présents sur Yawmi (textes, illustrations, code source,
            interface) est protégé par le droit d&apos;auteur. Toute reproduction, représentation
            ou utilisation sans autorisation préalable est interdite.
          </p>
          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            Les textes coraniques et hadiths utilisés sont des traductions libres de droits.
            Les noms et données géographiques des villes sont issus de bases de données ouvertes.
          </p>
        </Section>

        <Section title="Limitation de responsabilité">
          <p className="text-sm opacity-80 leading-relaxed">
            Yawmi est une application éducative destinée à faciliter la pratique islamique
            au quotidien. Les horaires de prières sont calculés algorithmiquement — ils peuvent
            différer légèrement des horaires diffusés par les mosquées locales. Il appartient
            à l&apos;utilisateur de vérifier les horaires auprès d&apos;une source religieuse
            de confiance.
          </p>
          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            Le compagnon IA Parchemin génère des réponses automatiques. Ces réponses ne
            constituent pas un avis religieux (fatwa) et ne remplacent pas la consultation
            d&apos;un érudit qualifié.
          </p>
        </Section>

        <Section title="Données personnelles">
          <p className="text-sm opacity-80 leading-relaxed">
            Pour toute information relative au traitement de vos données personnelles,
            consultez notre{" "}
            <Link href="/privacy" className="underline" style={{ color: "#D4AF37" }}>
              Politique de confidentialité
            </Link>
            .
          </p>
        </Section>

        <Section title="Droit applicable">
          <p className="text-sm opacity-80 leading-relaxed">
            Les présentes mentions légales sont soumises au droit français. Tout litige
            relatif à leur interprétation ou exécution relève de la compétence exclusive
            des tribunaux français.
          </p>
        </Section>

        {/* Footer links */}
        <div
          className="mt-12 pt-6 flex flex-wrap gap-4 text-sm border-t"
          style={{ borderColor: "rgba(212,175,55,0.15)" }}
        >
          <Link
            href="/privacy"
            className="opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: "#D4AF37" }}
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/connexion"
            className="opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: "#F8F4EC" }}
          >
            Connexion
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2
        className="mb-3 text-lg font-bold"
        style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}
      >
        {title}
      </h2>
      <div className="leading-relaxed">{children}</div>
    </section>
  );
}
