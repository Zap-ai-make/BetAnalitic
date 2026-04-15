# STRATÉGIE COMBINÉS (ACCUMULATORS) - OPTIMISATION SYSTÈME
## Adaptation complète pour paris combinés
**Date**: 2026-03-30

---

# 🎯 CONTEXTE CRITIQUE

## Notre stratégie = COMBINÉS (pas paris simples!)

**Définition** ([Wikipedia](https://en.wikipedia.org/wiki/Parlay)):
> "Parlay/accumulator = pari unique liant 2+ paris individuels. Gagner le combiné dépend de TOUS ces paris gagnant ensemble. Si UN pari perd, TOUT le combiné perd."

**Implication MAJEURE**:
- ❌ Tout ce qu'on a créé assume **paris SIMPLES**
- ❌ Kelly Criterion, sizing, edges = mal adaptés pour combinés
- ❌ Variance **exponentiellement plus élevée**

**CE QUI CHANGE TOUT**:
```yaml
paris_simples:
  3_paris_separés:
    - "Liverpool @ 1.28 → 50€"
    - "Over corners @ 1.95 → 50€"
    - "Over cartons @ 1.88 → 50€"
  total_mise: 150€
  si_2/3_gagnent: "Profit partiel"

combiné:
  3_paris_combinés:
    cote_combinee: "1.28 * 1.95 * 1.88 = 4.69"
    mise: 50€
    gain_potentiel: 234.5€
    profit_potentiel: 184.5€

  si_2/3_gagnent: "❌ PERTE TOTALE 50€"
  si_3/3_gagnent: "✅ GAIN 184.5€ (vs 91.5€ paris simples)"
```

---

# ⚠️ RÉALITÉS MATHÉMATIQUES DES COMBINÉS

## 1. House Edge se MULTIPLIE

**Recherche** ([Trademate Sports](https://www.tradematesports.com/en/blog/staking-accumulators-parlays-multiples-neutral-hedge-gambit)):
> **"Normalement accumulators = terrible idée, car house edge sur chaque pari s'additionne en avantage bookmaker plus grand"**

**Exemple concret**:
```yaml
paris_simples:
  house_edge_par_pari: "4-5%"
  3_paris: "~4.5% edge chacun"

combiné_3_legs:
  house_edge_composé: "20-30%+"
  bookmaker_adore: "✅✅✅"
```

## 2. Probabilité de victoire EFFONDRE

**Données 2024** ([BettorEdge](https://www.bettoredge.com/post/parlay-betting-strategy-tips-and-tricks-to-win-and-maximize-payouts)):
- **2-3 legs**: 25-30% winrate
- **5+ legs**: <5% winrate

**Calcul simple**:
```yaml
3_paris_indépendants:
  proba_chaque: 60%
  proba_combiné: "0.60 * 0.60 * 0.60 = 21.6%"

vs

3_paris_simples:
  proba_au_moins_1_gagne: "~95%"
  proba_2/3_gagnent: "~65%"
```

## 3. MAIS: Si Value sur chaque leg → Combiné multiplié ⭐

**Clé du succès** ([Trademate Sports](https://www.tradematesports.com/en/blog/staking-accumulators-parlays-multiples-neutral-hedge-gambit)):
> **"Quand plusieurs trades avec edge décent, on peut combiner 2+ en accumulator avec edge ENCORE PLUS GRAND que chaque trade individuel"**

**Exemple**:
```yaml
leg_1_value:
  notre_proba: 65%
  cote: 1.50
  edge: "+8.3%"

leg_2_value:
  notre_proba: 58%
  cote: 1.80
  edge: "+4.4%"

leg_3_value:
  notre_proba: 62%
  cote: 1.70
  edge: "+5.5%"

combiné_3_legs:
  cote_combinée: "1.50 * 1.80 * 1.70 = 4.59"
  notre_proba_combinée: "0.65 * 0.58 * 0.62 = 23.4%"
  proba_implicite: "1 / 4.59 = 21.8%"

  edge_combiné: "(23.4 - 21.8) / 21.8 = +7.3%"

  conclusion: |
    Edges s'additionnent MAIS probabilité effondre.
    Résultat: Edge correct MAIS variance ÉNORME.
```

---

# 📊 STRATÉGIES COMBINÉS - RECHERCHES

## Stratégie 1: LIMITER NOMBRE LEGS ⭐⭐⭐

### Recherche consensus
**Optimal** ([Covers NFL](https://www.covers.com/nfl/parlay-betting-tips)):
> **"Limiter parlays à 2-4 legs balance payout potentiel avec probabilité victoire raisonnable"**

**Données 2024**:
- **2-3 legs**: 25-30% winrate ✅
- **4 legs**: ~15-18% winrate
- **5+ legs**: <5% winrate ❌

### Application notre système
```yaml
recommendation_stricte:
  legs_minimum: 2 (sinon pas combiné)
  legs_maximum: 4 (JAMAIS 5+)
  sweet_spot: 3 legs

  justification:
    - "Winrate 25-30% = acceptable"
    - "Cotes combinées attractives (x4-x8)"
    - "Variance gérable long-terme"
```

## Stratégie 2: SÉLECTION VALUE STRICTE ⭐⭐⭐

### Principe clé
**Recherche** ([Caanberry](https://caanberry.com/football-accumulator-betting-strategy/)):
> **"Picking off bookmakers quand ils offrent meilleures cotes et les mettre en accumulators = stratégie simple mais TRÈS efficace"**

### Seuils edge AUGMENTÉS pour combinés
```yaml
paris_simples:
  edge_minimum_confiance_elite: 3.0%
  edge_minimum_confiance_haute: 5.0%

combinés:
  edge_minimum_PAR_LEG_confiance_elite: 5.0%
  edge_minimum_PAR_LEG_confiance_haute: 8.0%

  justification:
    - "House edge se multiplie"
    - "Variance énorme = besoin buffer"
    - "Chaque leg DOIT avoir value RÉELLE"
```

### Règle d'or
**CHAQUE leg du combiné DOIT**:
1. ✅ Avoir edge >5% (confiance elite) ou >8% (confiance haute)
2. ✅ Passer TOUS les filtres confiance (Agent #6)
3. ✅ Être indépendant des autres legs (pas corrélé)

## Stratégie 3: ÉVITER CORRÉLATION ⭐⭐⭐

### Qu'est-ce que corrélation?
**Définition** ([Boyds Bets](https://www.boydsbets.com/correlated-parlays/)):
> **"Correlated legs = parier sur 2 événements liés où si un leg gagne, l'autre leg est PLUS susceptible gagner aussi"**

### Exemples corrélations INTERDITES
```yaml
exemple_1_meme_match:
  leg_1: "Liverpool victoire"
  leg_2: "Liverpool -1.5"
  probleme: "Si Liverpool gagne, plus probable qu'ils gagnent large"
  statut: "❌ CORRÉLÉ - Bookmaker refuse OU odds ajustées"

exemple_2_meme_match_total:
  leg_1: "OVER 2.5 buts"
  leg_2: "Liverpool marque"
  probleme: "Si over 2.5, Liverpool a probablement marqué"
  statut: "❌ CORRÉLÉ"

exemple_3_meme_equipe_journee:
  leg_1: "Liverpool gagne samedi"
  leg_2: "Liverpool gagne mercredi suivant"
  probleme: "Momentum, confiance liés"
  statut: "⚠️ LÉGÈREMENT CORRÉLÉ (acceptable si >5 jours écart)"
```

### Exemples combinés CORRECTS
```yaml
exemple_1_matches_independants:
  leg_1: "Liverpool vs Everton - OVER 9.5 corners total"
  leg_2: "Man City vs Burnley - City victoire"
  leg_3: "Arsenal vs Chelsea - OVER 4.5 cartons"
  statut: "✅ INDÉPENDANT - 3 matchs différents"

exemple_2_meme_match_marches_independants:
  leg_1: "Liverpool vs Everton - OVER 9.5 corners total"
  leg_2: "Liverpool vs Everton - OVER 4.5 cartons"
  analyse: |
    Corners et cartons sont-ils corrélés?
    - Corners = jeu ouvert, attaques
    - Cartons = intensité, fautes
    - Corrélation FAIBLE
  statut: "✅ ACCEPTABLE (corrélation <0.2)"

exemple_3_cross_sport:
  leg_1: "Liverpool vs Everton - Corners"
  leg_2: "Lakers vs Warriors - NBA total points"
  leg_3: "Nadal vs Djokovic - Tennis over games"
  statut: "✅ PARFAITEMENT INDÉPENDANT"
```

### Règle application
```yaml
detecteur_correlation_agent_6:

  meme_match:
    resultat_total_buts: "❌ INTERDIT"
    resultat_btts: "❌ INTERDIT"
    resultat_handicap: "❌ INTERDIT"
    corners_cartons: "✅ OK (corrélation faible)"
    corners_resultat: "⚠️ VÉRIFIER (si domination attendue = corrélé)"

  meme_equipe_journee:
    ecart_moins_5_jours: "⚠️ CORRÉLATION POSSIBLE"
    ecart_plus_5_jours: "✅ OK"

  marches_complementaires:
    analyse_cas_par_cas: true
    seuil_correlation: "<0.2 (acceptable)"
```

## Stratégie 4: SMALL ODDS (FAVORIS) ⭐⭐

### Approche Low Odds Accumulator
**Principe** ([Bookmakers Bet](https://www.bookmakers.bet/18762/low-odds-parlay-betting/)):
> **"Pour créer low odds parlay, rechercher matchs entre favori et outsider, cotes ~1.10-1.40"**

### Avantages
```yaml
avantages:
  - "Probabilité victoire CHAQUE leg élevée (70-80%)"
  - "Winrate combiné acceptable (3 legs @ 75% = 42%)"
  - "Variance réduite vs combinés cotes élevées"

inconvenients:
  - "Cotes finales modérées (x2-x3 sur 3 legs)"
  - "Edge par leg DOIT être solide (sinon piège)"
  - "Bookmakers adorent (margin élevée favoris)"
```

### Application
```yaml
combiné_favoris_solides:
  criteres_selection:
    - "Cote 1.20-1.50 (probabilité réelle 70-80%)"
    - "Edge minimum 5% PAR leg"
    - "Enjeu élevé (favoris concentration max)"
    - "Domicile (avantage validé)"

  exemple:
    leg_1:
      match: "Man City vs Luton (domicile)"
      marché: "City victoire"
      cote: 1.25
      notre_proba: 85%
      edge: "+6.25%"

    leg_2:
      match: "Liverpool vs Sheffield (domicile)"
      marché: "Liverpool -1"
      cote: 1.40
      notre_proba: 78%
      edge: "+8.4%"

    leg_3:
      match: "Arsenal vs Burnley (domicile)"
      marché: "Arsenal victoire"
      cote: 1.30
      notre_proba: 82%
      edge: "+6.5%"

    combiné:
      cote_totale: "1.25 * 1.40 * 1.30 = 2.28"
      proba_combinée: "0.85 * 0.78 * 0.82 = 54.4%"
      proba_implicite: "1 / 2.28 = 43.9%"
      edge_combiné: "+23.9%" ⭐⭐⭐

      expected_value:
        mise: 100€
        ev: "54.4% * 228€ - 45.6% * 100€ = +78.4€"
        roi: "+78.4%"

  decision: "✅ EXCELLENT COMBINÉ"
```

### Pièges à éviter
**Recherche** ([BettorEdge](https://www.bettoredge.com/post/parlay-betting-strategy-tips-and-tricks-to-win-and-maximize-payouts)):
> **"Ne construisez PAS parlays sur cotes extrêmement basses comme Bayern/PSG, car gagner boostera seulement confiance, pas bankroll"**

```yaml
pieges:
  cotes_trop_basses:
    exemple: "Bayern @ 1.10 vs équipe Bundesliga 2"
    probleme:
      - "Edge minimal (1-2%)"
      - "Si 3 legs @ 1.10 = cote 1.33 combinée"
      - "Variance non compensée par return"
    regle: "❌ Éviter cotes <1.20"

  favoris_sans_edge:
    exemple: "Public bet massivement sur favori"
    cote: "1.30 (juste)"
    notre_analyse: "Proba réelle 75% (pas 77%)"
    edge: "-2.6% (NÉGATIF)"
    decision: "❌ NE PAS INCLURE (même si favori)"
```

## Stratégie 5: ACCUMULATOR INSURANCE ⭐

### Principe
**Définition** ([Champsbase](https://champsbase.com/en/sports-betting/guide/bet-types/multi-bet/)):
> **"Acca Insurance = safety net sur accumulator: si 1 leg perd, remboursement (freebet/bonus) jusqu'à montant défini"**

### Bookmakers offrant
- **Bet365**: "Acca Insurance" (1 leg perd = remboursement)
- **Unibet**: "Acca Boost + Insurance"
- **Betclic**: Offres promotionnelles ponctuelles

### Impact variance
```yaml
sans_insurance:
  3_legs: "Si 1 perd = perte 100%"
  variance: "Énorme"

avec_insurance:
  3_legs: "Si 1 perd = remboursement freebet"
  variance: "Réduite ~30%"

  expected_value:
    sans_insurance:
      winrate: 25%
      ev: "25% * 400€ - 75% * 100€ = +25€"

    avec_insurance:
      winrate_total_loss: "Seulement si 2+ legs perdent"
      proba_2_plus_perdent: "~15% (au lieu 75%)"
      ev: "25% * 400€ + 60% * 0€ - 15% * 100€ = +85€"

  impact: "+240% EV avec insurance ⭐⭐⭐"
```

### Application
```yaml
strategie_insurance:
  toujours_utiliser: "Si disponible (Bet365, Unibet)"

  optimisation:
    - "Placer combinés sur bookmakers avec insurance"
    - "4 legs optimal (insurance compense 1 échec)"
    - "Sélectionner 4 legs edge 5%+ (au lieu 3)"

  exemple:
    bookmaker: "Bet365 Acca Insurance"
    legs: 4
    cote_combinée: 5.20
    mise: 100€
    scenarios:
      4/4_gagnent: "+420€ (25% probabilité)"
      3/4_gagnent: "Remboursement 100€ freebet (45%)"
      2/4_perdent: "-100€ (30%)"

    ev: "25% * 420€ + 45% * 0€ - 30% * 100€ = +75€"
    vs_sans_insurance: "+25€"
    gain: "+200% avec insurance"
```

## Stratégie 6: SYSTÈME BETS (ALTERNATIVES) ⭐

### Qu'est-ce qu'un System Bet?
**Principe** ([Sports Gambler](https://www.sportsgambler.com/betting-school/accumulator-bets/)):
> **"System bet = multiple smaller combinations (doubles, trebles), donc 1 losing pick ne ruine pas TOUT le pari"**

### Types
```yaml
trixie:
  legs: 3
  paris_generes:
    - "3 doubles (A+B, A+C, B+C)"
    - "1 treble (A+B+C)"
  total_paris: 4
  mise_totale: "4x mise unitaire"

  avantage: "Si 2/3 gagnent, profit partiel"

patent:
  legs: 3
  paris_generes:
    - "3 singles"
    - "3 doubles"
    - "1 treble"
  total_paris: 7
  avantage: "Même 1/3 gagne = petit profit"

yankee:
  legs: 4
  paris_generes:
    - "6 doubles"
    - "4 trebles"
    - "1 four-fold"
  total_paris: 11

lucky_15:
  legs: 4
  paris_generes:
    - "4 singles"
    - "6 doubles"
    - "4 trebles"
    - "1 four-fold"
  total_paris: 15
```

### Comparaison variance
```yaml
accumulator_classique:
  3_legs: "Tout ou rien"
  scenarios:
    3/3: "+profit"
    2/3: "-100%"
    1/3: "-100%"
    0/3: "-100%"

trixie:
  3_legs: "Multiples combinaisons"
  scenarios:
    3/3: "++profit (tous paris gagnent)"
    2/3: "+petit profit (1 double gagne)"
    1/3: "-100%"

  variance: "RÉDUITE ~50%"
```

### Application
```yaml
quand_utiliser_system:
  si_confiance_variable:
    - "1 leg confiance 90%"
    - "2 legs confiance 70%"
    action: "Trixie (au lieu accumulator pur)"

  si_variance_reduction:
    objectif: "Croissance stable long-terme"
    strategie: "Lucky 15 ou Patent"
    tradeoff: "Mise totale plus élevée"

  si_maximiser_profit:
    objectif: "Gros gains, accepter variance"
    strategie: "Accumulator pur 3-4 legs"
```

---

# 🎯 ADAPTATION SYSTÈME POUR COMBINÉS

## Modifications CRITIQUES

### 1. Agent #6 - Détection Value COMBINÉS

```yaml
agent_6_mode_combiné:

  sélection_legs_potentiels:
    criteres_strictes:
      - "Edge ≥5% (confiance elite)"
      - "Edge ≥8% (confiance haute)"
      - "Passe TOUS filtres confiance"
      - "Marché liquide (corners, cartons, résultat, totaux)"

    pool_quotidien:
      objectif: "Identifier 5-10 legs potentiels value"
      exemple_journée:
        - "Liverpool corners under 5.5 (edge 15%)"
        - "Man City victoire (edge 8%)"
        - "PSG over cartons (edge 48%)"
        - "Arsenal -1 (edge 7%)"
        - "Tottenham BTTS no (edge 10%)"

  construction_combinés:
    methode_1_manual:
      - "Sélectionner 3-4 legs parmi pool"
      - "Vérifier indépendance (pas corrélés)"
      - "Calculer edge combiné"

    methode_2_automatique:
      algorithme: |
        FOR each combination de 3 legs dans pool:
          IF tous legs edge ≥5%:
            IF corrélation <0.2:
              calculer_edge_combiné()
              IF edge_combiné ≥15%:
                PROPOSER combiné

      output: "3-5 combinés proposés, triés par edge décroissant"

  calcul_edge_combiné:
    formule: |
      proba_combinée = proba_leg1 * proba_leg2 * proba_leg3
      cote_combinée = cote_leg1 * cote_leg2 * cote_leg3
      proba_implicite = 1 / cote_combinée
      edge_combiné = (proba_combinée - proba_implicite) / proba_implicite

    seuil_minimum: "15% (combiné doit compenser variance)"

  exemple_output:
    combiné_1:
      legs:
        - "Liverpool corners under 5.5 @ 2.15 (edge 15%)"
        - "PSG cartons over 4.5 @ 1.88 (edge 48%)"
        - "Arsenal -1 @ 1.70 (edge 7%)"
      cote_combinée: 6.87
      proba_combinée: 0.39 * 0.79 * 0.62 = 19.1%
      proba_implicite: 14.6%
      edge_combiné: "+30.8%" ⭐⭐⭐
      correlation_check: "✅ Indépendants"
      decision: "✅ PROPOSER"

    combiné_2:
      legs:
        - "Man City victoire @ 1.28 (edge 8%)"
        - "Liverpool victoire @ 1.30 (edge 5%)"
        - "Arsenal victoire @ 1.25 (edge 6%)"
      cote_combinée: 2.08
      proba_combinée: 0.82 * 0.77 * 0.82 = 51.8%
      proba_implicite: 48.1%
      edge_combiné: "+7.7%"
      decision: "⚠️ Edge insuffisant (<15%), skip"
```

### 2. Kelly Criterion ADAPTÉ Combinés

**Problème**: Kelly classique assume paris simples répétés.

**Solution**: Kelly Fractional TRÈS conservateur
```yaml
kelly_combinés:

  kelly_classique:
    formule: "f = (p * odds - 1) / (odds - 1)"
    probleme: "Trop agressif pour combinés (variance énorme)"

  kelly_adapté_combinés:
    formule: "f_combiné = kelly_full / 6"
    justification:
      - "Variance combinés ~3x paris simples"
      - "1/3 Kelly déjà conservateur"
      - "1/6 Kelly = ultra-conservateur, gérable"

  exemple:
    combiné_edge_30pct:
      cote: 6.87
      proba: 19.1%
      kelly_full: "(0.191 * 6.87 - 1) / (6.87 - 1) = 13.6%"
      kelly_third: "13.6% / 3 = 4.5%"
      kelly_sixth: "13.6% / 6 = 2.27%"

      recommandation: "2.27% bankroll"
      avec_plafond_5pct: "2.27% ✅ (sous plafond)"

  plafonds_absolus:
    max_par_combiné: "3% bankroll (JAMAIS plus)"
    justification: "Variance énorme, protection ruine"

    max_exposition_combinés: "10% bankroll total"
    justification: "Plusieurs combinés même journée"
```

### 3. Diversification Combinés
```yaml
strategie_diversification:

  ne_pas_mettre_tous_oeufs_meme_panier:
    probleme: "1 seul gros combiné = variance maximale"
    solution: "Plusieurs petits combinés"

  exemple_mauvais:
    combiné_unique:
      legs: 4
      cote: 10.0
      mise: "3% bankroll (300€ sur 10k)"
      variance: "ÉNORME"

  exemple_bon:
    combiné_1:
      legs: 3
      cote: 6.0
      mise: "1.5% (150€)"

    combiné_2:
      legs: 3
      cote: 5.5
      mise: "1.5% (150€)"

    total_exposition: "3%"
    variance: "RÉDUITE (diversifié)"

  regle:
    max_mise_combiné_unique: "2% bankroll"
    preferer: "2-3 combinés petits qu'1 gros"
```

---

# 📈 STRATÉGIE COMPLÈTE RECOMMANDÉE

## Workflow Quotidien ADAPTÉ

```yaml
09h00_09h30_collecte:
  agents: "#1, #2, #3"
  inchangé: "Collecte data matchs, joueurs, cotes"

09h30_09h50_analyse:
  agents: "#4, #5"
  inchangé: "Calcul probabilités, meilleures cotes"

09h50_10h15_selection_combinés:
  agent: "#6 MODE COMBINÉS"

  étape_1_pool_legs:
    action: "Identifier 5-10 legs value (edge ≥5%)"
    output: "Pool legs potentiels"

  étape_2_construction_combinés:
    methode: "Tester toutes combinaisons 3 legs"
    filtre_1: "Corrélation <0.2"
    filtre_2: "Edge combiné ≥15%"
    output: "3-5 combinés proposés"

  étape_3_sélection_finale:
    criteres:
      - "Choisir 2-3 meilleurs combinés (edge + confiance)"
      - "Vérifier exposition totale <10%"
      - "Privilégier combinés avec insurance si dispo"

  étape_4_placement:
    bookmaker_prioritaire: "Bet365 (acca insurance)"
    sizing: "1-2% par combiné (Kelly 1/6)"
    validation: "Agent #14"
```

## Exemple Journée Complète

```yaml
date: "2026-04-05"
matchs_analysés: 8

pool_legs_identifés:
  leg_1:
    match: "Liverpool vs Everton"
    marché: "Under 5.5 corners Liverpool"
    cote: 2.15
    proba: 39%
    edge: 15.5%
    confiance: 9.1

  leg_2:
    match: "PSG vs Marseille"
    marché: "Over 4.5 cartons"
    cote: 1.88
    proba: 79%
    edge: 48.5%
    confiance: 8.7

  leg_3:
    match: "Man City vs Burnley"
    marché: "City -1.5"
    cote: 1.65
    proba: 68%
    edge: 12.1%
    confiance: 8.8

  leg_4:
    match: "Arsenal vs Chelsea"
    marché: "BTTS NO"
    cote: 1.67
    proba: 66%
    edge: 10.2%
    confiance: 8.2

  leg_5:
    match: "Bayern vs Dortmund"
    marché: "Over 2.5 buts"
    cote: 1.75
    proba: 64%
    edge: 11.5%
    confiance: 8.5

combinés_construits:
  combiné_A:
    legs: [leg_1, leg_2, leg_3]
    cote: "2.15 * 1.88 * 1.65 = 6.67"
    proba: "39% * 79% * 68% = 20.9%"
    edge: "+39.6%" ⭐⭐⭐
    correlation: "✅ Indépendants"
    confiance_moyenne: 8.87
    priorité: 1

  combiné_B:
    legs: [leg_2, leg_4, leg_5]
    cote: "1.88 * 1.67 * 1.75 = 5.50"
    proba: "79% * 66% * 64% = 33.4%"
    edge: "+83.4%" ⭐⭐⭐
    correlation: "✅ Indépendants"
    confiance_moyenne: 8.47
    priorité: 2

  combiné_C:
    legs: [leg_1, leg_4, leg_5]
    cote: "2.15 * 1.67 * 1.75 = 6.28"
    proba: "39% * 66% * 64% = 16.5%"
    edge: "+3.5%"
    correlation: "✅ Indépendants"
    decision: "❌ Edge <15%, skip"

décision_finale:
  combiné_A_placé:
    bookmaker: "Bet365 (acca insurance)"
    mise: 20€ (2% bankroll 1000€)
    gain_potentiel: 133.4€
    profit_potentiel: 113.4€

  combiné_B_placé:
    bookmaker: "Bet365 (acca insurance)"
    mise: 15€ (1.5% bankroll)
    gain_potentiel: 82.5€
    profit_potentiel: 67.5€

  exposition_totale: 3.5% (35€)

résultats_jour_match:
  combiné_A:
    leg_1: "❌ Liverpool 7 corners (over 5.5)"
    leg_2: "✅ PSG 7 cartons"
    leg_3: "✅ City gagne 3-0"
    statut: "❌ PERDU"
    insurance: "✅ 20€ freebet remboursé"

  combiné_B:
    leg_2: "✅ PSG 7 cartons"
    leg_4: "✅ Arsenal 2-0 (BTTS NO)"
    leg_5: "✅ Bayern-Dortmund 3-2 (over)"
    statut: "✅ GAGNÉ"
    gain: 82.5€
    profit: +67.5€

  bilan_journée:
    mise_totale: 35€
    gains: 82.5€
    remboursement: 20€ (freebet)
    profit_net: +67.5€
    roi: +192.8%
```

---

# ⚠️ RED FLAGS SPÉCIFIQUES COMBINÉS

```yaml
red_flag_1_chase_losses:
  symptome: "Après pertes, augmenter sizing combinés"
  danger: "Variance déjà énorme, chase = ruine garantie"
  action: "❌ JAMAIS augmenter sizing après pertes"

red_flag_2_too_many_legs:
  symptome: "Tenter 5-6+ legs 'pour grosse cote'"
  winrate: "<5% (quasi-impossible)"
  action: "❌ MAX 4 legs, sweet spot 3"

red_flag_3_legs_sans_value:
  symptome: "Inclure legs edge faible 'pour compléter'"
  probleme: "Un leg sans value détruit edge combiné"
  action: "❌ CHAQUE leg doit avoir edge ≥5%"

red_flag_4_correlation_cachée:
  symptome: "Legs semblent indépendants mais liés"
  exemple: "Liverpool gagne + Salah but (corrélés)"
  action: "Vérifier corrélation AVANT construire"

red_flag_5_variance_tolerance:
  symptome: "Losing streak 10+ combinés"
  realité: "Normal avec 25% winrate"
  action: "❌ NE PAS paniquer, trust processus"
```

---

# 📊 KPIs SPÉCIFIQUES COMBINÉS

```yaml
objectifs_100_combinés:

  winrate:
    3_legs: "25-30% (objectif)"
    si_inferieur_20pct: "⚠️ Problème sélection"

  roi:
    objectif: "15-25% (plus élevé que paris simples)"
    si_negatif: "❌ STOP, réviser stratégie"

  edge_moyen_réalisé:
    objectif: ">20% par combiné"
    calcul: "Winrate réel vs winrate implicite cotes"

  variance_metrics:
    max_losing_streak_attendu: "12-15 combinés (winrate 25%)"
    max_drawdown_attendu: "30-40% peak"
    si_excede: "Réévaluer sizing"

  insurance_usage:
    frequence: "100% combinés (si disponible)"
    impact_mesure: "Combien remboursements vs pertes totales"
```

---

# ✅ CONCLUSION STRATÉGIE COMBINÉS

## Points clés

1. **✅ Combinés PEUVENT être profitables** si:
   - Chaque leg a value RÉELLE (edge ≥5%)
   - Nombre legs limité (3-4 max)
   - Sizing ultra-conservateur (Kelly 1/6)
   - Insurance utilisée si disponible

2. **⚠️ Variance ÉNORME**:
   - Losing streaks 10-15 normaux
   - Winrate 25-30% attendu
   - Besoin discipline mentale EXTRÊME

3. **🎯 Edge MULTIPLIÉ**:
   - Si chaque leg value → Combiné value++
   - ROI potentiel 15-25% (vs 5-8% simples)
   - MAIS accepter drawdowns 30-40%

## Système adapté

Notre système **PARFAITEMENT adapté combinés** avec:
- ✅ Détection legs value (Agent #6 modifié)
- ✅ Vérification corrélation
- ✅ Calcul edge combiné
- ✅ Sizing Kelly adapté (1/6)
- ✅ Gestion bankroll stricte
- ✅ Insurance strategy

**PRÊT À IMPLÉMENTER.** 🚀

---

# 📚 SOURCES

- [Parlay Betting Strategy: Tips and Tricks](https://www.bettoredge.com/post/parlay-betting-strategy-tips-and-tricks-to-win-and-maximize-payouts)
- [NFL Parlay Tips & Strategy](https://www.covers.com/nfl/parlay-betting-tips)
- [Football Accumulator Strategy: Win BIG with Low-Risk](https://caanberry.com/football-accumulator-betting-strategy/)
- [Multi-Bet Explained: How Parlays Work](https://champsbase.com/en/sports-betting/guide/bet-types/multi-bet/)
- [Correlated Parlays Explained](https://www.boydsbets.com/correlated-parlays/)
- [How to Beat Bookies with Accumulators](https://www.tradematesports.com/en/blog/staking-accumulators-parlays-multiples-neutral-hedge-gambit)
- [Understanding Accumulator Bets 2026](https://www.sportsgambler.com/betting-school/accumulator-bets/)
- [Low Odds Accumulator Tips](https://www.bookmakers.bet/18762/low-odds-parlay-betting/)
