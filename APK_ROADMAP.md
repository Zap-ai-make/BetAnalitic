# Roadmap — App Native Android (APK)

## Contexte
L'app BetAnalytic tourne sur Next.js 15 + tRPC + NextAuth, déployée sur Vercel.
Objectif : distribuer une app Android installable **sans passer par le Play Store**,
en gardant la même codebase et le même backend.

---

## Infrastructure PWA existante (déjà en place)

| Élément | Status | Détail |
|---------|--------|--------|
| `public/manifest.json` | ✅ | `display: standalone`, dark theme, icons 144/192/512 |
| Service Worker | ✅ | `@ducanh2912/next-pwa` + Workbox, caching complet |
| Apple Web App meta | ✅ | `apple-mobile-web-app-capable`, `status-bar: black-translucent` |
| Offline fallback | ✅ | `public/offline.html` |
| Push notifications | ⚠️ | Code complet, VAPID keys non générées |
| Dexie (offline storage) | ✅ | IndexedDB wrapper installé |
| URL déployée | ✅ | `https://combinee-gagnant.vercel.app` |

---

## Aspect natif — les utilisateurs ne verront pas que c'est du web

Avec **TWA + Digital Asset Links correctement configuré** :
- ❌ Aucune barre d'adresse Chrome visible
- ❌ Aucun bouton de navigation Chrome
- ✅ Plein écran total (comme une vraie app native)
- ✅ Icône sur l'écran d'accueil identique à n'importe quelle app
- ✅ Splash screen natif configurable
- ✅ Animations fluides (CSS déjà en place)
- ✅ Intégration système : notifications, partage, etc.

La condition est que `assetlinks.json` soit correct et que le domaine corresponde
au certificat APK. Si ce n'est pas le cas, Chrome affiche une barre en bas —
c'est résolu en une étape lors du build.

Même chose avec **Capacitor** : WebView plein écran, pas de UI navigateur visible.

---

## Options classées par recommandation

### 🥇 Option 1 : TWA (Trusted Web Activity) — RECOMMANDÉ

**Principe** : Bubblewrap CLI génère un APK Android (~3MB) qui charge l'URL Vercel
dans Chrome. Zéro changement de codebase.

**Avantages** :
- Aucun changement de codebase (charge l'URL Vercel directement)
- APK ~3MB seulement
- Mises à jour automatiques (redéployer Next.js = app à jour)
- SSR / tRPC / NextAuth fonctionnent sans adaptation
- Expérience 100% native (plein écran, no Chrome UI)

**Prérequis** :
- PWA valide (manifest + service worker → déjà en place ✅)
- `public/.well-known/assetlinks.json` — lie le domaine à l'APK signé
- Bubblewrap CLI pour générer l'APK
- Héberger l'APK (GitHub Releases, Vercel `/public/download/`, etc.)

**Commandes** :
```bash
# Installer Bubblewrap
npm i -g @bubblewrap/cli

# Init depuis le manifest existant
npx @bubblewrap/cli init --manifest=https://combinee-gagnant.vercel.app/manifest.json

# Build APK signé
npx @bubblewrap/cli build
# Sortie : app-release-signed.apk
```

**Fichier assetlinks.json** à créer dans `public/.well-known/assetlinks.json` :
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.betanalytic.app",
    "sha256_cert_fingerprints": ["EMPREINTE_SHA256_DU_KEYSTORE"]
  }
}]
```

**Timeline estimée** : 2-3h

---

### 🥈 Option 2 : Capacitor (remote URL)

**Principe** : Ionic Capacitor crée un APK natif avec WebView pointant sur Vercel.
Accès aux APIs natives via plugins (caméra, géoloc, push natif...).

**Config** :
```ts
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.betanalytic.app',
  appName: 'BetAnalytic',
  server: {
    url: 'https://combinee-gagnant.vercel.app',
    androidScheme: 'https',
  },
}
```

**Commandes** :
```bash
npm install @capacitor/core @capacitor/cli
npx cap init BetAnalytic com.betanalytic.app
npx cap add android
npx cap build android --androidreleasetype APK
```

**APK size** : ~12MB (runtime Capacitor + WebView)
**Timeline estimée** : 4-6h

---

### 🥉 Option 3 : PWA pure (déjà 90% prête)

Déclenche le dialog natif Android "Installer l'app" via `beforeinstallprompt`.
Pas un vrai APK — shortcut installable depuis le navigateur.

**Ce qui manque** :
- Composant `InstallBanner` (détection `beforeinstallprompt` + iOS fallback)
- VAPID keys pour les push notifications

**Timeline estimée** : 2-3h

---

## Plan d'implémentation recommandé (ordre)

### Étape 1 — InstallBanner PWA (~1-2h)
Composant `src/components/shared/InstallBanner.tsx` :
- Écoute `beforeinstallprompt` (Android Chrome)
- Affiche bannière "Installer l'app" pour Android
- Affiche guide "Ajouter à l'écran d'accueil" pour iOS (détection `navigator.userAgent`)
- Se masque une fois installé (`appinstalled` event)
- Intégrer dans `src/app/(protected)/layout.tsx` ou `Header.tsx`

### Étape 2 — VAPID keys pour push notifs (~30min)
```bash
npx web-push generate-vapid-keys
```
Ajouter dans `.env` :
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
```

### Étape 3 — TWA APK (~2-3h)
1. Générer un keystore Android signé
2. Créer `public/.well-known/assetlinks.json` avec l'empreinte SHA256
3. Run `bubblewrap init` + `bubblewrap build`
4. Héberger l'APK (GitHub Releases recommandé)
5. Ajouter bouton "Télécharger l'APK (.apk)" dans l'`InstallBanner`

---

## Expérience utilisateur cible

```
Utilisateur arrive sur le web (Android Chrome)
  → Bannière en bas : "Installer BetAnalytic"
  → [Installer maintenant]  [Télécharger l'APK]
  → Installer maintenant → dialog natif Chrome PWA
  → Télécharger l'APK → télécharge le TWA APK → install manuelle

Utilisateur arrive sur le web (iOS Safari)
  → Bannière : "Ajouter à l'écran d'accueil"
  → Instructions : Partager → Ajouter à l'écran d'accueil
```

---

## Fichiers à créer/modifier lors de l'implémentation

| Fichier | Action |
|---------|--------|
| `src/components/shared/InstallBanner.tsx` | Créer — composant install prompt |
| `src/app/(protected)/layout.tsx` | Ajouter `<InstallBanner />` |
| `public/.well-known/assetlinks.json` | Créer — Digital Asset Links pour TWA |
| `public/download/app.apk` | Ajouter — APK signé généré par Bubblewrap |
| `.env` | Ajouter VAPID keys |
| `capacitor.config.ts` | Créer si option Capacitor choisie |

---

## Notes techniques

- **SSR compatible** : TWA et Capacitor remote URL chargent l'URL Vercel → SSR, tRPC,
  NextAuth fonctionnent sans modification
- **Mises à jour** : redéployer Next.js sur Vercel suffit pour TWA/Capacitor
  (pas besoin de rebuild l'APK pour chaque feature)
- **iOS** : pas d'APK possible sur iOS — PWA "Add to Home Screen" est la seule option
- **Distribution** : APK téléchargeable directement (pas de Play Store), l'utilisateur
  doit activer "Sources inconnues" dans les paramètres Android
- **Icons** : les icônes PWA actuelles (144px PNG + SVG) sont suffisantes pour TWA.
  Ajouter un PNG 512x512 non-SVG pour meilleure compatibilité Android
