# Adaptations requises côté VPS (BetAnalytic FastAPI)

**Base URL :** `https://api.srv1066171.hstgr.cloud`
**Date :** 2026-04-21

---

## 1. Streaming SSE des agents (CRITIQUE - bloquant)

### Problème
Le frontend est entièrement bâti sur du streaming token-par-token via Server-Sent Events (SSE).
BetAnalytic expose uniquement des réponses complètes (non-streaming) sur :
- `POST /api/matches/{match_id}/analyze`
- `POST /api/matches/{match_id}/analyze-full`

### Solution requise
Ajouter un endpoint streaming pour chaque agent :

```
POST /api/matches/{match_id}/analyze/stream?home_team=...&away_team=...

Body : { "agent_type": "FORM", "question": "..." }

Réponse : text/event-stream (SSE)
data: {"type": "start"}
data: {"type": "token", "content": "Chelsea "}
data: {"type": "token", "content": "enchaîne "}
...
data: {"type": "done", "confidence": 0.82, "key_insights": [...], "data_completeness_pct": 75.0}
```

### Format SSE attendu par le frontend
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no   ← désactiver le buffering Nginx

data: {"type":"start"}\n\n
data: {"type":"token","content":"..."}\n\n
data: {"type":"done","confidence":0.82,"keyInsights":[...]}\n\n
```

> **Note temporaire :** En attendant cet endpoint, le frontend simule le streaming en emettant
> la réponse complète en un seul "token". L'UX est dégradée (pas de typing effect) mais fonctionnelle.

---

## 2. Agents manquants dans BetAnalytic (3 agents)

Le frontend dispose de 3 agents qui n'ont pas d'équivalent dans l'API BetAnalytic actuelle.
Ces agents sont désactivés côté frontend en attendant une implémentation VPS.

### 2.1 COMBO — Combinés optimisés (🧩)

```
POST /api/matches/combo

Body :
{
  "selections": [
    { "match_id": "espn_740928", "home_team": "...", "away_team": "...", "prediction": "1X2:2" },
    { "match_id": "espn_740929", "home_team": "...", "away_team": "...", "prediction": "BTTS:yes" }
  ],
  "target_odds_min": 2.5,
  "target_odds_max": 5.0,
  "risk_profile": "moderate"   // conservative | moderate | aggressive
}

Réponse :
{
  "success": true,
  "combo_odds": 4.41,
  "confidence": 0.67,
  "recommended": true,
  "stake_suggestion_pct": 2.5,
  "analysis": "Ce combiné présente une value positive de +12%...",
  "risks": ["Match 2 : arbitre laxiste, beaucoup de buts attendus"]
}
```

### 2.2 LIVE — Tracker temps réel (⚡)

```
GET /api/matches/{match_id}/live

Réponse en temps réel via WebSocket ou polling :
{
  "match_id": "espn_740928",
  "minute": 67,
  "score": "1-0",
  "events": [{ "type": "goal", "team": "home", "minute": 23, "player": "Welbeck" }],
  "live_analysis": "Brighton domine mais Chelsea égalise probable...",
  "bet_alerts": [
    { "market": "BTTS:yes", "trigger": "Chelsea pression intense", "urgency": "high" }
  ],
  "momentum_shift": "away"
}
```

### 2.3 NEWS — Actualités pré-match (📰)

```
GET /api/matches/{match_id}/news?home_team=...&away_team=...

Réponse :
{
  "articles": [
    {
      "title": "Salah de retour à l'entraînement",
      "source": "BBC Sport",
      "relevance": "high",
      "impact": "positive_home",
      "published_at": "2026-04-20T14:30:00Z"
    }
  ],
  "summary": "Liverpool retrouve Salah mais perd Nunez...",
  "impact_score": 0.7
}
```

> **Workaround actuel :** Ces 3 agents sont marqués `isEnabled: false` dans le frontend
> et n'apparaissent pas aux utilisateurs.

---

## 3. WebSocket — Clarification de l'architecture

### Contradiction dans la doc
La règle dit : *"le browser ne parle JAMAIS directement à BetAnalytic"*
Mais le WebSocket rooms nécessite une connexion directe :
```
WSS /api/rooms/{room_id}/ws?token=<api_key>
```
(impossible d'envoyer des headers HTTP custom via WebSocket browser natif)

### Option A — Exception documentée (recommandée, simple)
Documenter officiellement que le WS est la seule exception.
Le `?token=` en query param est acceptable car :
- Le token est l'api_key BetAnalytic (pas le JWT NextAuth)
- L'URL interne reste masquée via Nginx reverse proxy
- Rate limiting et auth gérés côté FastAPI

**Configuration Nginx à ajouter sur le VPS :**
```nginx
# Dans le bloc server existant
location /ws/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Internal-Secret "28b5305a...";  # injecté par Nginx
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```
Ainsi le browser se connecte à `wss://api.srv1066171.hstgr.cloud/ws/{room_id}?token=...`
et Nginx injecte `X-Internal-Secret` automatiquement → règle respectée.

### Option B — Proxy WebSocket Next.js (complexe)
Implémenter un relay WS dans Next.js via `ws` npm package.
Non recommandé : latence supplémentaire, complexité opérationnelle.

---

## 4. Synchronisation tier Stripe ↔ BetAnalytic

### Flux attendu (déjà documenté, rappel d'implémentation VPS)
Quand `POST /api/admin/users/{id}/tier` est appelé par le webhook Stripe :

1. BetAnalytic met à jour le tier en DB ✅ (déjà fonctionnel)
2. **Manquant :** Invalider le cache Redis des rate limits de l'utilisateur immédiatement
3. **Manquant :** Retourner dans la réponse la liste des agents débloqués

```json
// Réponse enrichie souhaitée
{
  "success": true,
  "user_id": "...",
  "new_tier": "PREMIUM",
  "agents_unlocked": ["STATS", "ODDS", "SENTIMENT", "PREDICT", "RISK"],
  "rate_limit_updated": true
}
```

---

## 5. Résultat des matchs — automatisation (pour le betting virtuel)

### Problème actuel
`POST /api/admin/matches/result` doit être appelé manuellement pour régler les paris.
Si ce n'est pas automatisé, les paris virtuels restent en suspens indéfiniment.

### Solution requise côté VPS
Ajouter un job cron FastAPI/Celery qui :
1. Détecte les matchs terminés via ESPN (status = `final`)
2. Extrait automatiquement score, résultat, BTTS, total_goals
3. Appelle en interne `settle_bets(match_id, result)` sans passer par l'endpoint admin HTTP
4. Identifie les agents qui avaient le bon pronostic (pour `correct_agent_types`)

```python
# Exemple de cron FastAPI (APScheduler ou Celery beat)
@scheduler.scheduled_job('interval', minutes=5)
async def auto_settle_finished_matches():
    finished = await espn_client.get_finished_matches()
    for match in finished:
        if not await is_already_settled(match.id):
            await settle_match(match)
```

---

## 6. Endpoint santé enrichi (optionnel mais utile)

Le frontend appelle `/health` pour la page de status système.
Ajouter dans la réponse le statut par agent :

```json
{
  "status": "ok",
  "agents": [
    { "type": "FORM", "status": "ok", "avg_latency_ms": 3800, "success_rate": 0.97 },
    { "type": "PREDICT", "status": "degraded", "avg_latency_ms": 12000, "success_rate": 0.81 }
  ]
}
```

---

## Résumé priorisé

| # | Changement | Priorité | Bloquant ? |
|---|-----------|---------|-----------|
| 1 | Endpoint streaming SSE `/analyze/stream` | 🔴 Critique | Oui (UX dégradée sans) |
| 2 | Agent COMBO | 🟡 Important | Non (désactivé) |
| 3 | Agent LIVE | 🟡 Important | Non (désactivé) |
| 4 | Agent NEWS | 🟡 Important | Non (désactivé) |
| 5 | Nginx WS proxy + injection X-Internal-Secret | 🟠 Moyen | Non (exception tolérée) |
| 6 | Auto-settlement des paris (cron) | 🟠 Moyen | Non (manuel possible) |
| 7 | Cache Redis invalidation sur tier upgrade | 🟢 Faible | Non |
| 8 | Santé enrichie par agent | 🟢 Faible | Non |

