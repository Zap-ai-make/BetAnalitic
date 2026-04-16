"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft, MessageSquare, Trash2 } from "lucide-react"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

export default function AgentHistoryPage() {
  useSession()
  const router = useRouter()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.agents.listConversations.useInfiniteQuery(
      { limit: 20 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )

  const { data: agents = [] } = api.agents.getEnabled.useQuery()
  const utils = api.useUtils()

  const deleteConversation = api.agents.deleteConversation.useMutation({
    onSuccess: async () => {
      await utils.agents.listConversations.invalidate()
    },
  })

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? []

  const getAgentInfo = (agentType: string) => {
    return agents.find((a) => a.id.toUpperCase() === agentType)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-h-11"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          <h1 className="font-display text-lg font-bold text-text-primary">
            Historique
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <MessageSquare className="h-12 w-12 text-text-tertiary" />
            <p className="text-text-secondary text-center">
              Aucune conversation pour le moment
              <br />
              <span className="text-sm">
                Commencez à discuter avec un agent
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const agent = getAgentInfo(conv.agentType)
              const lastMessage = conv.messages[0]

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/agents?conversation=${conv.id}`)}
                  className={cn(
                    "w-full bg-bg-secondary rounded-xl p-4",
                    "border border-bg-tertiary hover:border-accent-cyan/50",
                    "transition-all text-left",
                    "flex items-start gap-3"
                  )}
                >
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-bg-tertiary">
                      {agent?.emoji ?? "🤖"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-text-primary">
                        {conv.title ?? agent?.name ?? "Conversation"}
                      </h3>
                      <span className="text-xs text-text-tertiary">
                        {conv.updatedAt.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    {/* Last message preview */}
                    {lastMessage && (
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {lastMessage.content}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-text-tertiary flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {conv.messages.length} messages
                      </span>
                      {agent && (
                        <span className="text-xs text-text-tertiary">
                          {agent.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Supprimer cette conversation ?")) {
                        deleteConversation.mutate({ id: conv.id })
                      }
                    }}
                    disabled={deleteConversation.isPending}
                    className="flex-shrink-0 p-2 text-text-tertiary hover:text-accent-red transition-colors min-h-11 min-w-11 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </button>
              )
            })}

            {/* Load more */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 text-accent-cyan text-sm font-medium disabled:opacity-50"
              >
                {isFetchingNextPage ? "Chargement..." : "Charger plus"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
