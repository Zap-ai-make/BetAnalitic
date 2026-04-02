# STACK API RECOMMANDÉ - APPROCHE HYBRIDE
## Qualité optimale budget 29$/mois

**Philosophie**: Payer pour données CRITIQUES, gratuit pour complément

---

# 🎯 STACK RECOMMANDÉ: API-Football 29$/mois + Gratuits

## API-Football (Core Data) - 29$/mois ⭐⭐⭐

**Plan**: Pro (29$/mois ou 290$/an -17%)
**URL**: [API-Football.com/pricing](https://www.api-football.com/pricing)

### Inclus plan Pro 29$/mois:
- ✅ **1000 requêtes/jour** (30,000/mois)
- ✅ **TOUS endpoints** disponibles
- ✅ **1200+ leagues** worldwide
- ✅ **Livescore** temps-réel
- ✅ **Fixtures & Results** (calendrier + résultats)
- ✅ **Standings** (classements actualisés)
- ✅ **Teams & Players stats**
- ✅ **Lineups** (compositions détaillées)
- ✅ **Events** (buts, cartons, corners, subs)
- ✅ **Pre-match Odds** (multiples bookmakers)
- ✅ **Head-to-head** historiques
- ✅ **Injuries & Suspensions**
- ✅ **Predictions** (AI-powered, bonus)

### Pourquoi API-Football CORE?
```yaml
avantages_critiques:
  fiabilité:
    - "Données officielles, mises à jour temps-réel"
    - "99.9% uptime garanti"
    - "Support technique réactif"

  complétude:
    - "Toutes données nécessaires workflow en 1 API"
    - "Format JSON standardisé (facile parsing)"
    - "Rate limits généreux (1000/jour = 30-50 matchs/jour)"

  odds_inclus:
    - "Pre-match odds multiples bookmakers"
    - "CLV tracking possible (ouverture vs clôture)"
    - "Économie Agent #3 (pas besoin scraping bookmakers)"

  maintenance_zero:
    - "Pas de code scraping à maintenir"
    - "Pas de risque sites changent structure"
    - "Pas de rate limit surprises"

vs_gratuit:
  problèmes_scraping:
    - "FBref peut bloquer IP si trop requêtes"
    - "Sites changent structure → code casse"
    - "Pas de support si problème"
    - "Données parfois manquantes/incomplètes"

  temps_maintenance:
    - "Gratuit = ~2-3h/mois maintenance scraping"
    - "API = 0h maintenance"

  roi_temps:
    - "Si ton temps vaut 15€/h"
    - "2-3h économisées = 30-45€/mois"
    - "API 29€ = RENTABLE juste en temps gagné!"
```

### Utilisation par Agents
```yaml
agent_1_data_matchs:
  endpoint: "/fixtures"
  data: "Calendrier matchs J-1, résultats 10 derniers"
  requêtes_jour: "~50"

agent_2_stats_joueurs:
  endpoint: "/players"
  data: "Stats joueurs saison + derniers matchs"
  requêtes_jour: "~200 (22 joueurs x ~10 matchs)"

agent_3_cotes:
  endpoint: "/odds/pre-match"
  data: "Cotes ouverture + actuelles multiples bookmakers"
  requêtes_jour: "~30"

agent_injuries:
  endpoint: "/injuries"
  data: "Blessures + suspensions actualisées"
  requêtes_jour: "~20"

total_requêtes_jour: "~300/1000 (30% capacity)"
marge: "700 requêtes disponibles (confort)"
```

---

## Compléments GRATUITS (Qualité avancée)

### 1. FBref.com - xG & Métriques Avancées ⭐⭐⭐
**Usage**: Complément xG détaillé + métriques avancées

**Pourquoi ajouter si API-Football?**
```yaml
fbref_apporte:
  xg_granulaire:
    - "xG par joueur (API-Football basique)"
    - "xG Chain, xG Buildup (FBref uniquement)"
    - "Progressive passes, carries"
    - "Pressures, defensive actions détaillées"

  metriques_sharpes:
    - "Post-shot xG (qualité finition)"
    - "Goals prevented (gardiens)"
    - "PPDA (pressing intensity)"

usage_système:
  agent_2_enrichissement:
    - "API-Football: Stats de base joueurs"
    - "FBref: Tags avancés (classification 72 tags)"

  exemple:
    salah_api_football:
      - "8 buts, 4 assists, 42 tirs"

    salah_fbref:
      - "xG 6.8 (surperforme +18%)"
      - "Progressive carries: 4.2/90"
      - "Dribbles réussis: 3.8/90"
      - "→ TAG: finisseur_clinique + dribbleur_explosif"
```

**Accès**: Scraping léger (1-2 fois/semaine suffit)
```python
from soccerdata import FBref

# 1x/semaine, update stats joueurs avancées
fbref = FBref(leagues=["ENG-Premier League"])
advanced_stats = fbref.read_player_season_stats(stat_type="shooting")
```

**Fréquence**: 1-2 fois/semaine (pas quotidien)
**Coût**: Gratuit
**Maintenance**: Minimale (stats changent lentement)

---

### 2. Understat.com - xG Shot Maps ⭐⭐
**Usage**: Validation xG + shot quality

**Pourquoi?**
- Understat = référence xG communauté analytics
- Shot maps (visualiser qualité tirs)
- Validation croisée xG API-Football

**Accès**: Scraping occasionnel
```python
from soccerdata import Understat

# Update hebdomadaire
understat = Understat(leagues=["EPL"])
xg = understat.read_league_table()
```

**Fréquence**: 1x/semaine
**Coût**: Gratuit

---

### 3. StatsBomb Open Data - Back-testing ⭐
**Usage**: Validation modèles sur data historique

**Pourquoi?**
- Event-level data (3400+ events/match)
- Valider algorithme classification joueurs
- Tester probabilités sur matchs passés

**Accès**: GitHub repo
```python
from statsbombpy import sb

# Data historiques pour back-testing
matches = sb.matches(competition_id=43, season_id=106)
events = sb.events(match_id=123456)
```

**Fréquence**: Phase setup + validation périodique
**Coût**: Gratuit

---

### 4. Oddsportal - CLV Tracking ⭐⭐
**Usage**: Closing Line Value (validation skill)

**Pourquoi?**
- API-Football a odds **ouverture**
- Oddsportal a odds **clôture** (critiques pour CLV)
- CLV = metrique #1 validation sharp bettor

**Accès**: Scraping post-match
```python
from soccerdata import Oddsportal

# Post-match, récupérer cotes clôture
odds_closing = oddsportal.read_odds(match_date="2024-03-30")
```

**Fréquence**: Post-match (H+2h)
**Coût**: Gratuit

---

# 📊 COMPARAISON STACKS

## Option A: 100% Gratuit (scraping)
```yaml
sources:
  - FBref (stats joueurs)
  - Understat (xG)
  - football-data.org (calendrier)
  - Oddsportal (cotes)
  - Scraping bookmakers (cotes live)

avantages:
  - "0€/mois"

inconvénients:
  - "⚠️ Fiabilité variable (sites peuvent bloquer)"
  - "⚠️ Maintenance 2-3h/mois"
  - "⚠️ Données parfois manquantes"
  - "⚠️ Pas de support si problème"
  - "⚠️ Rate limits imprévisibles"

qualité_données: 7/10
fiabilité: 6/10
temps_maintenance: 3h/mois
```

## Option B: API-Football 29$ SEUL
```yaml
source:
  - API-Football Pro (tout-en-un)

avantages:
  - "✅ Fiabilité maximale"
  - "✅ Maintenance 0h"
  - "✅ Toutes données en 1 API"
  - "✅ Support officiel"

inconvénients:
  - "⚠️ Métriques avancées limitées (pas xG Chain, etc.)"
  - "⚠️ CLV tracking incomplet (pas odds clôture)"

qualité_données: 8/10
fiabilité: 10/10
temps_maintenance: 0h/mois
coût: 29€/mois
```

## ⭐ Option C: HYBRIDE (RECOMMANDÉ)
```yaml
sources_payantes:
  - "API-Football Pro 29$/mois (core data)"

sources_gratuites_complément:
  - "FBref 1x/semaine (métriques avancées)"
  - "Understat 1x/semaine (xG validation)"
  - "StatsBomb (back-testing)"
  - "Oddsportal post-match (CLV)"

avantages:
  - "✅ Fiabilité API-Football (core)"
  - "✅ Métriques avancées (FBref)"
  - "✅ CLV tracking (Oddsportal)"
  - "✅ Maintenance minimale (scraping léger)"
  - "✅ Best of both worlds"

inconvénients:
  - "Coût 29€/mois (MAIS ROI attendu 100-300€)"

qualité_données: 10/10 ⭐⭐⭐
fiabilité: 9/10
temps_maintenance: 1h/mois (scraping léger)
coût: 29€/mois

roi_si_systeme_marche:
  roi_conservateur: "100€/mois (3-4 paris gagnants)"
  api_cost: "29€/mois"
  profit_net: "71€/mois"
  rentabilité: "✅ 245% ROI sur API"
```

---

# 🎯 STACK FINAL RECOMMANDÉ

## Architecture Data

```yaml
# ============================================================================
# CORE: API-Football Pro 29$/mois
# ============================================================================
api_football_endpoints:

  agent_1_matchs:
    - "/fixtures?date={J-1}" (calendrier)
    - "/fixtures?team={id}&last=10" (historique 10 matchs)
    - "/fixtures/headtohead" (H2H)
    - "/standings" (classements)

  agent_2_joueurs:
    - "/players?team={id}&season=2024" (stats saison)
    - "/players/topscorers" (buteurs)
    - "/injuries" (blessures actuelles)

  agent_3_cotes:
    - "/odds?fixture={id}" (cotes pre-match)
    - "/odds/bookmakers" (multiples bookmakers)

  agent_meteo:
    - Météo via API externe (OpenWeather gratuit)

  agent_arbitre:
    - "/fixtures?referee={name}" (historique arbitre)

# ============================================================================
# COMPLÉMENT: Sources gratuites (scraping léger)
# ============================================================================

fbref_scraping:
  fréquence: "1x/semaine (dimanche soir)"
  agent: "Agent #2 enrichissement"
  données:
    - "xG Chain, xG Buildup"
    - "Progressive passes/carries"
    - "Pressures, defensive actions"
    - "Post-shot xG"
  usage: "Classification 72 tags avancée"

understat_scraping:
  fréquence: "1x/semaine"
  agent: "Agent #4 validation"
  données:
    - "xG par match détaillé"
    - "Shot maps"
  usage: "Validation croisée xG API-Football"

oddsportal_scraping:
  fréquence: "Post-match (H+2h)"
  agent: "Agent #7 CLV Tracker"
  données:
    - "Cotes clôture (closing lines)"
  usage: "Calcul CLV (métrique skill)"

statsbomb_github:
  fréquence: "Phase setup + mensuel"
  agent: "Module back-testing"
  données:
    - "Event data historique"
  usage: "Validation modèles, calibration"
```

---

# 💰 BUDGET & ROI

## Coûts mensuels
```yaml
api_football_pro: 29€/mois

alternatives_zero_coût:
  - "Scraping FBref: 0€"
  - "Scraping Understat: 0€"
  - "Scraping Oddsportal: 0€"
  - "StatsBomb Open Data: 0€"

total_mensuel: 29€/mois
```

## ROI Attendu (conservateur)
```yaml
hypothèses_conservatrices:
  paris_mois: 40 (10/semaine)
  winrate: 25% (combinés 3 legs)
  mise_moyenne: 20€
  cote_moyenne: 5.5

calcul:
  mises_totales: "40 * 20€ = 800€"
  paris_gagnants: "40 * 25% = 10"
  gains: "10 * 20€ * 5.5 = 1100€"
  profit_brut: "1100€ - 800€ = 300€"

coûts:
  api: "29€"

profit_net: "271€/mois"
roi_sur_api: "935% ⭐⭐⭐"
roi_sur_bankroll: "27% (si bankroll 1000€)"
```

## Break-even
```yaml
pour_rentabiliser_api_29:
  besoin: "1 seul combiné gagnant/mois"

  exemple:
    combiné: "3 legs @ 5.0"
    mise: 20€
    gain: 100€
    profit: 80€

    vs_api_cost: "80€ > 29€ ✅"

conclusion: "Rentabilité FACILE si système fonctionne"
```

---

# 🚀 PLAN DE DÉPLOIEMENT

## Semaine 1: Setup API-Football
```bash
# Jour 1: Inscription
1. S'inscrire API-Football.com
2. Choisir plan Pro 29$/mois
3. Récupérer API key

# Jour 2-3: Intégration Agent #1
4. Code Python requêtes /fixtures
5. Test calendrier 10 matchs
6. Validation données complètes

# Jour 4-5: Intégration Agent #2
7. Code requêtes /players
8. Test stats 22 joueurs
9. Validation format JSON

# Weekend: Intégration Agent #3
10. Code requêtes /odds
11. Test cotes multiples bookmakers
12. Validation données odds
```

## Semaine 2: Ajout Compléments Gratuits
```bash
# Scraping FBref (hebdomadaire)
1. Setup soccerdata library
2. Test scraping stats avancées
3. Intégration classification tags

# Scraping Understat (validation)
4. Setup scraper xG
5. Comparaison xG API vs Understat
6. Validation cohérence

# Scraping Oddsportal (CLV)
7. Setup scraper odds clôture
8. Test calcul CLV post-match
9. Intégration Agent #7
```

## Semaine 3-4: Validation Système
```bash
# Back-testing
1. Collecte 50 matchs données
2. Run pipeline complet
3. Mesure précision vs résultats réels
4. Ajustements si nécessaire

# Go-live
5. 1ère semaine paris réels (small stakes)
6. Monitoring quotidien
7. Validation ROI positif
```

---

# ✅ DÉCISION FINALE

## STACK RECOMMANDÉ

```yaml
core_payant:
  api: "API-Football Pro"
  coût: "29€/mois"
  usage: "Agents #1, #2, #3 (données core)"

compléments_gratuits:
  fbref: "Métriques avancées (1x/semaine)"
  understat: "Validation xG (1x/semaine)"
  oddsportal: "CLV tracking (post-match)"
  statsbomb: "Back-testing (mensuel)"

total_coût: "29€/mois"
qualité: "10/10 (données pro)"
fiabilité: "9/10 (API stable + scraping léger)"
maintenance: "1h/mois (minimal)"

vs_100pct_gratuit:
  qualité: "+3 points (10 vs 7)"
  fiabilité: "+3 points (9 vs 6)"
  temps_économisé: "2h/mois"
  valeur_temps: "30€ (si 15€/h)"
  coût_net_réel: "-1€ (29€ - 30€ temps)"

conclusion: "API-Football 29€ = NO-BRAINER ✅"
```

**Mon avis**: Pour 29€/mois, tu as données **PROFESSIONNELLES** + tu économises **2-3h maintenance/mois**. Si ton système génère même 100€/mois profit, c'est **rentable x3**. 🚀

**Tu veux partir sur ce stack hybride?**
