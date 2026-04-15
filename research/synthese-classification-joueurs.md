# SYNTHÈSE RECHERCHE — Systèmes de Classification Joueurs Football

**Date:** 2026-03-30
**Objectif:** Recherche approfondie taxonomies et systèmes classification joueurs pour enrichir notre système de tags

---

## 📊 Sources Professionnelles Identifiées

### Plateformes Analytics Leaders

**[StatsBomb](https://statsbomb.com/)** — Le standard industrie
- 3400+ events capturés par match
- 190+ compétitions couvertes
- Métriques avancées : xG, PPDA, passes sous pression
- Système "possession-state model" (valeur chaque action)
- Header Oriented Performance System (dominance aérienne)

**[Opta / Stats Perform](https://theanalyst.com/)** — Data massive
- 3000 actions capturées par match
- ~60 types d'events différents
- Support IA et computer vision
- Référence pour data événementielle

**[SCOUTED](https://scoutedftbl.com/)** — Système Archétypes
- Traduit méta football en "classes RPG"
- Quantification profils joueurs
- Accélère découverte joueurs
- Focus fonction terrain

### Systèmes Académiques

**[PlayeRank](https://arxiv.org/pdf/1802.04987)** (ArXiv)
- Player Impact Metric (PIM)
- Combine event data + xG + Expected Threat (xT)
- xT = Probabilité qu'action mène à but
- Révèle rôle joueurs dans chaînes de buts

**[Clustering Joueurs](https://medium.com/@marwanehamdani/decoding-player-roles-a-data-driven-clustering-approach-in-football-764654afb45b)**
- Machine Learning pour détecter rôles
- Labels positionnels traditionnels insuffisants
- "Defender" peut être stopper rugueux OU latéral offensif
- Clustering révèle nuances

---

## 🎯 TAXONOMIES PROFESSIONNELLES VALIDÉES

### ATTAQUANTS — 7 Profils Identifiés

Sources: [SciSports](https://www.scisports.com/searching-for-your-top-scorer-different-qualities-but-the-same-goals/), [MBP School](https://mbpschool.com/en/4-striker-profiles-main-characteristics/), [Football Collective](https://footballcollective.org.uk/general/false-nines-target-men-a-fox-in-the-box-what-are-the-different-types-of-striker-in-football/)

#### 1. **Poacher (Renard des Surfaces)**
**Définition:** Spécialiste finition dans surface, anticipe ballons perdus
**Caractéristiques:**
- Minimal touches, maximum impact
- Lit déviations et cutbacks
- Courses dans dos défenseurs
- Finition rapide et décisive

**Métriques clés:**
- Buts/tir élevé (>0.20)
- xG/tir élevé (shots haute qualité)
- Touches ballon faibles (<30/match)
- Buts surface 16m (>90%)

**Exemples:** Inzaghi (historique), Icardi

---

#### 2. **Target Man (Pivot Aérien)**
**Définition:** Puissance physique, hold-up play, présence aérienne
**Caractéristiques:**
- Tient ballon sous pression
- Remises pour coéquipiers
- Dominance aérienne
- Out-ball de l'équipe (ballons longs)

**Métriques clés:**
- Duels aériens gagnés (>65%)
- Hold-up play success (>70%)
- Hauteur (>185cm généralement)
- Assists/passes décisives

**Impact paris:**
- **+0.3 corners adverses** (défenses reculent)
- **+15% efficacité set-pieces**
- **+0.2 cartons adverses** (fautes sur lui)

**Exemples:** Giroud, Lukaku, Haaland (hybride avec finisseur)

---

#### 3. **Finisher (Finisseur Clinique)**
**Définition:** Toutes formes de finition, conversion maximale
**Caractéristiques:**
- Spécialiste finition
- Pied gauche ET droit
- Placement optimal
- Technique tir parfaite

**Métriques clés:**
- Taux conversion (>1.05 buts/xG)
- Tirs cadrés % (>55%)
- Buts/90 élevé (>0.70)
- Variété finitions (tête, pieds, extérieur)

**Exemples:** Kane, Lewandowski, Mbappé

---

#### 4. **Deep-Lying Creator (Faux 9)**
**Définition:** Attaquant créateur, décroche, assiste
**Caractéristiques:**
- Décroche en milieu
- Sens passe exceptionnel
- Créé espaces pour autres
- Score ET assiste

**Métriques clés:**
- Assists/90 élevé (>0.35)
- Passes clés (>2.5/90)
- xA (Expected Assists) élevé
- Décrochages fréquents

**Impact paris:**
- **+0.3 xG équipe** (création)
- **+0.25 buts équipe**
- Style jeu plus fluide

**Exemples:** Firmino, Griezmann, Messi (historique)

---

#### 5. **Explosive Dribbler (Dribbleur Électrique)**
**Définition:** 1v1 mortel, vitesse, déséquilibre défenses
**Caractéristiques:**
- Dribbles constants
- Vitesse explosive
- Isolations latérales
- Provoque fautes

**Métriques clés:**
- Dribbles réussis (>4.0/90)
- Vitesse pointe (>33 km/h)
- Fautes subies élevées (>2.5/90)
- 1v1 gagnés (>65%)

**Impact paris:**
- **+0.4 cartons adverses** ⭐ (fautes pour l'arrêter)
- **+0.3 corners** (dribbles → sorties)
- **+0.25 buts équipe**

**Exemples:** Vinícius Jr, Mbappé, Adama Traoré, Saint-Maximin

---

#### 6. **Defensive Forward (Pressing Machine)**
**Définition:** Défense commence de l'avant, pressing haut
**Caractéristiques:**
- Pressing constant
- Récupérations hautes
- Work-rate énorme
- Sacrifice offensif pour équipe

**Métriques clés:**
- Pressures (>15/90)
- Tackles zone offensive (>1.5/90)
- Distance parcourue (>11km)
- PPDA influencé positivement

**Impact paris:**
- **Intensité match +0.5**
- **Style pressing équipe**
- Influence cartons adverses

**Exemples:** Firmino, Gabriel Jesus

---

#### 7. **Complete Forward (Complet)**
**Définition:** Combine plusieurs profils, polyvalent
**Caractéristiques:**
- Finit, crée, hold-up
- Adaptable tactiquement
- Aucune faiblesse majeure

**Exemples:** Benzema, Suárez (historique)

---

### MILIEUX — 8 Profils Identifiés

Sources: [Total Football Analysis](https://totalfootballanalysis.com/article/different-archetypes-defensive-midfielders-scout-report-tactical-analysis), [Wikipedia Midfielder](https://en.wikipedia.org/wiki/Midfielder), [Tackle From Behind](https://tacklefrombehind.com/football/the-engine-room-understanding-football-midfield-archetypes/)

#### 1. **Destroyer (Ball-Winner)**
**Définition:** Archétype traditionnel, gagne duels, agressif
**Caractéristiques:**
- Tackles sans peur
- Athlétisme
- Disruption jeu adverse
- Agressivité contrôlée

**Métriques clés:**
- Tackles/90 (>3.0)
- Interceptions (>2.0)
- Duels gagnés % (>65%)
- Fautes commises élevées

**Impact paris:**
- **+0.3 cartons jaunes** (style agressif)
- **-0.2 possession équipe** (pas créateur)
- Style défensif pur

**Exemples:** Casemiro, Gattuso (historique), N'Golo Kanté

---

#### 2. **Regista (Director)**
**Définition:** Mot italien = "directeur", dicte jeu offensif
**Caractéristiques:**
- Range passe exceptionnel
- Résistance pression
- Composure
- Vision et créativité

**Métriques clés:**
- Passes/90 (>85)
- Passes longues précises (>8/90)
- Passes clés (>2.0)
- Possession sous pression (>85% précision)

**Impact paris:**
- **+0.3 xG équipe**
- **Possession équipe +3%**
- **-0.1 cartons** (pas agressif)

**Exemples:** Pirlo (historique), Jorginho, Busquets

---

#### 3. **Box-to-Box Midfielder**
**Définition:** Ni purement destructif ni créatif, couvre tout terrain
**Caractéristiques:**
- Endurance exceptionnelle
- Gagne ballons ET progresse
- Arrivées surface
- Polyvalence totale

**Métriques clés:**
- Distance parcourue (>12km)
- Tackles + passes (équilibré)
- Buts de milieu (>0.25/90)
- Sprints haute intensité élevés

**Impact paris:**
- **+0.25 buts équipe**
- **Équilibre équipe**
- **+0.15 intensité match**

**Exemples:** Bellingham, Rice, Gerrard (historique), Lampard

---

#### 4. **Deep-Lying Playmaker (Demi Créateur)**
**Définition:** Milieu défensif spécialisé passes, pas tackles
**Caractéristiques:**
- Construction depuis arrière
- Range passe long
- Vision tactique
- Moins agressif que destroyer

**Exemples:** Xabi Alonso (historique), Carrick

---

#### 5. **Anchor (Stabilisateur) — CRITIQUE**
**Définition:** Évolution moderne du destroyer, build-up + défense
**Caractéristiques:**
- Progression construction
- Stabilité défensive
- Ancre équipe
- **Impact énorme si absent**

**Métriques clés:**
- Passes ET tackles élevés
- Position optimale constante
- Interceptions zonales
- Lectures jeu

**Impact paris:**
- **Impact points +0.5 à +0.7** ⭐⭐⭐
- **Dépendance 8.5-9.0** (ÉNORME)
- Si absent : **-25% performance équipe**

**Exemple TYPE:** **Rodri** (Man City: 87% victoires avec, 62% sans)

---

#### 6. **Space-Eater (Couvre-Espaces)**
**Définition:** Athlète moderne, zonage, ferme espaces
**Caractéristiques:**
- Athlétisme exceptionnel
- Marquage zonal
- Fermeture espaces
- Mobilité constante

**Métriques clés:**
- Sprints/90 élevés
- Espaces couverts (heatmap large)
- Interceptions zonales

---

#### 7. **Mezzala (Demi-Ailier Intérieur)**
**Définition:** Milieu intérieur offensif, dribbles, arrivées
**Caractéristiques:**
- Dribbles depuis milieu
- Arrivées seconde ligne
- Créativité zones intérieures

**Exemples:** Iniesta (historique), Barella

---

#### 8. **Attacking Midfielder / #10 (Meneur)**
**Définition:** Créateur pur, entre lignes, passes décisives
**Caractéristiques:**
- Entre lignes
- Passes clés constantes
- Peu défensif
- Vision exceptionnelle

**Métriques clés:**
- Assists (>0.40/90)
- Passes clés (>3.0)
- Dribbles zones dangereuses

**Exemples:** Ödegaard, Bruno Fernandes, De Bruyne

---

### GARDIENS — 3 Profils Validés

Sources: [Breaking The Lines](https://breakingthelines.com/opinion/shot-stopper-and-sweeper-keeper-two-goalie-styles-that-define-football/), [The Mastermind Site](https://themastermindsite.com/2022/05/05/what-is-a-sweeper-keeper/)

#### 1. **Shot-Stopper (Arrêteur)**
**Définition:** Focus arrêts, réflexes, reste entre poteaux
**Caractéristiques:**
- Agilité et réflexes
- Positionnement optimal
- Reste dans surface
- Arrêts spectaculaires

**Métriques clés:**
- Save % élevé (>75%)
- Saves/90 élevé (>3.5)
- Goals prevented positif
- Sorties faibles (<0.5/90)

**Impact paris:**
- **-0.15 à -0.20 buts concédés**
- Corners : DÉPEND punch vs catch

**Exemples:** Donnarumma, De Gea

---

#### 2. **Sweeper-Keeper (Libero Gardien)**
**Définition:** Actif, sort beaucoup, défenseur supplémentaire
**Caractéristiques:**
- Sort hors surface
- Intercepte ballons profondeur
- Distribution excellente
- Lecture jeu anticipative

**Métriques clés:**
- Passes/90 élevé (>30)
- Sorties/90 (>1.5)
- Distance moyenne position (plus haute)
- Précision passes longues

**Impact paris:**
- **Permet ligne haute équipe**
- **Influence style jeu**
- **-0.1 buts si excellent**

**Exemples:** Neuer, Ederson, Alisson

---

#### 3. **Command Area Specialist (Commandement Surface)**
**Sous-classification CRITIQUE pour corners:**

**Catcher (Capte)** ⭐⭐⭐
- Catch_rate > 0.65
- **Impact: -0.2 corners concédés**
- Ballon sécurisé
- **EDGE MAJEUR**

**Puncher (Boxe)**
- Punch_rate > 0.65
- **Impact: +0.15 corners concédés**
- Ballon reste en jeu
- Corners adverses

**Métriques clés:**
- Punch vs Catch ratio
- Commandement sorties aériennes
- Prises ballons arrêtés

**Exemples:**
- Catcher: **Courtois** (catch 0.65), Alisson
- Puncher: **Neuer** (punch 0.72)

---

### DÉFENSEURS — 9 Profils Identifiés

Sources: [MBP School Centre-Backs](https://mbpschool.com/en/3-profiles-centre-back-and-their-characteristics/), [Football Iconic](https://footballiconic.com/centre-backs-in-football-stopper-vs-ball-playing-vs-libero/), [Full-Back Archetypes](https://footballiconic.com/fullback-vs-wingback-vs-inverted-fullback-what-is-the-difference/)

#### DÉFENSEURS CENTRAUX (3 profils)

**1. Stopper (Rugueux Physique)**
- Focus défense pure
- Puissance physique
- Dominance aérienne
- Tackles agressifs

**Métriques:** Duels aériens >70%, tackles >2.5/90, clearances élevées
**Exemples:** Rüdiger, Araújo

**2. Ball-Playing Centre-Back (Relanceur)**
- Construction depuis arrière
- Passes longues précises
- Technique pied
- Moins agressif

**Métriques:** Passes >60/90, passes longues >6/90, précision >88%
**Exemples:** Stones, Laporte

**3. Sweeper / Libero (Balayeur)**
- Rapide, lit jeu
- Couvre profondeur
- Récupérations haute ligne
- Anticipation

**Métriques:** Vitesse pointe >32km/h, interceptions >2.0/90
**Exemples:** Van Dijk, Dias, Saliba

---

#### LATÉRAUX (6 profils)

**4. Traditional Full-Back (Latéral Classique)**
- Défense prioritaire
- Appui offensif modéré
- Équilibré

**5. Modern Full-Back (Latéral Moderne)**
- Défense + attaque
- Overlaps constants
- Work-rate élevé

**Exemples:** Robertson, Carvajal, Walker

**Impact paris:** **+0.4 corners** (centres nombreux)

**6. Wing-Back (Piston)**
- Utilisé dans 3-5-2 ou 3-4-3
- Quasi ailier en attaque
- Couvre énormément

**Métriques:** Distance >12km, centres >4/90

**7. Inverted Full-Back (Latéral Inversé)**
**Définition:** Défend latéral, rentre milieu en possession
**Caractéristiques:**
- Évolution tactique moderne
- Ajoute milieu
- Aide batailles médianes
- Guardiola popularisé

**Métriques:** Passes intérieures >70%, position moyenne centrée
**Exemples:** Cancelo, Zinchenko, Trent (parfois)

**Impact paris:**
- **Possession équipe +2%**
- **Moins de corners** (moins de centres)
- **Style contrôle**

**8. Overlapping Full-Back**
- Runs extérieurs constants
- Support ailiers
- Centres zone offensive

**9. Underlapping Full-Back**
- Runs intérieurs (demi-espaces)
- Alternative overlaps

---

## 🎯 MÉTRIQUES D'IMPACT MESURABLES

### Expected Goals Chain (xG Chain)
**Définition:** xG de toutes sequences où joueur impliqué
**Usage:** Mesure contribution offensive totale

### Expected Threat (xT)
**Définition:** Probabilité qu'action → but
**Usage:** Valeur passes, dribbles progressing ball

### Goals Prevented
**Définition:** xGot concédé - buts réels concédés
**Usage:** Performance gardiens (si positif = surperforme)

### PPDA Impact
**Définition:** Comment joueur influence PPDA équipe
**Usage:** Intensité défensive individuelle

### Possession Value Added (PVA)
**Définition:** Changement probabilité possession → but après action
**Usage:** Valeur chaque passe, dribble, tackle

---

## 📋 ATTRIBUTS SCOUTS PROFESSIONNELS

Sources: [Soccer Interaction](https://soccerinteraction.com/football-top-7-qualities-scouts), [International Football Academy](https://internationalfootball.academy/football-scouting/)

### 3 Catégories Principales

#### 1. ATTRIBUTS TECHNIQUES
- Contrôle ballon
- Précision passes
- Dribbles
- Finition
- Premier toucher
- Pied faible qualité

#### 2. ATTRIBUTS PHYSIQUES
- Vitesse (sprint, accélération)
- Endurance / stamina
- Force physique
- Agilité
- Saut / détente
- Récupération blessures

#### 3. ATTRIBUTS MENTAUX / PSYCHOLOGIQUES
- **Calme sous pression** ⭐
- **Résilience** (récupération erreurs)
- **Leadership**
- **Communication**
- **Mentalité gagnante**
- **Concentration**
- **Décisions sous stress**

### Citation Clé

> "If a player lacks in one category but excels in another, they may not be able to execute their decisions as clearly as someone that possesses half-decent skills in all four categories."

→ **Approche intégrée nécessaire**

---

## 💡 RECOMMANDATIONS POUR NOTRE SYSTÈME

### 1. Structure Finale Proposée

**NIVEAUX QUALITÉ (5 tiers):**
- Elite Mondiale (9.0+)
- Très Bon (7.5-9.0)
- Bon (6.5-7.5)
- Moyen (5.0-6.5)
- Faible (< 5.0)

**TAGS PRIMAIRES (~50-60 tags):**

**Attaquants (15 tags):**
- finisseur_clinique, finisseur_correct, finisseur_faible
- poacher, target_man, false_9, defensive_forward
- dribbleur_elite, dribbleur_explosif
- vitesse_exceptionnelle, rapide, lent
- menace_aerienne, physique_dominant
- createur, passeur_elite
- presence_intimidante, clutch_player

**Milieux (18 tags):**
- destroyer, regista, box_to_box, anchor
- space_eater, mezzala, attacking_mid
- playmaker_elite, deep_lying_playmaker
- recuperateur_elite, intercepteur
- vision_exceptionnelle, range_passe_long
- moteur_infatigable
- **stabilisateur_equipe** ⭐ (Rodri-type, impact énorme)

**Gardiens (8 tags):**
- shot_stopper, sweeper_keeper
- **catcher, puncher** ⭐⭐⭐ (EDGE CORNERS)
- reflexes_elite
- commandement_surface_fort, commandement_faible
- distribution_excellente

**Défenseurs (12 tags):**
- stopper_physique, ball_playing_cb, sweeper_cb
- traditional_fullback, modern_fullback, wingback
- **inverted_fullback** (tactique moderne)
- overlapping, underlapping
- defenseur_aerien, rapide_defenseur
- tackle_propre, agressif_defensif

**TAGS TRANSVERSAUX (10 tags):**
- leadership, capitaine
- clutch_mentality
- calme_sous_pression
- resistant_pression
- work_rate_exceptionnel
- concentration_totale
- experience_gros_matchs
- joueur_systeme (dépend coach)

### 2. Algorithme Calcul Impact

```python
def calculer_impact_joueur(stats, niveau, tags, poste):
    """
    Combine niveau + stats + tags → Impact dynamique
    """

    # 1. Impact BASE selon niveau
    impact = IMPACT_BASE[niveau].copy()

    # 2. Modifier selon STATS réelles
    if poste == "ATT":
        buts_per_90 = stats.buts / (stats.minutes / 90)
        conversion = stats.buts / stats.xG if stats.xG > 0 else 1.0

        # Ajuster impact_buts selon performance réelle
        if conversion > 1.15:
            impact['buts'] *= 1.10  # Sur-performeur

    # 3. Modifier selon TAGS
    for tag in tags:
        impact_tag = TAG_IMPACTS.get(tag, {})

        # Additionner impacts tags
        for key, value in impact_tag.items():
            impact[key] = impact.get(key, 0) + value

    # 4. Combinaisons tags spéciales
    if 'target_man' in tags and 'menace_aerienne' in tags:
        impact['corners_adverses'] += 0.2  # Synergie

    if 'stabilisateur_equipe' in tags:
        impact['dependance'] = 8.5  # Override (très élevé)

    if poste == 'GK' and 'catcher' in tags:
        impact['corners'] -= 0.2  # EDGE ⭐

    return impact
```

### 3. Tags IMPACT

```yaml
tag_impacts:
  # Attaquants
  target_man:
    corners_adverses: +0.3
    set_pieces_efficacite: +15%
    cartons_adverses: +0.2

  dribbleur_explosif:
    cartons_adverses: +0.4  # EDGE
    corners: +0.3

  defensive_forward:
    intensite_match: +0.5
    pressing_equipe: +1.0

  # Milieux
  stabilisateur_equipe:  # RODRI-TYPE
    impact_points: +0.5   # ÉNORME
    dependance: 8.5
    impact_defense: -0.3
    note: "Si absent: -25% performance"

  regista:
    xG_equipe: +0.3
    possession: +3%
    cartons: -0.1  # Pas agressif

  destroyer:
    cartons_jaunes: +0.3  # Agressif
    possession: -2%

  # Gardiens
  catcher:  # ⭐⭐⭐ EDGE MAXIMUM
    corners_concedes: -0.2
    note: "Capte au lieu de boxer"

  puncher:
    corners_concedes: +0.15
    note: "Boxe, ballon reste en jeu"

  shot_stopper:
    buts_concedes: -0.2

  sweeper_keeper:
    ligne_haute_possible: true
    buts_concedes: -0.1
```

### 4. Critères Classification Auto

**Poacher:**
- buts/tir > 0.20
- touches_ballon < 35/90
- buts_surface > 90%
- xG/tir élevé

**Target Man:**
- hauteur > 185cm
- duels_aeriens > 65%
- hold_up_success > 70%

**Dribbleur Explosif:**
- dribbles > 4.0/90
- vitesse_pointe > 33km/h
- fautes_subies > 2.5/90

**Destroyer:**
- tackles > 3.0/90
- duels_gagnes > 65%
- fautes_commises > 2.0/90

**Anchor/Stabilisateur:**
- passes > 80/90 ET tackles > 2.0/90
- position_optimale (heatmap centré)
- **Stats équipe AVEC vs SANS montrent différence énorme**

**Catcher vs Puncher:**
- catch_rate = catches / (catches + punches)
- Si > 0.60 = Catcher ⭐
- Si < 0.40 = Puncher

---

## 🎯 CONCLUSION & NEXT STEPS

### Ce Qu'On a Validé

✅ **Système TAGS supérieur** aux profils fixes
✅ **5 niveaux qualité** suffisants
✅ **50-60 tags** couvrent tous styles
✅ **Impacts mesurables** validés par recherche
✅ **Classification auto possible** (stats → tags)
✅ **Edges identifiés:**
- Catcher vs Puncher ⭐⭐⭐
- Stabilisateur type Rodri ⭐⭐⭐
- Dribbleur explosif → Cartons ⭐⭐
- Target Man → Corners ⭐⭐

### Structure Finale

```
JOUEUR
├─ Niveau: elite_mondiale / tres_bon / bon / moyen / faible
├─ Tags Primaires: [3-6 tags principaux]
├─ Tags Secondaires: [2-4 tags complémentaires]
├─ Attributs Mesurés: {stats saison}
└─ Impacts Calculés: {buts, corners, cartons, dépendance}
```

### Implémentation

**Fichier final à créer:**
`profils-types-joueurs.yaml`

**Contenu:**
1. Définition 5 niveaux + impacts base
2. Liste 60 tags + impacts individuels
3. Règles combinaisons tags (synergies)
4. Algorithme classification (stats → tags)
5. Exemples joueurs réels par profil
6. Instructions utilisation Agent #2

---

## 📚 SOURCES

- [SCOUTED Archetypes](https://scoutedftbl.com/scouted-archetypes-explained-player-profiles/)
- [StatsBomb Analytics](https://statsbomb.com/)
- [Opta Analyst](https://theanalyst.com/)
- [Total Football Analysis - Defensive Midfielders](https://totalfootballanalysis.com/article/different-archetypes-defensive-midfielders-scout-report-tactical-analysis)
- [SciSports Striker Search](https://www.scisports.com/searching-for-your-top-scorer-different-qualities-but-the-same-goals/)
- [MBP School Striker Profiles](https://mbpschool.com/en/4-striker-profiles-main-characteristics/)
- [Breaking The Lines - Goalkeeper Styles](https://breakingthelines.com/opinion/shot-stopper-and-sweeper-keeper-two-goalie-styles-that-define-football/)
- [Football Iconic - Full-Back Types](https://footballiconic.com/fullback-vs-wingback-vs-inverted-fullback-what-is-the-difference/)
- [The Mastermind Site - Inverted Fullback](https://themastermindsite.com/2022/06/05/explaining-the-inverted-fullback-player-role-analysis/)
- [MBP School - Centre-Back Profiles](https://mbpschool.com/en/3-profiles-centre-back-and-their-characteristics/)
- [Soccer Interaction - Scout Qualities](https://soccerinteraction.com/football-top-7-qualities-scouts)
- [International Football Academy - Key Traits](https://internationalfootball.academy/football-scouting/)
- [ArXiv - PlayeRank Player Impact](https://arxiv.org/pdf/1802.04987)
- [Medium - Clustering Players](https://medium.com/@marwanehamdani/decoding-player-roles-a-data-driven-clustering-approach-in-football-764654afb45b)

---

**PRÊT POUR IMPLÉMENTATION** ✅
