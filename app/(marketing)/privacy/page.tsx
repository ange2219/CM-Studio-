import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — CM Studio',
  description: 'Politique de confidentialité de CM Studio, la plateforme de gestion des réseaux sociaux.',
}

export default function PrivacyPage() {
  const lastUpdated = '1er juin 2026'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d1a',
      color: '#e2e8f0',
      fontFamily: "'Inter', sans-serif",
      padding: '4rem 1.5rem',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4F8EF7, #7B5CF5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            CM Studio
          </span>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginTop: '1rem',
            marginBottom: '0.5rem',
          }}>
            Politique de Confidentialité
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Dernière mise à jour : {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <Section title="1. Introduction">
            <p>CM Studio (&quot;nous&quot;, &quot;notre&quot;, &quot;nos&quot;) s&apos;engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre service de gestion des réseaux sociaux.</p>
          </Section>

          <Section title="2. Informations collectées">
            <p>Nous collectons les informations suivantes :</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong style={{ color: '#a5b4fc' }}>Informations de compte :</strong> nom, adresse e-mail, photo de profil.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Données des réseaux sociaux :</strong> accès à vos Pages Facebook et comptes Instagram pour la publication et l&apos;analyse de contenu.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Données d&apos;utilisation :</strong> statistiques de publications, analyses de performance et préférences de l&apos;application.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Données de paiement :</strong> traitées de manière sécurisée par Stripe — nous ne stockons jamais les données de carte bancaire.</li>
            </ul>
          </Section>

          <Section title="3. Utilisation des informations">
            <p>Vos données sont utilisées pour :</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Fournir et améliorer nos services de gestion des réseaux sociaux.</li>
              <li>Publier du contenu sur vos réseaux sociaux en votre nom.</li>
              <li>Vous envoyer des notifications sur les interactions (likes, commentaires).</li>
              <li>Générer des analyses et statistiques de performance.</li>
              <li>Vous contacter concernant votre compte ou nos services.</li>
            </ul>
          </Section>

          <Section title="4. Connexion aux réseaux sociaux (Facebook & Instagram)">
            <p>CM Studio utilise l&apos;API officielle de Meta (Facebook et Instagram). Lorsque vous connectez votre compte :</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Nous accédons uniquement aux permissions que vous avez explicitement accordées.</li>
              <li>Nous stockons un jeton d&apos;accès chiffré pour effectuer des actions en votre nom.</li>
              <li>Vous pouvez révoquer l&apos;accès à tout moment depuis les paramètres de votre compte Facebook ou Instagram.</li>
              <li>Nous ne partageons jamais vos données Meta avec des tiers non autorisés.</li>
            </ul>
          </Section>

          <Section title="5. Partage des données">
            <p>Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers, sauf dans les cas suivants :</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong style={{ color: '#a5b4fc' }}>Fournisseurs de services :</strong> Supabase (base de données), Vercel (hébergement), Stripe (paiements) — liés par des accords de confidentialité stricts.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Obligation légale :</strong> si requis par la loi ou une autorité compétente.</li>
            </ul>
          </Section>

          <Section title="6. Sécurité des données">
            <p>Nous appliquons les mesures de sécurité suivantes :</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Chiffrement AES-256 de tous les jetons d&apos;accès aux réseaux sociaux.</li>
              <li>Connexions HTTPS sécurisées (TLS).</li>
              <li>Contrôle d&apos;accès strict via Row Level Security (RLS) sur notre base de données.</li>
              <li>Authentification sécurisée via Supabase Auth.</li>
            </ul>
          </Section>

          <Section title="7. Conservation des données">
            <p>Vos données sont conservées aussi longtemps que votre compte est actif. Vous pouvez demander la suppression complète de vos données à tout moment en nous contactant. Après suppression du compte, toutes les données personnelles sont effacées dans un délai de 30 jours.</p>
          </Section>

          <Section title="8. Vos droits (RGPD)">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous avez le droit de :</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong style={{ color: '#a5b4fc' }}>Accès :</strong> obtenir une copie de vos données personnelles.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Rectification :</strong> corriger des données inexactes.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Effacement :</strong> demander la suppression de vos données.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Portabilité :</strong> recevoir vos données dans un format structuré.</li>
              <li><strong style={{ color: '#a5b4fc' }}>Opposition :</strong> vous opposer au traitement de vos données.</li>
            </ul>
          </Section>

          <Section title="9. Cookies">
            <p>Nous utilisons uniquement des cookies essentiels au fonctionnement de l&apos;application (authentification, préférences de session). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.</p>
          </Section>

          <Section title="10. Contact">
            <p>Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous à :</p>
            <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(79, 142, 247, 0.1)', border: '1px solid rgba(79, 142, 247, 0.2)', borderRadius: '8px' }}>
              <p style={{ margin: 0 }}>📧 <strong style={{ color: '#a5b4fc' }}>contact@cms12.vercel.app</strong></p>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>CM Studio — Plateforme de gestion des réseaux sociaux</p>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1e2a3a', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          <p>© {new Date().getFullYear()} CM Studio. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      padding: '1.5rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
    }}>
      <h2 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(79,142,247,0.2)',
      }}>
        {title}
      </h2>
      <div style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.9rem' }}>
        {children}
      </div>
    </section>
  )
}
