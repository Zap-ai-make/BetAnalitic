# Guide Collecte Données Backtest

## 🎯 Objectif

Collecter les données de **100 matchs historiques** (saison 2024-2025) pour valider le système.

**Temps estimé:** 8-15 heures (5-10 min par match)

---

## 📋 Checklist Rapide

Pour chaque match, collecter:

- [ ] **Informations basiques** (équipes, date)
- [ ] **Stats offensives** (xG home/away)
- [ ] **Moyennes L10** (corners, cartons sur 10 derniers matchs)
- [ ] **Contexte** (derby, intensité, météo)
- [ ] **Cotes** (over corners, over cartons)
- [ ] **Gardiens** (puncher vs catcher)
- [ ] **Arbitre** (strict ou laxiste)
- [ ] **Résultats réels** (corners et cartons exacts)

---

## 🔗 Sources de Données

### 1. FBref (Stats Match)

**URL:** https://fbref.com/en/comps/9/2024-2025/schedule/2024-2025-Premier-League-Scores-and-Fixtures

**Données à collecter:**
- `home_xg` - Expected Goals équipe domicile
- `away_xg` - Expected Goals équipe extérieure
- `actual_home_corners` - Corners réels domicile
- `actual_away_corners` - Corners réels extérieur
- `actual_home_cards` - Cartons réels domicile (jaunes + rouges)
- `actual_away_cards` - Cartons réels extérieur

**Comment:**
1. Cliquer sur le match
2. Onglet "Match Summary"
3. Chercher section "Expected" pour xG
4. Section "Passing" pour corners
5. Section "Miscellaneous" pour cartons

---

### 2. Oddsportal (Cotes Historiques)

**URL:** https://www.oddsportal.com/football/england/premier-league/results/

**Données à collecter:**
- `odds_over_10_5_corners` - Cote Over 10.5 corners
- `odds_over_4_5_cards` - Cote Over 4.5 cartons

**Comment:**
1. Trouver le match dans la liste
2. Cliquer sur "Odds"
3. Onglet "Corners" → Over 10.5
4. Onglet "Cards" → Over 4.5
5. Prendre cote **moyenne** si plusieurs bookmakers

**Astuce:** Si Over 10.5 corners pas disponible, estimer:
- Si Over 9.5 @ 1.80 → Over 10.5 ≈ 1.95
- Si Over 11.5 @ 2.10 → Over 10.5 ≈ 1.88

---

### 3. Sofascore (Events Détaillés)

**URL:** https://www.sofascore.com/

**Données à collecter:**
- Confirmation corners exacts
- Confirmation cartons exacts
- Timing events (optionnel)

**Comment:**
1. Chercher le match
2. Onglet "Statistics"
3. Vérifier corners et cartons

---

### 4. Transfermarkt (Joueurs & Context)

**URL:** https://www.transfermarkt.com/

**Données à collecter:**
- `goalkeeper_puncher_home` - Gardien domicile boxe (true) ou capte (false)
- `goalkeeper_puncher_away` - Gardien extérieur boxe ou capte

**Comment identifier puncher vs catcher:**
- **Punchers (true):** Neuer, Ederson, Courtois, Maignan
- **Catchers (false):** Alisson, Ramsdale, Martinez, Pickford

Si inconnu, mettre `false` par défaut.

---

### 5. Calculer Moyennes L10

**Données à calculer:**
- `home_corners_l10_avg` - Moyenne corners 10 derniers matchs **domicile**
- `away_corners_l10_avg` - Moyenne corners 10 derniers matchs **extérieur**
- `home_cards_l10_avg` - Moyenne cartons 10 derniers matchs **domicile**
- `away_cards_l10_avg` - Moyenne cartons 10 derniers matchs **extérieur**

**Comment:**
1. Sur FBref, aller sur page équipe
2. Onglet "Fixtures & Results"
3. Filtrer "Home" ou "Away"
4. Prendre 10 derniers matchs
5. Calculer moyenne corners et cartons

**Exemple Liverpool domicile L10:**
```
Match 1: 7 corners, 2 cartons
Match 2: 5 corners, 3 cartons
...
Match 10: 6 corners, 2 cartons

Moyenne corners: (7+5+...+6)/10 = 5.8
Moyenne cartons: (2+3+...+2)/10 = 2.4
```

---

### 6. Déterminer Derby & Intensité

**Derbies majeurs:**

| Derby | Équipes | Intensité |
|-------|---------|-----------|
| Merseyside | Liverpool - Everton | 9.2 |
| North London | Arsenal - Spurs | 9.0 |
| Manchester | Man City - Man Utd | 8.8 |
| West London | Chelsea - Fulham | 7.5 |
| Tyne-Wear | Newcastle - Sunderland | 8.5 |

**Si derby:**
- `is_derby` = `true`
- `derby_intensity` = Intensité du tableau (ou estimer 8.0-9.5)

**Si PAS derby:**
- `is_derby` = `false`
- `derby_intensity` = `0`

---

### 7. Météo & Arbitre

**Météo (optionnel):**
- Chercher "weather [city] [date]" sur Google
- `wind_speed` = Vitesse vent en km/h
- Si inconnu, mettre `20` (valeur neutre)

**Arbitre:**
- Chercher "referee [match]" sur Google ou Transfermarkt
- Arbitres stricts connus: Michael Oliver, Anthony Taylor
- `referee_strict` = `true` si strict, `false` sinon
- Si inconnu, mettre `false`

---

## 📝 Template Excel/Google Sheets

Pour faciliter la collecte, utiliser un tableau:

| match_id | date | home_team | away_team | ... |
|----------|------|-----------|-----------|-----|
| 1 | 2024-09-14 | Liverpool | Everton | ... |
| 2 | 2024-09-15 | Arsenal | Spurs | ... |

Ensuite exporter en CSV: `Fichier → Télécharger → CSV`

---

## 🎯 Sélection des 100 Matchs

### Composition Recommandée

```yaml
total: 100 matchs

par_ligue:
  premier_league: 40
  la_liga: 20
  bundesliga: 20
  serie_a: 10
  ligue_1: 10

par_type:
  derbies_intenses: 20  # Intensité ≥8.0
  matchs_normaux: 80

par_style:
  possession_vs_possession: 20
  pressing_vs_pressing: 20
  defensif_vs_defensif: 15
  matchs_ouverts: 25
  mix_styles: 20

par_enjeu:
  top_6: 30
  mid_table: 40
  relegation: 30
```

### Matchs Prioritaires (Saison 2024-2025)

**Septembre 2024:**
- Liverpool vs Everton (14/09) ⭐ Derby
- Arsenal vs Spurs (15/09) ⭐ Derby
- Man City vs Arsenal (22/09) ⭐ Top clash

**Octobre 2024:**
- Real Madrid vs Barcelona (26/10) ⭐ El Clásico
- Man Utd vs Chelsea (03/10)
- Bayern vs Dortmund (05/10)

**Novembre 2024:**
- Inter vs Juventus (10/11) ⭐ Derby
- PSG vs OM (24/11) ⭐ Le Classique
- Liverpool vs Man City (30/11)

**Continuer jusqu'à 100 matchs...**

---

## ⚡ Raccourcis & Astuces

### Estimer Rapidement

Si données exactes indisponibles:

**xG:**
- Victoire nette (3-0): Winner xG ≈ 2.5, Loser xG ≈ 0.7
- Match serré (1-1): Both xG ≈ 1.5
- Domination (2-0): Winner xG ≈ 2.0, Loser xG ≈ 1.0

**Moyennes L10:**
- Top 6 clubs: Corners ≈ 5.5-6.5, Cartons ≈ 2.0-2.5
- Mid-table: Corners ≈ 4.5-5.5, Cartons ≈ 2.2-2.8
- Bas tableau: Corners ≈ 3.5-4.5, Cartons ≈ 2.5-3.0

**Cotes (si indisponibles):**
- Over 10.5 corners: Généralement 1.80-2.10
- Over 4.5 cartons: Généralement 1.75-2.00

### Automatisation Partielle

**Script Python pour scraping FBref:**

```python
import requests
from bs4 import BeautifulSoup

def get_match_stats(match_url):
    """Scraper automatique FBref (exemple)"""
    # À implémenter selon structure HTML
    pass
```

**Attention:** Respecter rate limits (1 requête / 3 secondes)

---

## ✅ Validation Dataset

Avant de lancer le backtest, vérifier:

- [ ] 100 matchs collectés
- [ ] Aucune valeur manquante (ou remplir par défaut)
- [ ] Format dates correct: `YYYY-MM-DD`
- [ ] `is_derby`: true/false (minuscules)
- [ ] Cotes réalistes (1.50-3.00 typiquement)
- [ ] Résultats réels correspondent aux matchs

**Commande validation:**

```bash
python -c "import pandas as pd; df = pd.read_csv('data/backtest_100_matches.csv'); print(df.info()); print(df.isnull().sum())"
```

Doit afficher 100 entrées sans NaN.

---

## 🚀 Lancer le Backtest

Une fois les 100 matchs collectés:

```bash
# Renommer le fichier
mv data/backtest_template.csv data/backtest_100_matches.csv

# Lancer le test
python tests/backtest-validation.py
```

**Bonne collecte! 💪**
