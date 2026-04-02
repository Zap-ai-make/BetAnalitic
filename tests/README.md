# Tests de Validation - Système Multi-Agents

## 🎯 Vue d'ensemble

Ce dossier contient les tests de validation du système de paris sportifs avant déploiement production.

**Test principal:** `backtest-validation.py` - Valide le système sur 100 matchs historiques

---

## 🚀 Utilisation Rapide

### 1. Installation Dépendances

```bash
pip install pandas numpy
```

### 2. Lancer le Test (Données Synthétiques)

Pour tester rapidement avec des données générées automatiquement:

```bash
python tests/backtest-validation.py
```

**Output:**
- Affichage résultats dans terminal
- `results/backtest_results.csv` - Détail de chaque pari
- `results/backtest_report.json` - Rapport JSON complet
- **Code sortie 0 = GO, 1 = NO-GO**

---

## 📊 Utilisation Production (Données Réelles)

### Étape 1: Créer Dataset 100 Matchs

Créer le fichier `data/backtest_100_matches.csv` avec les colonnes suivantes:

```csv
match_id,date,home_team,away_team,home_xg,away_xg,home_corners_l10_avg,away_corners_l10_avg,home_cards_l10_avg,away_cards_l10_avg,is_derby,derby_intensity,odds_over_10_5_corners,odds_over_4_5_cards,wind_speed,goalkeeper_puncher_home,goalkeeper_puncher_away,referee_strict,actual_home_corners,actual_away_corners,actual_home_cards,actual_away_cards
1,2024-09-14,Liverpool,Everton,2.3,0.8,5.8,4.2,2.4,2.8,true,9.2,1.95,1.88,25,false,true,false,6,4,3,4
2,2024-09-15,Arsenal,Spurs,1.9,1.2,6.1,5.3,2.1,2.6,true,9.0,1.90,1.85,18,false,false,true,7,5,2,3
...
```

### Étape 2: Collecter Données Historiques

**Sources gratuites recommandées:**

1. **FBref** - Stats matchs
   - URL: https://fbref.com/en/comps/9/2024-2025/schedule/
   - Données: xG, corners, cartons, possession

2. **Understat** - xG détaillé
   - URL: https://understat.com/league/EPL/2024
   - Données: xG par joueur, timing

3. **Oddsportal** - Cotes historiques
   - URL: https://www.oddsportal.com/football/england/premier-league/results/
   - Données: Cotes ouverture + closing

4. **Sofascore** - Events
   - URL: https://www.sofascore.com/
   - Données: Timing corners/cartons, momentum

**Temps estimé:** 5-10 min par match = **8-15 heures total** pour 100 matchs

### Étape 3: Calculer Moyennes L10

Pour chaque équipe, calculer moyennes 10 derniers matchs:
- `home_corners_l10_avg`: Moyenne corners domicile 10 derniers matchs
- `away_corners_l10_avg`: Moyenne corners extérieur 10 derniers matchs
- Idem pour cards (cartons)

### Étape 4: Lancer Test

```bash
python tests/backtest-validation.py
```

Le script détecte automatiquement si `data/backtest_100_matches.csv` existe.

---

## 📈 Interprétation Résultats

### Output Terminal

```
============================================================
RÉSULTATS BACKTESTING
============================================================

📊 STATISTIQUES GÉNÉRALES:
   Paris placés:        78
   Gagnés:              18 (23.1%)
   Perdus:              60 (76.9%)
   Série perdante max:  8 paris

💰 PERFORMANCE FINANCIÈRE:
   Total misé:          1247€
   Profit total:        +127€
   ROI:                 +10.2%
   Bankroll départ:     1000€
   Bankroll finale:     1127€
   Variation:           +127€ (+12.7%)

📈 MOYENNES:
   Stake moyen:         16.01€
   Cote moyenne:        3.62
   Edge moyen:          18.3%
   Corrélation moyenne: 0.12

============================================================
DÉCISION GO/NO-GO PRODUCTION
============================================================

CRITÈRES DE VALIDATION:
  ✅ ROI +10.2% ≥ 5.0% (requis)
  ✅ Winrate 23.1% ≥ 15.0% (requis)
  ✅ Bankroll finale 1127€ > 1000€ (départ)
  ✅ Série perdante max 8 ≤ 15 (acceptable)

============================================================
✅✅✅ DÉCISION: GO - SYSTÈME VALIDÉ POUR PRODUCTION ✅✅✅
============================================================
```

### Critères GO/NO-GO

**✅ GO si:**
- ROI ≥ 5%
- Winrate ≥ 15%
- Bankroll finale > Bankroll départ
- Série perdante max ≤ 15

**❌ NO-GO si:**
- ROI < 5% → Recalibrer Agent #15 (edges surestimés)
- Winrate < 15% → Recalibrer Agent #16 (corrélations sous-estimées)
- Série perdante > 15 → Variance incontrôlable, réduire Kelly

---

## 🔧 Configuration

Modifier `CONFIG` dans `backtest-validation.py`:

```python
CONFIG = {
    "starting_bankroll": 1000,      # Bankroll initiale (€)
    "min_roi_required": 5.0,        # ROI minimum pour GO (%)
    "min_winrate_required": 15.0,   # Winrate minimum (%)
    "max_stake_per_bet": 1.5,       # Max stake par combiné (%)
    "kelly_divisor": 10,            # Kelly 1/10
    "edge_threshold_single": 8.0,   # Edge minimum singles (%)
    "edge_threshold_combo": 15.0,   # Edge minimum combinés (%)
    "correlation_threshold": 0.18,  # Corrélation max
}
```

---

## 📂 Fichiers Générés

### `results/backtest_results.csv`

Détail de chaque pari placé:

```csv
match_num,match,date,is_derby,legs_count,markets,stake,odds,edge,correlation,outcome,profit,bankroll
1,Liverpool vs Everton,2024-09-14,True,2,over_10.5_corners + over_4.5_cards,21.3,3.67,28.5,0.27,WIN,56.8,1056.8
2,Arsenal vs Spurs,2024-09-15,True,2,over_10.5_corners + over_4.5_cards,15.8,3.52,26.1,0.25,LOSS,-15.8,1041.0
...
```

### `results/backtest_report.json`

Rapport complet JSON:

```json
{
  "go_decision": "GO",
  "timestamp": "2026-04-01T22:30:15",
  "metrics": {
    "total_bets": 78,
    "wins": 18,
    "winrate": 23.1,
    "roi": 10.2,
    "final_bankroll": 1127.0,
    "max_losing_streak": 8
  },
  "criteria": {
    "met": [
      "✅ ROI +10.2% ≥ 5.0%",
      "✅ Winrate 23.1% ≥ 15.0%"
    ],
    "failed": []
  }
}
```

---

## 🎛️ Intégration OpenClaw

### Ajouter au Workflow OpenClaw

**Fichier: `AGENTS.md` (OpenClaw)**

```yaml
validation_workflow:
  step_1_backtest:
    command: "python tests/backtest-validation.py"
    expected_duration: "2-5 minutes"
    success_criteria:
      - "Exit code 0"
      - "Fichier results/backtest_report.json créé"
      - "go_decision == 'GO'"

  step_2_if_go:
    action: "Déployer système production"
    agents_activés: "Tous les 20 agents"

  step_3_if_no_go:
    action: "Recalibration agents #15 et #16"
    retry_after: "Ajustements appliqués"
```

### Script Shell OpenClaw

```bash
#!/bin/bash
# test-and-deploy.sh

echo "🧪 Lancement tests validation..."

python tests/backtest-validation.py

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Tests validés - Déploiement autorisé"
    # Lancer système production
    python main.py --mode production
else
    echo "❌ Tests échoués - Recalibration requise"
    # Ne pas déployer
    exit 1
fi
```

---

## ⚠️ Points Importants

1. **Données Synthétiques vs Réelles**
   - Par défaut, le script génère des données synthétiques pour démonstration
   - Pour validation réelle, **IMPÉRATIF** d'utiliser données historiques vraies
   - Créer `data/backtest_100_matches.csv` avec vraies données

2. **Agents Simplifiés**
   - Les agents dans le backtest sont des **versions simplifiées**
   - Logique complète sera dans les vrais agents OpenClaw
   - Le backtest valide les **principes** et **seuils**, pas l'implémentation exacte

3. **Calibration Continue**
   - Après 1 mois production, re-tester sur nouveaux matchs
   - Ajuster seuils si ROI réel diverge de backtest >3 points

4. **Variance**
   - Winrate combinés 15-25% = **normal**
   - Séries perdantes 8-12 paris = **attendu**
   - Ne pas paniquer si série courte, circuit breakers protègent

---

## 🚨 Actions si NO-GO

Si le backtest échoue (NO-GO), appliquer les ajustements:

### ROI < 5%

```python
# Agent #15: Facteur correction edges
def calculate_edge_corrected(self, edge_raw):
    return edge_raw * 0.80  # -20% correction

# Augmenter seuils
edge_threshold_single = 10.0  # Était 8.0
edge_threshold_combo = 18.0   # Était 15.0
```

### Winrate < 15%

```python
# Agent #16: Corrélation plus stricte
correlation_threshold = 0.15  # Était 0.18

# Interdictions additionnelles
if match_context['is_derby']:
    # JAMAIS 2 legs même match si derby
    return []
```

### Série Perdante > 15

```python
# Kelly plus conservateur
kelly_divisor = 12  # Était 10

# Max stake réduit
max_stake_per_bet = 1.0  # Était 1.5
```

Puis **re-tester** sur 50 nouveaux matchs.

---

## 📞 Support

Pour questions ou problèmes:
1. Vérifier que `pandas` et `numpy` sont installés
2. Vérifier format CSV si utilisation données réelles
3. Consulter `results/backtest_report.json` pour détails

**Bonne validation! 🚀**
