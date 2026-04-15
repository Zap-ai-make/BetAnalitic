import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="text-text-secondary hover:text-text-primary">
            ← Retour
          </Link>
          <h1 className="font-display font-bold text-text-primary">Conditions</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="p-4 pb-8 max-w-2xl mx-auto">
        <div className="space-y-6 text-text-secondary">
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary mb-3">
              Conditions Générales d&apos;Utilisation
            </h2>
            <p className="text-sm text-text-tertiary mb-4">
              Dernière mise à jour : Avril 2026
            </p>
          </div>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">1. Objet</h3>
            <p className="text-sm leading-relaxed">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent
              l&apos;utilisation de la plateforme BetAnalytic, accessible via
              l&apos;application mobile et le site web. En utilisant BetAnalytic,
              vous acceptez les présentes conditions dans leur intégralité.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">2. Description du service</h3>
            <p className="text-sm leading-relaxed">
              BetAnalytic est une plateforme d&apos;analyse de paris sportifs
              utilisant l&apos;intelligence artificielle. Le service propose des
              analyses statistiques, des prédictions et des conseils stratégiques
              à titre purement informatif.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">
              3. Avertissement sur les risques
            </h3>
            <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-4 text-sm">
              <p className="font-medium text-accent-yellow mb-2">Important :</p>
              <ul className="space-y-2 text-text-secondary">
                <li>• Les analyses fournies sont à titre informatif uniquement</li>
                <li>• Elles ne constituent pas des conseils financiers</li>
                <li>• Les paris sportifs comportent des risques de perte</li>
                <li>• Vous êtes seul responsable de vos décisions de paris</li>
                <li>• Aucune garantie de résultat n&apos;est fournie</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">4. Inscription</h3>
            <p className="text-sm leading-relaxed">
              L&apos;utilisation de BetAnalytic nécessite la création d&apos;un compte.
              Vous devez fournir des informations exactes et maintenir la
              confidentialité de vos identifiants. Le service est réservé aux
              personnes majeures (18 ans ou plus).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">5. Abonnements</h3>
            <p className="text-sm leading-relaxed">
              BetAnalytic propose plusieurs niveaux d&apos;abonnement (Free, Premium,
              Expert). Les tarifs et fonctionnalités de chaque niveau sont
              détaillés sur la page de tarification. Les abonnements peuvent
              être résiliés à tout moment.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">6. Propriété intellectuelle</h3>
            <p className="text-sm leading-relaxed">
              Tous les contenus de BetAnalytic (textes, graphiques, logos,
              analyses, algorithmes) sont protégés par le droit d&apos;auteur.
              Toute reproduction non autorisée est interdite.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">7. Limitation de responsabilité</h3>
            <p className="text-sm leading-relaxed">
              BetAnalytic ne peut être tenu responsable des pertes financières
              résultant de l&apos;utilisation des analyses fournies. Les utilisateurs
              sont seuls responsables de leurs décisions de paris.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">8. Données personnelles</h3>
            <p className="text-sm leading-relaxed">
              Le traitement de vos données personnelles est décrit dans notre{" "}
              <Link href="/privacy" className="text-accent-cyan hover:underline">
                Politique de Confidentialité
              </Link>
              . Conformément au RGPD, vous disposez de droits d&apos;accès, de
              rectification et de suppression de vos données.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">9. Modification des CGU</h3>
            <p className="text-sm leading-relaxed">
              BetAnalytic se réserve le droit de modifier les présentes CGU.
              Les utilisateurs seront informés de tout changement significatif.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">10. Contact</h3>
            <p className="text-sm leading-relaxed">
              Pour toute question concernant ces conditions, contactez-nous à :{" "}
              <a
                href="mailto:contact@betanalytic.app"
                className="text-accent-cyan hover:underline"
              >
                contact@betanalytic.app
              </a>
            </p>
          </section>

          {/* Jeu Responsable */}
          <section className="bg-bg-secondary rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-text-primary">Jeu Responsable</h3>
            <p className="text-sm leading-relaxed">
              Les paris peuvent créer une dépendance. Si vous ou un proche avez
              des difficultés avec le jeu, contactez les ressources d&apos;aide :
            </p>
            <ul className="text-sm space-y-1">
              <li>
                • Joueurs Info Service :{" "}
                <a href="tel:0974751313" className="text-accent-cyan">
                  09 74 75 13 13
                </a>
              </li>
              <li>
                • Site web :{" "}
                <a
                  href="https://www.joueurs-info-service.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-cyan hover:underline"
                >
                  joueurs-info-service.fr
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
