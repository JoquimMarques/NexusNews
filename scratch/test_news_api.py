import sys
import os

# Adiciona o diretório atual ao path para importar os módulos
sys.path.append(os.getcwd())

from flask import Flask
from utils.api_client import fetch_news_from_api
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

with app.app_context():
    print("Testando NewsAPI com a categoria 'Tecnologia'...")
    news = fetch_news_from_api("Tecnologia")
    print(f"Número de notícias encontradas (Tecnologia): {len(news)}")
    
    print("\nTestando NewsAPI com busca 'Tendências IA'...")
    news_ai = fetch_news_from_api("Tendências IA")
    print(f"Número de notícias encontradas (Tendências IA): {len(news_ai)}")
    
    if news_ai:
        print(f"Primeira notícia: {news_ai[0]['title']}")
    else:
        print("Nenhuma notícia encontrada para 'Tendências IA'.")
