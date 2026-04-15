# BetAnalytic Design Tokens

Documentation complète du système de design tokens pour BetAnalytic.

## Vue d'ensemble

Ce système contient **23 couleurs**, **7 valeurs de spacing**, **5 border-radius**, **7 tailles de police**, **4 poids de police**, et **2 gradients** définis comme CSS Custom Properties.

## Utilisation

### Option 1: CSS Variables (directe)

```css
.ma-classe {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
}
```

### Option 2: Tailwind Utilities (recommandé)

```tsx
<div className="bg-bg-primary text-text-primary p-4">
  <h1 className="font-display text-3xl font-bold">Titre</h1>
  <p className="font-body text-base">Corps de texte</p>
</div>
```

---

## Couleurs

### Background Colors (3)

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--color-bg-primary` | #0D0D0F | `bg-bg-primary` | Fond principal (noir très foncé) |
| `--color-bg-secondary` | #161618 | `bg-bg-secondary` | Fond secondaire (gris foncé) |
| `--color-bg-tertiary` | #1E1E22 | `bg-bg-tertiary` | Fond tertiaire (gris ultra foncé) |

### Accent Colors (5)

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--color-accent-cyan` | #00D4FF | `text-accent-cyan`, `bg-accent-cyan` | Accent principal |
| `--color-accent-orange` | #FF6B35 | `text-accent-orange`, `bg-accent-orange` | Accent secondaire |
| `--color-accent-green` | #00FF88 | `text-accent-green`, `bg-accent-green` | Success |
| `--color-accent-gold` | #FFD93D | `text-accent-gold`, `bg-accent-gold` | Warning |
| `--color-accent-red` | #FF4757 | `text-accent-red`, `bg-accent-red` | Error |

### Text Colors (3)

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--color-text-primary` | #FFFFFF | `text-text-primary` | Texte principal (blanc pur) |
| `--color-text-secondary` | #A0A0A8 | `text-text-secondary` | Texte secondaire (gris moyen) |
| `--color-text-tertiary` | #606068 | `text-text-tertiary` | Texte tertiaire (gris foncé) |

### Agent Colors (14)

Chaque agent IA a une couleur distinctive.

| Agent | Token | Valeur | Tailwind | Description |
|-------|-------|--------|----------|-------------|
| Scout | `--color-agent-scout` | #00FF88 | `text-agent-scout`, `bg-agent-scout` | Vert Néon |
| Insider | `--color-agent-insider` | #FF6B35 | `text-agent-insider`, `bg-agent-insider` | Orange Vif |
| RefereeAnalyst | `--color-agent-referee` | #FFD93D | `text-agent-referee`, `bg-agent-referee` | Jaune Or |
| TacticMaster | `--color-agent-tactic` | #00D4FF | `text-agent-tactic`, `bg-agent-tactic` | Cyan Électrique |
| ContextKing | `--color-agent-context` | #9B59B6 | `text-agent-context`, `bg-agent-context` | Violet Royal |
| MomentumX | `--color-agent-momentum` | #E91E63 | `text-agent-momentum`, `bg-agent-momentum` | Rose Fuchsia |
| WallMaster | `--color-agent-wall` | #607D8B | `text-agent-wall`, `bg-agent-wall` | Gris Acier |
| GoalMaster | `--color-agent-goal` | #4CAF50 | `text-agent-goal`, `bg-agent-goal` | Vert Terrain |
| CornerKing | `--color-agent-corner` | #FF9800 | `text-agent-corner`, `bg-agent-corner` | Orange Corner |
| CardShark | `--color-agent-card` | #F44336 | `text-agent-card`, `bg-agent-card` | Rouge Carton |
| CrowdWatch | `--color-agent-crowd` | #3F51B5 | `text-agent-crowd`, `bg-agent-crowd` | Bleu Indigo |
| LivePulse | `--color-agent-live` | #00BCD4 | `text-agent-live`, `bg-agent-live` | Turquoise |
| DebateArena | `--color-agent-debate` | #FFEB3B | `text-agent-debate`, `bg-agent-debate` | Jaune Arène |
| Debrief | `--color-agent-debrief` | #795548 | `text-agent-debrief`, `bg-agent-debrief` | Marron Archive |

---

## Spacing

Base unit: **4px**

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--spacing-1` | 4px | `p-1`, `m-1`, `gap-1` | Extra small |
| `--spacing-2` | 8px | `p-2`, `m-2`, `gap-2` | Small |
| `--spacing-4` | 16px | `p-4`, `m-4`, `gap-4` | Base |
| `--spacing-6` | 24px | `p-6`, `m-6`, `gap-6` | Medium |
| `--spacing-8` | 32px | `p-8`, `m-8`, `gap-8` | Large |
| `--spacing-12` | 48px | `p-12`, `m-12`, `gap-12` | Extra large |
| `--spacing-16` | 64px | `p-16`, `m-16`, `gap-16` | XXL |

---

## Border Radius

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--radius-sm` | 4px | `rounded-sm` | Petits éléments |
| `--radius-md` | 8px | `rounded-md` | Éléments moyens |
| `--radius-lg` | 12px | `rounded-lg` | Grands éléments |
| `--radius-xl` | 16px | `rounded-xl` | Très grands éléments |
| `--radius-full` | 9999px | `rounded-full` | Pills, circles |

---

## Typographie

### Font Families

| Token | Font | Tailwind | Usage |
|-------|------|----------|-------|
| `--font-body` | Inter | `font-body` | Corps de texte |
| `--font-display` | Outfit | `font-display` | Titres, headings |
| `--font-mono` | JetBrains Mono | `font-mono` | Statistiques, code |

### Font Sizes

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--text-xs` | 10px | `text-xs` | Extra small |
| `--text-sm` | 12px | `text-sm` | Small |
| `--text-base` | 14px | `text-base` | Base (défaut) |
| `--text-lg` | 16px | `text-lg` | Large |
| `--text-xl` | 20px | `text-xl` | Extra large |
| `--text-2xl` | 24px | `text-2xl` | 2X large |
| `--text-3xl` | 32px | `text-3xl` | 3X large (titres) |

### Font Weights

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--font-normal` | 400 | `font-normal` | Normal weight |
| `--font-medium` | 500 | `font-medium` | Medium weight |
| `--font-semibold` | 600 | `font-semibold` | Semibold weight |
| `--font-bold` | 700 | `font-bold` | Bold weight |

---

## Gradients

### Logo Gradient

```css
background: var(--gradient-logo);
/* linear-gradient(135deg, #00D4FF 0%, #FF6B35 100%) */
```

Utilisation:
```tsx
<div className="bg-[var(--gradient-logo)]">Logo</div>
```

### Premium Gradient

```css
background: var(--gradient-premium);
/* linear-gradient(135deg, #FFD93D 0%, #FFB300 100%) */
```

Utilisation:
```tsx
<div className="bg-[var(--gradient-premium)]">Premium</div>
```

---

## Exemples de composants

### Card avec Agent Color

```tsx
<div className="bg-bg-secondary rounded-lg p-4 border-l-4 border-agent-scout">
  <h3 className="font-display text-lg font-semibold text-text-primary">
    Scout Analysis
  </h3>
  <p className="font-body text-base text-text-secondary mt-2">
    Detailed analysis content...
  </p>
</div>
```

### Button avec Gradient

```tsx
<button className="bg-[var(--gradient-logo)] text-white font-semibold px-6 py-2 rounded-md">
  Analyser
</button>
```

### Typography Hierarchy

```tsx
<div className="font-body">
  <h1 className="font-display text-3xl font-bold text-text-primary">
    Titre Principal
  </h1>
  <h2 className="font-display text-2xl font-semibold text-text-primary mt-4">
    Sous-titre
  </h2>
  <p className="text-base text-text-secondary mt-2">
    Corps de texte avec couleur secondaire.
  </p>
  <span className="font-mono text-sm text-accent-green">
    WIN: 75%
  </span>
</div>
```

---

## Notes techniques

1. **JIT Mode**: Tailwind CSS v4 utilise le JIT (Just-In-Time) mode par défaut. Toutes les classes sont générées à la demande.

2. **CSS Variables**: Les tokens sont définis dans `src/styles/tokens.css` et importés avant les directives Tailwind dans `src/app/globals.css`.

3. **Fonts**: Les polices sont chargées via `next/font/google` dans `src/app/layout.tsx` pour une performance optimale.

4. **Dark Mode**: Le design est conçu en dark mode par défaut (99% des utilisateurs mobiles).

---

## Contribution

Lors de l'ajout de nouveaux composants:
1. Utilisez **toujours** les design tokens (pas de valeurs hardcodées)
2. Préférez les **utility classes Tailwind** aux CSS custom
3. Respectez la **hiérarchie typographique** (display pour titres, body pour texte)
4. Utilisez les **couleurs agents** de manière cohérente
