
import os
import requests
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_API_URL = "https://api.themoviedb.org/3"

def get_movie_details(movie_title: str):
    if not TMDB_API_KEY or TMDB_API_KEY == "your_tmdb_api_key":
        return None
        
    search_url = f"{TMDB_API_URL}/search/movie"
    params = {"api_key": TMDB_API_KEY, "query": movie_title}
    try:
        response = requests.get(search_url, params=params, timeout=5)
        if response.status_code == 200:
            results = response.json().get("results", [])
            if results:
                return results[0]
    except Exception as e:
        print(f"Error fetching from TMDB: {e}")
    return None

def get_poster_url(poster_path: str, size: str = "w500"):
    if not poster_path:
        return None
    return f"https://image.tmdb.org/t/p/{size}{poster_path}"
