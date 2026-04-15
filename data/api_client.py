"""
COMBINEE GAGNANT - Client API-Football v3
==========================================
Mode: Hybride (API Free 100 req/jour + Web Scraping)
Utilise par les agents #01, #02, #03 pour la collecte de donnees.
"""

import json
import os
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
API_KEY = os.environ.get("API_FOOTBALL_KEY", "VOTRE_CLE_ICI")
BASE_URL = "https://v3.football.api-sports.io"
CACHE_DIR = Path("./data/api_cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# IDs des ligues principales
LEAGUES = {
    "ligue_1": 61,
    "la_liga": 140,
    "premier_league": 39,
    "serie_a": 135,
    "bundesliga": 78,
    "ligue_2": 62,
    "champions_league": 2,
    "europa_league": 3,
}

# Compteur de requetes quotidiennes
REQUEST_COUNT_FILE = CACHE_DIR / "request_count.json"


def get_request_count():
    """Retourne le nombre de requetes effectuees aujourd'hui."""
    if REQUEST_COUNT_FILE.exists():
        data = json.loads(REQUEST_COUNT_FILE.read_text())
        if data.get("date") == datetime.now().strftime("%Y-%m-%d"):
            return data.get("count", 0)
    return 0


def increment_request_count():
    """Incremente le compteur de requetes quotidiennes."""
    count = get_request_count() + 1
    data = {"date": datetime.now().strftime("%Y-%m-%d"), "count": count}
    REQUEST_COUNT_FILE.write_text(json.dumps(data))
    return count


def can_make_request():
    """Verifie si on peut encore faire des requetes (limite 100/jour)."""
    return get_request_count() < 95  # Marge de securite de 5


def api_request(endpoint, params=None):
    """
    Fait une requete a l'API-Football via curl.
    Retourne le JSON de reponse ou None en cas d'erreur.
    """
    if not can_make_request():
        print(f"[ALERTE] Limite quotidienne presque atteinte ({get_request_count()}/100)")
        return None

    # Construire l'URL
    url = f"{BASE_URL}{endpoint}"

    # Construire la commande curl
    headers = f'-H "x-apisports-key: {API_KEY}"'
    param_str = ""
    if params:
        param_str = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"{url}?{param_str}"

    # Verifier le cache d'abord
    cache_key = f"{endpoint}_{param_str}_{datetime.now().strftime('%Y-%m-%d')}".replace("/", "_").replace("?", "_")
    cache_file = CACHE_DIR / f"{cache_key}.json"

    if cache_file.exists():
        print(f"[CACHE] Utilisation du cache pour {endpoint}")
        return json.loads(cache_file.read_text())

    # Faire la requete
    cmd = f'curl -s "{url}" {headers}'
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            increment_request_count()

            # Sauvegarder en cache
            cache_file.write_text(json.dumps(data, indent=2))
            print(f"[API] Requete OK: {endpoint} (total: {get_request_count()}/100)")
            return data
        else:
            print(f"[ERREUR] Requete echouee: {result.stderr}")
            return None
    except Exception as e:
        print(f"[ERREUR] Exception: {e}")
        return None


# ============================================================================
# FONCTIONS AGENT #01 - DATA MATCHS
# ============================================================================

def get_fixtures_today(league_id=None):
    """Recupere les matchs du jour pour une ou toutes les ligues."""
    today = datetime.now().strftime("%Y-%m-%d")
    params = {"date": today}
    if league_id:
        params["league"] = league_id
        params["season"] = 2025
    return api_request("/fixtures", params)


def get_fixtures_tomorrow(league_id=None):
    """Recupere les matchs de demain."""
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    params = {"date": tomorrow}
    if league_id:
        params["league"] = league_id
        params["season"] = 2025
    return api_request("/fixtures", params)


def get_h2h(team1_id, team2_id, last=10):
    """Recupere les confrontations directes entre deux equipes."""
    params = {"h2h": f"{team1_id}-{team2_id}", "last": last}
    return api_request("/fixtures/headtohead", params)


def get_fixture_statistics(fixture_id):
    """Recupere les stats d'un match (corners, tirs, possession, etc.)."""
    return api_request("/fixtures/statistics", {"fixture": fixture_id})


def get_fixture_lineups(fixture_id):
    """Recupere les compositions d'un match."""
    return api_request("/fixtures/lineups", {"fixture": fixture_id})


def get_fixture_events(fixture_id):
    """Recupere les evenements d'un match (buts, cartons, remplacements)."""
    return api_request("/fixtures/events", {"fixture": fixture_id})


# ============================================================================
# FONCTIONS AGENT #02 - DATA COTES
# ============================================================================

def get_odds(fixture_id, bookmaker_id=None):
    """Recupere les cotes pour un match."""
    params = {"fixture": fixture_id}
    if bookmaker_id:
        params["bookmaker"] = bookmaker_id
    return api_request("/odds", params)


# ============================================================================
# FONCTIONS AGENT #03 - DATA CONTEXTE
# ============================================================================

def get_injuries(league_id, season=2025):
    """Recupere les blessures/suspensions pour une ligue."""
    return api_request("/injuries", {"league": league_id, "season": season})


def get_predictions(fixture_id):
    """Recupere les predictions de l'API (a comparer avec les notres)."""
    return api_request("/predictions", {"fixture": fixture_id})


def get_standings(league_id, season=2025):
    """Recupere le classement d'une ligue."""
    return api_request("/standings", {"league": league_id, "season": season})


def get_team_statistics(team_id, league_id, season=2025):
    """Recupere les stats detaillees d'une equipe."""
    return api_request("/teams/statistics", {
        "team": team_id,
        "league": league_id,
        "season": season
    })


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def get_status():
    """Verifie le statut de l'API et le nombre de requetes restantes."""
    return api_request("/status")


def search_team(name):
    """Recherche une equipe par nom."""
    return api_request("/teams", {"search": name})


def format_fixture_summary(fixture):
    """Formate un match en resume lisible."""
    teams = fixture.get("teams", {})
    goals = fixture.get("goals", {})
    league = fixture.get("league", {})
    return {
        "id": fixture.get("fixture", {}).get("id"),
        "date": fixture.get("fixture", {}).get("date"),
        "competition": league.get("name"),
        "domicile": teams.get("home", {}).get("name"),
        "exterieur": teams.get("away", {}).get("name"),
        "score": f"{goals.get('home', '?')}-{goals.get('away', '?')}",
        "statut": fixture.get("fixture", {}).get("status", {}).get("long"),
    }


# ============================================================================
# TEST RAPIDE
# ============================================================================

if __name__ == "__main__":
    print("=== TEST API-FOOTBALL CLIENT ===")
    print(f"Cle API: {'Configuree' if API_KEY != 'VOTRE_CLE_ICI' else 'NON CONFIGUREE'}")
    print(f"Requetes aujourd'hui: {get_request_count()}/100")

    if API_KEY != "VOTRE_CLE_ICI":
        # Test: statut API
        status = get_status()
        if status:
            account = status.get("response", {}).get("account", {})
            print(f"Plan: {account.get('plan', 'inconnu')}")
            print(f"Requetes restantes: {account.get('requests', {}).get('current', '?')}/{account.get('requests', {}).get('limit_day', '?')}")

        # Test: matchs du jour
        fixtures = get_fixtures_today()
        if fixtures:
            matches = fixtures.get("response", [])
            print(f"\nMatchs aujourd'hui: {len(matches)}")
            for f in matches[:5]:
                summary = format_fixture_summary(f)
                print(f"  {summary['competition']}: {summary['domicile']} vs {summary['exterieur']} ({summary['date']})")
    else:
        print("\n[!] Configurez votre cle API dans la variable API_FOOTBALL_KEY")
        print("    export API_FOOTBALL_KEY='votre_cle_ici'")
