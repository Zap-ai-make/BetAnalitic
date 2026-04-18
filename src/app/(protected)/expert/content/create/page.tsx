"use client"

/**
 * Epic 10 Story 10.5: Premium Content Creation
 * Create and publish premium content as an expert
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Eye,
  Lock,
  Unlock,
  Send,
  Image as ImageIcon,
  X,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function CreateContentPage() {
  const router = useRouter()
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [excerpt, setExcerpt] = React.useState("")
  const [coverImage, setCoverImage] = React.useState("")
  const [isPremium, setIsPremium] = React.useState(false)
  const [category, setCategory] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState("")
  const [showPreview, setShowPreview] = React.useState(false)

  // Queries
  const { data: expertProfile } = api.expert.getMyExpertProfile.useQuery()

  // Mutations
  const createContentMutation = api.expert.createContent.useMutation({
    onSuccess: (data) => {
      if (data.isPublished) {
        router.push(`/expert/content/${data.id}`)
      } else {
        router.push("/expert/dashboard")
      }
    },
  })

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSaveDraft = () => {
    createContentMutation.mutate({
      title,
      content,
      excerpt,
      coverImage: coverImage || undefined,
      isPremium,
      category: category || undefined,
      tags,
      isPublished: false,
    })
  }

  const handlePublish = () => {
    createContentMutation.mutate({
      title,
      content,
      excerpt,
      coverImage: coverImage || undefined,
      isPremium,
      category: category || undefined,
      tags,
      isPublished: true,
    })
  }

  if (!expertProfile) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
            Accès refusé
          </h1>
          <p className="text-text-secondary mb-4">
            Vous devez être un expert vérifié pour créer du contenu.
          </p>
          <button
            onClick={() => router.push("/expert/apply")}
            className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors"
          >
            Devenir Expert
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-bg-tertiary sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors min-h-[44px]",
                  showPreview
                    ? "bg-accent-cyan text-bg-primary"
                    : "bg-bg-tertiary text-text-primary hover:bg-bg-primary"
                )}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {showPreview ? "Éditer" : "Aperçu"}
                </span>
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={!title || !content || createContentMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary text-text-primary rounded-xl font-semibold hover:bg-bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Brouillon</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={!title || !content || createContentMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Publier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!showPreview ? (
          // Editor Mode
          <div className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de votre contenu..."
                className="w-full px-4 py-3 bg-bg-secondary border-2 border-bg-tertiary rounded-xl text-2xl font-display font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Résumé court (optionnel)
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Un court résumé qui apparaîtra dans les aperçus..."
                maxLength={200}
                className="w-full px-4 py-3 bg-bg-secondary border-2 border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan transition-colors"
              />
              <p className="text-xs text-text-tertiary mt-1">
                {excerpt.length}/200 caractères
              </p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Image de couverture (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-3 bg-bg-secondary border-2 border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan transition-colors"
                />
                <button className="px-4 py-3 bg-bg-tertiary text-text-primary rounded-xl hover:bg-bg-primary transition-colors min-h-[44px] min-w-[44px]">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
              {coverImage && (
                <div className="mt-2 rounded-xl overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Contenu
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rédigez votre contenu ici... Vous pouvez utiliser du texte formaté."
                rows={20}
                className="w-full px-4 py-3 bg-bg-secondary border-2 border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan transition-colors resize-none font-mono text-sm"
              />
              <p className="text-xs text-text-tertiary mt-1">
                {content.length} caractères
              </p>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-secondary border-2 border-bg-tertiary rounded-xl text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
                >
                  <option value="">Sélectionner...</option>
                  <option value="analyse">Analyse</option>
                  <option value="pronostic">Pronostic</option>
                  <option value="tactique">Tactique</option>
                  <option value="strategie">Stratégie</option>
                  <option value="actualite">Actualité</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-4 py-3 bg-bg-secondary border-2 border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan transition-colors"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-accent-red transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-bg-secondary rounded-2xl border-2 border-bg-tertiary p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4">
                Visibilité du contenu
              </h3>
              <button
                onClick={() => setIsPremium(!isPremium)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all min-h-[44px]",
                  isPremium
                    ? "border-accent-gold bg-accent-gold/10"
                    : "border-bg-tertiary bg-bg-tertiary hover:bg-bg-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  {isPremium ? (
                    <Lock className="w-5 h-5 text-accent-gold" />
                  ) : (
                    <Unlock className="w-5 h-5 text-accent-green" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">
                      {isPremium ? "Contenu Premium" : "Contenu Gratuit"}
                    </p>
                    <p className="text-sm text-text-tertiary">
                      {isPremium
                        ? "Réservé aux abonnés payants"
                        : "Visible par tous les utilisateurs"}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors",
                    isPremium ? "bg-accent-gold" : "bg-bg-primary"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full bg-white transition-transform",
                      isPremium ? "translate-x-6" : "translate-x-0.5",
                      "mt-0.5"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="space-y-6">
            {coverImage && (
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}

            <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-8">
              <div className="flex items-center gap-2 mb-4">
                {isPremium && (
                  <span className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-xs font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Premium
                  </span>
                )}
                {category && (
                  <span className="px-3 py-1 bg-bg-tertiary text-text-secondary rounded-full text-xs font-semibold">
                    {category}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-display font-bold text-text-primary mb-4">
                {title || "Titre du contenu"}
              </h1>

              {excerpt && (
                <p className="text-lg text-text-secondary mb-6 italic">
                  {excerpt}
                </p>
              )}

              <div className="prose prose-invert max-w-none">
                <p className="text-text-primary whitespace-pre-wrap">
                  {content || "Votre contenu apparaîtra ici..."}
                </p>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-bg-tertiary">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
