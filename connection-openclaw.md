 ⎿  # BetAnalytic API — Guide d'intégration Frontend

     **Base URL :** `https://api.srv1066171.hstgr.cloud`
     **Version :** 2.0.0

     ---

     ## 1. Architecture

     ```
     Navigateur (browser)
           │
           ▼
     Next.js (serveur Node)          ← Auth, sessions, Stripe
           │
           │  Header X-Internal-Secret (obligatoire sur tous les /api/*)
           │  Header Authorization: Bearer <token>
           ▼
     BetAnalytic API (FastAPI)       ← Agents, matchs, salles, paris virtuels
           │
           ├── PostgreSQL             ← Users, rooms, messages, bets
           └── Redis                  ← Cache + rate limiting
     ```

     **Règle absolue :** le browser ne parle JAMAIS directement à BetAnalytic.
     Toutes les requêtes passent par les API Routes Next.js qui ajoutent les headers sécurisés.

     ---

     ## 2. Headers obligatoires

     Chaque requête vers `/api/*` doit contenir **ces deux headers** :

     ```
     X-Internal-Secret: 28b5305a85132aa07572168ebccbcfd12399c290285dc8e52d8c0394fb22767d
     Authorization: Bearer <token>
     ```

     Sans `X-Internal-Secret` → **403 immédiat** (Nginx bloque avant même FastAPI).
     Sans `Authorization` → **401**.

     ### Variables d'environnement Next.js (.env.local)

     ```env
     BETANALYTIC_API_URL=https://api.srv1066171.hstgr.cloud
     BETANALYTIC_INTERNAL_SECRET=28b5305a85132aa07572168ebccbcfd12399c290285dc8e52d8c0394fb22767d
     BETANALYTIC_JWT_SECRET=change-me-in-production
     ```

     > ⚠️ `BETANALYTIC_JWT_SECRET` doit être identique à `JWT_SECRET` dans le `.env` de l'API.
     > Ne jamais mettre ces variables avec le préfixe `NEXT_PUBLIC_` — elles ne doivent pas être exposées au browser.

     ### Helper fetch Next.js

     ```typescript
     // lib/betanalytic.ts

     const API_URL = process.env.BETANALYTIC_API_URL!
     const SECRET  = process.env.BETANALYTIC_INTERNAL_SECRET!

     export async function betaFetch(
       path: string,
       userToken: string,
       init?: RequestInit
     ): Promise<Response> {
       return fetch(`${API_URL}${path}`, {
         ...init,
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${userToken}`,
           'X-Internal-Secret': SECRET,
           ...(init?.headers ?? {}),
         },
       })
     }
     ```

     ---

     ## 3. Authentification — Gestion des utilisateurs

     ### Comment ça marche

     BetAnalytic a sa propre table `users` (UUID, tier, api_key).
     Le frontend est **source de vérité pour l'auth** (Neon DB).
     À l'inscription d'un utilisateur côté frontend → le frontend crée le user dans BetAnalytic via l'endpoint admin.

     ### 3.1 Créer un utilisateur (à l'inscription)

     ```
     POST /api/admin/users
     Authorization: Bearer <ADMIN_API_KEY>
     X-Internal-Secret: <secret>

     {
       "email": "user@example.com",
       "username": "johndoe",        // optionnel, affiché dans les salles
       "tier": "FREE"                // FREE | PREMIUM | EXPERT
     }
     ```

     **Réponse :**
     ```json
     {
       "success": true,
       "user": {
         "id": "550e8400-e29b-41d4-a716-446655440000",
         "email": "user@example.com",
         "username": "johndoe",
         "tier": "FREE",
         "api_key": "ba-xxxxxxxxxxxxxxxxxxxx"
       }
     }
     ```

     → Stocker `id` et `api_key` dans Neon, associés au user frontend.

     ### 3.2 Deux méthodes d'authentification

     **Option A — API Key (recommandé pour server-to-server)**
     Utiliser directement l'`api_key` retournée à la création :

     ```
     Authorization: Bearer ba-xxxxxxxxxxxxxxxxxxxx
     ```

     **Option B — JWT**
     Générer un JWT côté Next.js avec le secret partagé :

     ```typescript
     import { SignJWT } from 'jose'

     async function generateBetaToken(userId: string): Promise<string> {
       const secret = new TextEncoder().encode(process.env.BETANALYTIC_JWT_SECRET)
       return new SignJWT({ sub: userId })
         .setProtectedHeader({ alg: 'HS256' })
         .setExpirationTime('1h')
         .sign(secret)
     }
     ```

     > Pour un SaaS, l'Option A est plus simple : stocker l'`api_key` en DB Neon, la lire à chaque requête.

     ### 3.3 Changer le tier (après paiement Stripe)

     ```
     POST /api/admin/users/{betanalytic_user_id}/tier
     Authorization: Bearer <ADMIN_API_KEY>
     X-Internal-Secret: <secret>

     {
       "tier": "PREMIUM"    // FREE | PREMIUM | EXPERT | ADMIN
     }
     ```

     **Réponse :**
     ```json
     { "success": true, "user_id": "...", "new_tier": "PREMIUM" }
     ```

     → Appeler cet endpoint dans le webhook Stripe quand un paiement est confirmé.

     ### 3.4 Clé admin (pour les opérations serveur-à-serveur)

     ```
     BETANALYTIC_ADMIN_KEY=ba-admin-e08c9151eabb91a2a2e43eef9218347a
     ```

     À utiliser uniquement côté serveur Next.js pour les opérations admin (création user, changement tier).

     ---

     ## 4. Rate Limiting

     Les headers de réponse indiquent la consommation :

     ```
     X-RateLimit-Limit: 5          // requêtes max par minute
     X-RateLimit-Remaining: 3      // restantes dans la minute
     X-RateLimit-Reset: 1713697260 // timestamp Unix de reset
     ```

     | Tier    | Requêtes/min |
     |---------|-------------|
     | FREE    | 5           |
     | PREMIUM | 20          |
     | EXPERT  | 50          |
     | ADMIN   | illimité    |

     En cas de dépassement → **429** `RATE_LIMIT_EXCEEDED`.

     ---

     ## 5. Format des erreurs

     Toutes les erreurs suivent ce format :

     ```json
     {
       "success": false,
       "error": "CODE_ERREUR",
       "detail": "Message lisible"
     }
     ```

     | Code HTTP | Code erreur | Cause |
     |-----------|-------------|-------|
     | 400 | `INVALID_AGENT_TYPE` | Agent inexistant |
     | 400 | `NO_VALID_AGENTS` | Aucun agent valide dans la liste |
     | 401 | `UNAUTHORIZED` | Token absent ou invalide |
     | 403 | `TIER_INSUFFICIENT` | Agent non disponible dans ce tier |
     | 403 | `AGENT_NOT_IN_TIER` | Agent non autorisé |
     | 404 | `ROOM_NOT_FOUND` | Salle inexistante |
     | 403 | `NOT_A_MEMBER` | Non membre de la salle |
     | 429 | `RATE_LIMIT_EXCEEDED` | Trop de requêtes |
     | 503 | `MATCH_DATA_UNAVAILABLE` | ESPN inaccessible |
     | 503 | `AGENT_UNAVAILABLE` | Erreur agent LLM |

     ---

     ## 6. Endpoints — Matchs

     ### 6.1 Listing des matchs à venir

     ```
     GET /api/matches?days=3&competition=Premier+League
     ```

     | Paramètre | Type | Défaut | Description |
     |-----------|------|--------|-------------|
     | `days` | int | 3 | Nombre de jours (1–7) |
     | `competition` | string | null | Filtre par compétition |

     **Réponse :**
     ```json
     {
       "total": 24,
       "competitions_count": 5,
       "days_ahead": 3,
       "matches_by_competition": {
         "Premier League": [
           {
             "match_id": "espn_740928",
             "home_team": "Brighton & Hove Albion",
             "away_team": "Chelsea",
             "home_team_id": "360",
             "away_team_id": "363",
             "competition": "Premier League",
             "country": "England",
             "date_iso": "2026-04-21T19:00:00Z",
             "date_timestamp": 1745265600,
             "status": "notstarted",
             "venue": "Amex Stadium",
             "odds": {
               "1": 3.20,
               "X": 3.40,
               "2": 2.10
             }
           }
         ]
       }
     }
     ```

     ### 6.2 Recherche de matchs

     ```
     GET /api/matches/search?q=Arsenal&date=2026-04-21
     ```

     | Paramètre | Type | Requis | Description |
     |-----------|------|--------|-------------|
     | `q` | string | oui | Nom d'équipe ou compétition (min 2 chars) |
     | `date` | string | non | Format `YYYY-MM-DD` |

     ### 6.3 Classement d'une compétition

     ```
     GET /api/matches/standings/{competition_id}
     ```

     `competition_id` : `premier-league` | `la-liga` | `bundesliga` | `serie-a` | `ligue-1` | `champions-league` | `mls` |
     `championship` | `eredivisie` | `primeira-liga` | `serie-a-brazil`

     ### 6.4 Détail d'un match

     ```
     GET /api/matches/{match_id}?home_team=Brighton&away_team=Chelsea
     ```

     **Réponse :**
     ```json
     {
       "match_id": "espn_740928",
       "home_team": "Brighton & Hove Albion",
       "away_team": "Chelsea",
       "competition": "Premier League",
       "date": "2026-04-21T19:00:00Z",
       "venue": "Amex Stadium",
       "referee": null,
       "data_completeness_pct": 75.0,
       "data_sources": ["ESPN", "SofaScore"],
       "odds": { "1": 3.20, "X": 3.40, "2": 2.10 },
       "home_injuries": [
         { "player": { "name": "João Pedro" }, "type": "injury" }
       ],
       "away_injuries": [],
       "available_agents": [
         { "type": "SCOUT", "emoji": "🔍", "description": "Collecte et synthèse des données" },
         { "type": "FORM",  "emoji": "📊", "description": "Analyse de forme récente" }
       ]
     }
     ```

     ### 6.5 Analyser avec 1 agent

     ```
     POST /api/matches/{match_id}/analyze?home_team=Brighton&away_team=Chelsea

     {
       "agent_type": "FORM",
       "question": "Comment est la forme de Chelsea sur les 5 derniers matchs ?"
     }
     ```

     | Champ | Type | Requis | Description |
     |-------|------|--------|-------------|
     | `agent_type` | string | oui | SCOUT \| FORM \| H2H \| STATS \| ... |
     | `question` | string | non | Question libre à l'agent |

     **Réponse :**
     ```json
     {
       "success": true,
       "match": "Brighton & Hove Albion vs Chelsea",
       "agent_type": "FORM",
       "content": "Chelsea enchaîne 3 victoires consécutives...",
       "confidence": 0.82,
       "key_insights": [
         "3 victoires sur les 5 derniers matchs",
         "Défense solide : 1.2 buts encaissés/match"
       ],
       "warnings": null,
       "processing_time_seconds": 4.2,
       "data_completeness_pct": 75.0
     }
     ```

     ### 6.6 Analyse complète (tous les agents du tier)

     ```
     POST /api/matches/{match_id}/analyze-full?home_team=Brighton&away_team=Chelsea

     {
       "question": "Quel est le pronostic pour ce match ?",
       "agents": ["FORM", "H2H", "PREDICT"]   // optionnel, null = tous les agents du tier
     }
     ```

     **Réponse :**
     ```json
     {
       "success": true,
       "match": "Brighton & Hove Albion vs Chelsea",
       "competition": "Premier League",
       "date": "2026-04-21T19:00:00Z",
       "data_completeness_pct": 75.0,
       "agents_count": 8,
       "consensus": {
         "average_confidence": 0.74,
         "agents_count": 8,
         "successful_agents": 8,
         "main_prediction": "Chelsea favori à l'extérieur...",
         "top_insights": ["...", "..."],
         "risk_level": "Modéré",
         "value_found": null
       },
       "agents_results": {
         "FORM": {
           "agent_type": "FORM",
           "emoji": "📊",
           "content": "...",
           "confidence": 0.80,
           "key_insights": ["..."],
           "warnings": null,
           "processing_time_seconds": 3.8
         },
         "H2H": { ... }
       }
     }
     ```

     ---

     ## 7. Endpoints — Analytics (données brutes, sans agents LLM)

     Ces endpoints ne consomment PAS de quota Anthropic.

     ### 7.1 Analyse complète (Poisson + xG + marché)

     ```
     GET /api/analytics/match/{match_id}?home_team=Brighton&away_team=Chelsea&competition=Premier+League
     ```

     ### 7.2 Modèle Poisson uniquement

     ```
     GET /api/analytics/match/{match_id}/poisson?home_team=Brighton&away_team=Chelsea
     ```

     **Réponse :**
     ```json
     {
       "available": true,
       "model": "Dixon-Coles",
       "home_win_prob": 0.2228,
       "draw_prob": 0.3369,
       "away_win_prob": 0.4403,
       "expected_home_goals": 0.77,
       "expected_away_goals": 1.19,
       "most_likely_score": "0-0",
       "most_likely_score_prob": 0.1583,
       "over_25_prob": 0.3113,
       "btts_prob": 0.3897,
       "top_scores": [["0-0", 0.158], ["0-1", 0.151], ["1-1", 0.112]],
       "data_quality": "high",
       "notes": ["Basé sur xG (plus fiable que les buts bruts)"]
     }
     ```

     ### 7.3 Données xG

     ```
     GET /api/analytics/match/{match_id}/xg?home_team=Brighton&away_team=Chelsea&competition=Premier+League
     ```

     ### 7.4 Analyse de marché (cotes)

     ```
     GET /api/analytics/match/{match_id}/market?home_team=Brighton&away_team=Chelsea
     ```

     ---

     ## 8. Endpoints — Salles (style Discord)

     ### 8.1 Créer une salle

     ```
     POST /api/rooms

     {
       "name": "Analyse Premier League",
       "description": "Discussion matchs PL",
       "type": "public"    // public | private
     }
     ```

     ### 8.2 Lister les salles

     ```
     GET /api/rooms?type=public&page=1&per_page=20
     ```

     ### 8.3 Rejoindre une salle

     ```
     POST /api/rooms/{room_id}/join
     ```

     ### 8.4 Envoyer un message avec @mention d'agents

     ```
     POST /api/rooms/{room_id}/message

     {
       "content": "@FORM @H2H analyse Brighton vs Chelsea",
       "match_context": {
         "match_id": "espn_740928",
         "home_team": "Brighton & Hove Albion",
         "away_team": "Chelsea",
         "competition": "Premier League",
         "date": "2026-04-21T19:00:00Z"
       }
     }
     ```

     > Les agents détectés dans le message via `@NOM` répondent automatiquement.
     > `match_context` est optionnel mais enrichit considérablement les réponses agents.

     **Agents mentionnables :** `@SCOUT` `@FORM` `@H2H` `@STATS` `@MOMENTUM` `@CONTEXT` `@ODDS` `@WEATHER` `@REFEREE` `@INJURY`
     `@SENTIMENT` `@PREDICT` `@RISK` `@VALUE`

     **Réponse :**
     ```json
     {
       "success": true,
       "message_id": "uuid",
       "mentions_detected": ["FORM", "H2H"],
       "agent_responses": [
         {
           "id": "uuid",
           "agent_type": "FORM",
           "content": "Brighton est en difficulté...",
           "confidence": 0.78,
           "metadata": {
             "key_insights": ["..."],
             "processing_time_seconds": 4.1
           },
           "created_at": "2026-04-21T11:30:00Z"
         }
       ]
     }
     ```

     ### 8.5 Historique des messages

     ```
     GET /api/rooms/{room_id}/messages?page=1&per_page=30
     ```

     ### 8.6 WebSocket — temps réel

     ```
     WSS /api/rooms/{room_id}/ws?token=<api_key_ou_jwt>
     ```

     > Note : le WebSocket utilise `?token=` en query param (pas de header possible en WS).

     **Events reçus :**

     | Event | Description | Payload |
     |-------|-------------|---------|
     | `connected` | Connexion établie | `{room_id, room_name, username, online}` |
     | `user_message` | Nouveau message utilisateur | `{id, author, content, mentions, created_at}` |
     | `agent_typing` | Agent en train de répondre | `{agent_type, room_id}` |
     | `agent_response` | Réponse agent disponible | `{agent_type, content, confidence, metadata}` |
     | `member_join` | Membre rejoint | `{username}` |
     | `member_leave` | Membre parti | `{username}` |

     **Keepalive :** envoyer `"ping"` → reçoit `"pong"`.

     **Exemple Next.js :**
     ```typescript
     const ws = new WebSocket(
       `wss://api.srv1066171.hstgr.cloud/api/rooms/${roomId}/ws?token=${userApiKey}`
     )

     ws.onmessage = (event) => {
       const { type, data } = JSON.parse(event.data)
       if (type === 'agent_response') {
         // Afficher la réponse dans le chat
       }
     }

     // Keepalive
     setInterval(() => ws.readyState === 1 && ws.send('ping'), 30000)
     ```

     ---

     ## 9. Endpoints — Paris virtuels

     Chaque user démarre avec **1 000 unités virtuelles**.

     ### 9.1 Solde et statistiques

     ```
     GET /api/betting/account
     ```

     **Réponse :**
     ```json
     {
       "balance": 1243.50,
       "total_wagered": 850.0,
       "total_won": 1093.50,
       "pnl": 243.50,
       "roi_pct": 28.6,
       "bets_count": 12
     }
     ```

     ### 9.2 Placer un pari simple

     ```
     POST /api/betting/bet

     {
       "match_id": "espn_740928",
       "home_team": "Brighton & Hove Albion",
       "away_team": "Chelsea",
       "competition": "Premier League",
       "agent_type": "PREDICT",          // agent qui a inspiré ce pari (optionnel)
       "prediction": "1X2:2",            // clé machine
       "prediction_label": "Victoire Chelsea",
       "odds": 2.10,
       "stake": 50.0
     }
     ```

     **Format `prediction` (clé machine) :**

     | Marché | Format | Exemple |
     |--------|--------|---------|
     | Résultat 1X2 | `1X2:1` / `1X2:X` / `1X2:2` | `1X2:2` = victoire extérieur |
     | Les deux marquent | `BTTS:yes` / `BTTS:no` | `BTTS:yes` |
     | Plus/Moins de buts | `Over:2.5` / `Under:2.5` | `Over:2.5` |

     ### 9.3 Historique des paris

     ```
     GET /api/betting/bets?page=1&per_page=20
     ```

     ### 9.4 Leaderboard

     ```
     GET /api/betting/leaderboard
     ```

     ### 9.5 Coupons (combinés multi-matchs)

     ```
     POST /api/betting/coupons                         → créer coupon vide
     POST /api/betting/coupons/{id}/selections         → ajouter une sélection
     DELETE /api/betting/coupons/{id}/selections/{sid} → retirer une sélection
     POST /api/betting/coupons/{id}/place              → valider + débiter
     GET  /api/betting/coupons/{id}                    → détail coupon
     GET  /api/betting/coupons                         → mes coupons
     ```

     ---

     ## 10. Endpoints — Admin (serveur Next.js uniquement)

     > Ces endpoints nécessitent un token ADMIN. Ne jamais les exposer au browser.

     ### 10.1 Créer un utilisateur

     ```
     POST /api/admin/users
     Authorization: Bearer ba-admin-e08c9151eabb91a2a2e43eef9218347a

     {
       "email": "user@example.com",
       "username": "johndoe",
       "tier": "FREE"
     }
     ```

     ### 10.2 Changer le tier (webhook Stripe)

     ```
     POST /api/admin/users/{betanalytic_user_id}/tier

     { "tier": "PREMIUM" }
     ```

     ### 10.3 Enregistrer le résultat d'un match

     ```
     POST /api/admin/matches/result

     {
       "match_id": "espn_740928",
       "home_team": "Brighton & Hove Albion",
       "away_team": "Chelsea",
       "score": "1-2",
       "result": "2",          // "1" = domicile | "X" = nul | "2" = extérieur
       "btts": true,
       "total_goals": 3,
       "correct_agent_types": ["FORM", "PREDICT"]   // agents qui avaient raison
     }
     ```

     ### 10.4 Performance des agents

     ```
     GET /api/admin/agents/performance
     ```

     ---

     ## 11. Agents disponibles par tier

     | Agent | Emoji | Rôle | FREE | PREMIUM | EXPERT |
     |-------|-------|------|------|---------|--------|
     | SCOUT | 🔍 | Synthèse données collectées | ✅ | ✅ | ✅ |
     | FORM | 📊 | Analyse forme récente | ✅ | ✅ | ✅ |
     | H2H | ⚔️ | Confrontations directes | ✅ | ✅ | ✅ |
     | MOMENTUM | 🌊 | Dynamique et élan | ✅ | ✅ | ✅ |
     | CONTEXT | 🧠 | Contexte (enjeux, motivation) | ✅ | ✅ | ✅ |
     | WEATHER | ☁️ | Impact météo | ✅ | ✅ | ✅ |
     | REFEREE | 🟨 | Profil arbitre | ✅ | ✅ | ✅ |
     | INJURY | 🏥 | Blessés / suspendus | ✅ | ✅ | ✅ |
     | STATS | 📈 | Stats avancées + Poisson/xG | ❌ | ✅ | ✅ |
     | ODDS | 💰 | Mouvement des cotes | ❌ | ✅ | ✅ |
     | SENTIMENT | 💬 | Sentiment médiatique | ❌ | ✅ | ✅ |
     | PREDICT | 🎯 | Synthèse prédictive | ❌ | ✅ | ✅ |
     | RISK | ⚠️ | Analyse des risques | ❌ | ✅ | ✅ |
     | VALUE | 💎 | Valeur statistique | ❌ | ❌ | ✅ |

     ---

     ## 12. Flux complet — inscription d'un utilisateur

     ```
     1. User s'inscrit sur le frontend (Next.js + Neon)
             │
     2. Next.js API Route → POST /api/admin/users (BetAnalytic)
             │              { email, username, tier: "FREE" }
             │
     3. BetAnalytic retourne { id, api_key }
             │
     4. Next.js stocke { betanalytic_id, betanalytic_api_key } dans Neon
             │
     5. User navigue → Next.js API Route récupère api_key depuis Neon
             │
     6. Next.js → BetAnalytic avec Authorization: Bearer <api_key>
                                               + X-Internal-Secret: <secret>
     ```

     ## 13. Flux complet — upgrade Stripe → PREMIUM

     ```
     1. User paie sur Stripe
             │
     2. Stripe webhook → Next.js
             │
     3. Next.js → POST /api/admin/users/{id}/tier { tier: "PREMIUM" }
             │
     4. BetAnalytic met à jour le tier en DB
             │
     5. Prochaine requête user → accès aux 13 agents PREMIUM
     ```

     ---

     ## 14. Endpoint de santé (public, sans auth)

     ```
     GET /health
     ```

     ```json
     {
       "status": "ok",
       "uptime_seconds": 3600,
       "version": "1.0.0",
       "data_provider": {
         "status": "ok",
         "source": "espn/sports-skills",
         "events_today": 20
       },
       "redis": "ok",
       "agents": [...],
       "agents_count": 14
     }
     ```
