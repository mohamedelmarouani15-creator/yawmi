import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Yawmi",
  description: "Comment Yawmi collecte, utilise et protège vos données personnelles.",
};

export default function PrivacyPage() {
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
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-sm opacity-40">
            Dernière mise à jour : 5 juin 2026
          </p>
        </div>

        {/* Intro */}
        <p className="mb-10 leading-relaxed opacity-70">
          Yawmi est une application familiale islamique éducative. Nous respectons votre vie privée
          et nous nous engageons à protéger vos données personnelles conformément au Règlement
          Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi
          Informatique et Libertés modifiée.
        </p>

        <Section title="1. Responsable du traitement">
          <p>
            Le responsable du traitement des données est <strong>Yawmi</strong>.
          </p>
          <p className="mt-2">
            Contact :{" "}
            <a
              href="mailto:mobileotelecom@gmail.com"
              className="underline"
              style={{ color: "#D4AF37" }}
            >
              mobileotelecom@gmail.com
            </a>
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p className="mb-3">Yawmi collecte les données suivantes :</p>
          <ul className="list-disc pl-5 space-y-2 opacity-80">
            <li>
              <strong>Données de compte :</strong> adresse e-mail (obligatoire pour la
              création d&apos;un compte)
            </li>
            <li>
              <strong>Données de profil :</strong> tranche d&apos;âge, langue maternelle,
              prénom d&apos;affichage, ville (pour les horaires de prières), niveau d&apos;arabe,
              mode d&apos;utilisation
            </li>
            <li>
              <strong>Données de pratique religieuse :</strong> historique des prières
              effectuées, sessions de dhikr, progression de lecture du Coran
            </li>
            <li>
              <strong>Données de progression de jeu :</strong> points d&apos;expérience (XP),
              niveaux atteints, questions répondues, récompenses, succès (achievements)
            </li>
            <li>
              <strong>Messages IA Parchemin :</strong> conversations avec le compagnon
              d&apos;apprentissage artificiel (conservées pour personnaliser les réponses)
            </li>
            <li>
              <strong>Abonnements aux notifications push :</strong> identifiant technique
              de l&apos;appareil (uniquement si vous activez les notifications)
            </li>
          </ul>
          <p className="mt-3 opacity-60 text-sm">
            Aucune donnée de paiement n&apos;est collectée. Aucun suivi publicitaire n&apos;est effectué.
          </p>
        </Section>

        <Section title="3. Finalités du traitement">
          <ul className="list-disc pl-5 space-y-2 opacity-80">
            <li>Personnalisation de l&apos;interface et des contenus selon votre profil</li>
            <li>Calcul des horaires de prières selon votre localisation</li>
            <li>Fonctionnement du système de jeu éducatif (répétition espacée SM-2)</li>
            <li>Envoi de notifications de rappel de prières et défis (si activé)</li>
            <li>Amélioration des réponses du compagnon d&apos;apprentissage IA Parchemin</li>
            <li>Suivi de la progression dans les histoires éducatives</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p className="opacity-80 leading-relaxed">
            Le traitement de vos données repose sur votre <strong>consentement explicite</strong>{" "}
            (Article 6.1.a du RGPD), recueilli lors de la création de votre compte et de
            l&apos;utilisation des fonctionnalités. Vous pouvez retirer votre consentement à tout
            moment en supprimant votre compte (voir section 7).
          </p>
        </Section>

        <Section title="5. Durée de conservation">
          <ul className="list-disc pl-5 space-y-2 opacity-80">
            <li>
              <strong>Données actives :</strong> conservées tant que votre compte est actif
            </li>
            <li>
              <strong>Après demande de suppression :</strong> toutes les données sont
              supprimées dans un délai de <strong>30 jours</strong> suivant la demande
            </li>
            <li>
              <strong>Conversations IA :</strong> les 50 derniers messages sont conservés
              pour la continuité des échanges, supprimés avec le compte
            </li>
          </ul>
        </Section>

        <Section title="6. Partage des données">
          <p className="opacity-80 leading-relaxed mb-3">
            Vos données ne sont <strong>pas vendues</strong> ni partagées à des fins
            commerciales. Elles sont transmises uniquement aux sous-traitants techniques
            nécessaires au fonctionnement de l&apos;application :
          </p>
          <ul className="list-disc pl-5 space-y-2 opacity-80">
            <li>
              <strong>Supabase</strong> — base de données et authentification, hébergé dans
              l&apos;Union Européenne (région EU West)
            </li>
            <li>
              <strong>Vercel</strong> — hébergement de l&apos;application web, données
              traitées dans l&apos;Union Européenne
            </li>
            <li>
              <strong>Groq</strong> — traitement des messages du compagnon IA (les messages
              sont transmis pour génération de réponse uniquement, sans conservation par Groq)
            </li>
          </ul>
          <p className="mt-3 opacity-60 text-sm">
            Aucun transfert de données hors de l&apos;Union Européenne pour Supabase et Vercel.
          </p>
        </Section>

        <Section title="7. Vos droits (RGPD)">
          <p className="mb-3 opacity-80">Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-5 space-y-2 opacity-80">
            <li>
              <strong>Droit d&apos;accès (Art. 15) :</strong> obtenir une copie de vos données
            </li>
            <li>
              <strong>Droit de rectification (Art. 16) :</strong> corriger des données
              inexactes via votre profil
            </li>
            <li>
              <strong>Droit à l&apos;effacement (Art. 17) :</strong> supprimer votre compte
              et toutes vos données depuis la page Profil
            </li>
            <li>
              <strong>Droit à la portabilité (Art. 20) :</strong> exporter vos données au
              format JSON depuis la page Profil
            </li>
            <li>
              <strong>Droit d&apos;opposition (Art. 21) :</strong> vous opposer au traitement
              en nous contactant
            </li>
            <li>
              <strong>Droit à la limitation (Art. 18) :</strong> limiter le traitement de vos
              données sur demande
            </li>
          </ul>
          <p className="mt-4 opacity-80">
            Pour exercer ces droits, contactez-nous à :{" "}
            <a
              href="mailto:mobileotelecom@gmail.com"
              className="underline"
              style={{ color: "#D4AF37" }}
            >
              mobileotelecom@gmail.com
            </a>
          </p>
          <p className="mt-2 opacity-60 text-sm">
            Vous avez également le droit de déposer une plainte auprès de la{" "}
            <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés) :{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "#D4AF37" }}
            >
              www.cnil.fr
            </a>
          </p>
        </Section>

        <Section title="8. Cookies et stockage local">
          <p className="opacity-80 leading-relaxed mb-3">
            Yawmi utilise un usage minimal de cookies et du stockage local du navigateur :
          </p>
          <ul className="list-disc pl-5 space-y-2 opacity-80">
            <li>
              <strong>Cookie <code className="text-xs bg-white/10 px-1 rounded">yawmi_lang</code> :</strong>{" "}
              cookie fonctionnel stockant votre préférence de langue. Pas de tracking,
              pas de publicité. Durée : session + 1 an.
            </li>
            <li>
              <strong>localStorage :</strong> vos réglages locaux (ville, méthode de calcul,
              mode d&apos;adhan) sont stockés localement dans votre navigateur, non transmis à
              nos serveurs sauf synchronisation explicite.
            </li>
          </ul>
          <p className="mt-3 opacity-60 text-sm">
            Aucun cookie publicitaire, aucun cookie tiers, aucun outil de tracking analytique
            (Google Analytics, Matomo, etc.) n&apos;est utilisé.
          </p>
        </Section>

        <Section title="9. Sécurité">
          <p className="opacity-80 leading-relaxed">
            Vos données sont protégées par des politiques de sécurité au niveau des lignes
            (Row Level Security — RLS) dans Supabase, garantissant qu&apos;aucun utilisateur
            ne peut accéder aux données d&apos;un autre. Les communications sont chiffrées en
            transit (HTTPS/TLS).
          </p>
        </Section>

        <Section title="10. Mineurs">
          <p className="opacity-80 leading-relaxed">
            Yawmi est conçu pour être utilisé en famille, y compris par des enfants. Pour les
            utilisateurs de moins de 15 ans (conformément à la loi française), le consentement
            parental est requis. Si vous êtes parent et souhaitez supprimer le compte d&apos;un
            mineur, contactez-nous à{" "}
            <a
              href="mailto:mobileotelecom@gmail.com"
              className="underline"
              style={{ color: "#D4AF37" }}
            >
              mobileotelecom@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="11. Modifications">
          <p className="opacity-80 leading-relaxed">
            Cette politique peut être mise à jour. En cas de modification substantielle, vous
            serez informé par notification dans l&apos;application. La date de dernière mise à
            jour figure en haut de cette page.
          </p>
        </Section>

        {/* Footer links */}
        <div
          className="mt-12 pt-6 flex flex-wrap gap-4 text-sm border-t"
          style={{ borderColor: "rgba(212,175,55,0.15)" }}
        >
          <Link
            href="/mentions-legales"
            className="opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: "#D4AF37" }}
          >
            Mentions légales
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
      <div className="leading-relaxed text-sm">{children}</div>
    </section>
  );
}
