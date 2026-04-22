# Adaptations requises côté VPS (BetAnalytic FastAPI)

**Base URL :** `https://api.srv1066171.hstgr.cloud`

---

## 1. Clé Anthropic invalide — URGENT quand on branche le cerveau

Tous les agents retournent `401 invalid x-api-key`.
Mettre à jour `ANTHROPIC_API_KEY` dans le `.env` du serveur FastAPI avec une clé valide.

---

## 2. Streaming SSE des agents — à faire avec le cerveau

Ajouter un endpoint streaming pour que l'analyse s'affiche token par token :

```
POST /api/matches/{match_id}/analyze/stream

Body : { "agent_type": "FORM" }

Réponse : text/event-stream
data: {"type":"start"}
data: {"type":"token","content":"Chelsea "}
data: {"type":"token","content":"enchaîne "}
data: {"type":"done","confidence":0.82,"key_insights":[...]}
```

Headers Nginx obligatoires sur cet endpoint :
```
X-Accel-Buffering: no
```

> Sans cet endpoint, le frontend affiche la réponse en un seul bloc (fonctionnel mais sans effet de frappe).

---

## 3. Nginx — Proxy WebSocket pour les rooms

Le browser doit se connecter en WebSocket aux rooms. Nginx doit relayer et injecter le header `X-Internal-Secret` automatiquement.

Ajouter dans la config Nginx :

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Internal-Secret "28b5305a85132aa07572168ebccbcfd12399c290285dc8e52d8c0394fb22767d";
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

Le browser se connecte à `wss://api.srv1066171.hstgr.cloud/ws/{room_id}?token=<api_key>`.

---

## 4. Cron auto-settlement des paris virtuels

Sans ce cron, les paris restent en statut `pending` indéfiniment.

Ajouter un job toutes les 5 minutes qui :
1. Récupère les matchs terminés (ESPN status = `final`)
2. Extrait le score final
3. Règle automatiquement les paris correspondants

```python
@scheduler.scheduled_job('interval', minutes=5)
async def auto_settle_finished_matches():
    finished = await espn_client.get_finished_matches()
    for match in finished:
        if not await is_already_settled(match.id):
            await settle_match(match)
```

---

## 5. Agents manquants (désactivés côté frontend — non bloquant)

Ces 3 agents sont dans le frontend mais désactivés en attendant l'implémentation VPS.

| Agent | Endpoint à créer |
|-------|-----------------|
| COMBO | `POST /api/matches/combo` |
| LIVE  | `GET /api/matches/{id}/live` |
| NEWS  | `GET /api/matches/{id}/news` |

---

## Priorités

| # | Tâche | Quand |
|---|-------|-------|
| 1 | Clé Anthropic | Quand on branche le cerveau |
| 2 | SSE streaming | Avec le cerveau |
| 3 | Nginx WebSocket | Maintenant (rooms temps réel) |
| 4 | Cron auto-settlement | Maintenant (paris virtuels) |
| 5 | Agents COMBO/LIVE/NEWS | Après lancement |
