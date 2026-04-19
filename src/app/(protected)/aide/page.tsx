"use client"

/**
 * Epic 13 Story 13.6: In-app Help Center & FAQ
 */

import * as React from "react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { Search, X, ChevronDown, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "~/lib/utils"

const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    title: "Premiers pas",
    icon: "🚀",
    articles: [
      {
        id: "1",
        title: "Comment créer un compte ?",
        content: "Pour créer un compte, cliquez sur 'S'inscrire' et remplissez le formulaire avec votre email et mot de passe. Vous recevrez un email de confirmation.",
      },
      {
        id: "2",
        title: "Comment utiliser les agents IA ?",
        content: "Les agents IA sont accessibles depuis l'onglet 'Agents'. Sélectionnez un agent spécialisé (Scout, Form, etc.) et posez vos questions sur un match.",
      },
    ],
  },
  {
    id: "agents",
    title: "Agents IA",
    icon: "🤖",
    articles: [
      {
        id: "3",
        title: "Qu'est-ce qu'un agent IA ?",
        content: "Les agents IA sont des assistants spécialisés qui analysent les matchs selon différents critères : forme, statistiques, météo, arbitrage, etc.",
      },
      {
        id: "4",
        title: "Combien d'analyses puis-je faire ?",
        content: "Les utilisateurs Free ont 5 analyses/jour. Premium : 50/jour. Expert : illimité.",
      },
    ],
  },
  {
    id: "subscription",
    title: "Abonnement",
    icon: "💳",
    articles: [
      {
        id: "5",
        title: "Quelles sont les différences entre les abonnements ?",
        content: "Free : 5 analyses/jour. Premium (9.99€/mois) : 50 analyses/jour + accès salles privées. Expert (24.99€/mois) : analyses illimitées + création de contenu.",
      },
      {
        id: "6",
        title: "Comment annuler mon abonnement ?",
        content: "Allez dans Paramètres > Compte > Gérer l'abonnement. L'annulation prend effet à la fin de la période en cours.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Problèmes techniques",
    icon: "⚙️",
    articles: [
      {
        id: "7",
        title: "L'app ne charge pas les matchs",
        content: "Vérifiez votre connexion internet. Si le problème persiste, essayez de rafraîchir la page ou de vous reconnecter.",
      },
      {
        id: "8",
        title: "Je ne reçois pas de notifications",
        content: "Vérifiez que les notifications sont activées dans Paramètres > Notifications et dans les paramètres de votre navigateur/appareil.",
      },
    ],
  },
]

export default function AidePage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [expandedArticle, setExpandedArticle] = React.useState<string | null>(null)
  const [feedback, setFeedback] = React.useState<Record<string, "up" | "down">>({})

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return FAQ_CATEGORIES

    const query = searchQuery.toLowerCase()
    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      articles: category.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      ),
    })).filter((category) => category.articles.length > 0)
  }, [searchQuery])

  const handleFeedback = (articleId: string, type: "up" | "down") => {
    setFeedback({ ...feedback, [articleId]: type })
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="px-4 pt-4 space-y-3">
          <h1 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            ❓ Centre d&apos;aide
          </h1>

          {/* Search Bar */}
          <div className="relative pb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question..."
              className={cn(
                "w-full pl-10 pr-10 py-3 rounded-xl bg-bg-secondary",
                "text-text-primary placeholder:text-text-tertiary",
                "border border-bg-tertiary focus:border-accent-cyan",
                "focus:outline-none transition-colors"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-6xl">🔍</div>
            <h2 className="font-display text-xl text-text-primary">
              Aucun résultat pour &quot;{searchQuery}&quot;
            </h2>
            <p className="text-text-tertiary text-center max-w-md">
              Essayez un autre terme de recherche ou contactez le support
            </p>
            <button
              type="button"
              className="mt-4 px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-medium"
            >
              Contacter le support
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h2 className="font-display font-semibold text-text-primary flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.title}
                </h2>

                <div className="space-y-2">
                  {category.articles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-bg-secondary rounded-xl border border-bg-tertiary overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedArticle(
                            expandedArticle === article.id ? null : article.id
                          )
                        }
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-tertiary transition-colors"
                      >
                        <span className="font-medium text-text-primary">
                          {article.title}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-text-tertiary transition-transform",
                            expandedArticle === article.id && "rotate-180"
                          )}
                        />
                      </button>

                      {expandedArticle === article.id && (
                        <div className="px-4 pb-4 pt-2 border-t border-bg-tertiary">
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {article.content}
                          </p>

                          {/* Feedback */}
                          <div className="mt-4 pt-4 border-t border-bg-tertiary">
                            <p className="text-xs text-text-tertiary mb-2">
                              Cela vous a-t-il aidé ?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFeedback(article.id, "up")}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors",
                                  feedback[article.id] === "up"
                                    ? "bg-accent-green/20 text-accent-green"
                                    : "bg-bg-tertiary text-text-tertiary hover:text-text-primary"
                                )}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                Oui
                              </button>
                              <button
                                onClick={() => handleFeedback(article.id, "down")}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors",
                                  feedback[article.id] === "down"
                                    ? "bg-accent-red/20 text-accent-red"
                                    : "bg-bg-tertiary text-text-tertiary hover:text-text-primary"
                                )}
                              >
                                <ThumbsDown className="w-4 h-4" />
                                Non
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact Support */}
            <div className="mt-8 p-6 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 rounded-2xl border border-accent-cyan/30">
              <h3 className="font-display font-bold text-text-primary text-lg mb-2">
                Besoin d&apos;aide supplémentaire ?
              </h3>
              <p className="text-text-secondary mb-4">
                Notre équipe support est disponible pour vous aider
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-medium hover:bg-accent-cyan/80 transition-colors"
              >
                Contacter le support
              </button>
            </div>
          </div>
        )}
      </main>

      <DashboardNav />
    </div>
  )
}
