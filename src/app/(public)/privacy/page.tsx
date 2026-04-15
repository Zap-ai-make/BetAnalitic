import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="text-text-secondary hover:text-text-primary">
            ← Retour
          </Link>
          <h1 className="font-display font-bold text-text-primary">Confidentialité</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="p-4 pb-8 max-w-2xl mx-auto">
        <div className="space-y-6 text-text-secondary">
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary mb-3">
              Politique de Confidentialité
            </h2>
            <p className="text-sm text-text-tertiary mb-4">
              Dernière mise à jour : Avril 2026
            </p>
          </div>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">1. Introduction</h3>
            <p className="text-sm leading-relaxed">
              BetAnalytic s&apos;engage à protéger votre vie privée. Cette politique
              décrit comment nous collectons, utilisons et protégeons vos données
              personnelles conformément au Règlement Général sur la Protection
              des Données (RGPD).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">
              2. Données collectées
            </h3>
            <p className="text-sm leading-relaxed mb-2">
              Nous collectons les données suivantes :
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Informations de compte (email, nom d&apos;utilisateur)</li>
              <li>Préférences d&apos;utilisation (sports favoris, niveau)</li>
              <li>Historique d&apos;analyses consultées</li>
              <li>Données de connexion (IP, appareil)</li>
              <li>Données de paiement (traitées par Stripe)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">
              3. Utilisation des données
            </h3>
            <p className="text-sm leading-relaxed mb-2">
              Vos données sont utilisées pour :
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Fournir et améliorer nos services</li>
              <li>Personnaliser votre expérience</li>
              <li>Gérer votre compte et abonnement</li>
              <li>Vous contacter concernant votre compte</li>
              <li>Analyser l&apos;utilisation de la plateforme</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">4. Base légale</h3>
            <p className="text-sm leading-relaxed">
              Le traitement de vos données repose sur : l&apos;exécution du contrat
              (fourniture du service), votre consentement (marketing), nos
              intérêts légitimes (amélioration du service) et nos obligations
              légales.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">5. Partage des données</h3>
            <p className="text-sm leading-relaxed">
              Nous ne vendons pas vos données. Nous pouvons les partager avec :
              nos sous-traitants techniques (hébergement, paiement), les autorités
              si requis par la loi. Tous nos partenaires sont conformes au RGPD.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">
              6. Conservation des données
            </h3>
            <p className="text-sm leading-relaxed">
              Vos données sont conservées pendant la durée de votre compte, plus
              les durées légales requises. Après suppression du compte, les
              données sont effacées sous 30 jours.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">7. Vos droits RGPD</h3>
            <div className="bg-bg-secondary rounded-lg p-4">
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>
                    <strong>Accès :</strong> obtenir une copie de vos données
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>
                    <strong>Rectification :</strong> corriger vos données
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>
                    <strong>Effacement :</strong> supprimer vos données
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>
                    <strong>Portabilité :</strong> exporter vos données
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>
                    <strong>Opposition :</strong> vous opposer au traitement
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>
                    <strong>Limitation :</strong> restreindre le traitement
                  </span>
                </li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed">
              Pour exercer ces droits, accédez à{" "}
              <Link
                href="/settings/account"
                className="text-accent-cyan hover:underline"
              >
                Mon Compte
              </Link>{" "}
              ou contactez-nous.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">8. Cookies</h3>
            <p className="text-sm leading-relaxed">
              Nous utilisons des cookies essentiels pour le fonctionnement du
              service et des cookies analytiques (avec votre consentement) pour
              améliorer notre plateforme.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">9. Sécurité</h3>
            <p className="text-sm leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles
              appropriées pour protéger vos données : chiffrement, contrôle
              d&apos;accès, sauvegardes sécurisées.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-text-primary">10. Contact DPO</h3>
            <p className="text-sm leading-relaxed">
              Pour toute question concernant vos données personnelles :{" "}
              <a
                href="mailto:dpo@betanalytic.app"
                className="text-accent-cyan hover:underline"
              >
                dpo@betanalytic.app
              </a>
            </p>
            <p className="text-sm leading-relaxed">
              Vous pouvez également déposer une réclamation auprès de la CNIL :{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-cyan hover:underline"
              >
                www.cnil.fr
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
