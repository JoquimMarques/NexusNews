import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do ficheiro .env
load_dotenv()

class Config:
    """Configurações centrais da aplicação."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-me'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///../database/news.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações para APIs de Notícias (ex: NewsAPI)
    NEWS_API_KEY = os.environ.get('NEWS_API_KEY') or 'ea7d2c6816734a1d8dbe069f0d77fb81'
    
    # Configurações de IA (OpenRouter + Gemini)
    OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY') or ''
    AI_MODEL = "google/gemini-2.0-flash-001"
