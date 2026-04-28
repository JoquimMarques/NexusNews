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
    
    print("\nTestando NewsAPI com busca geral 'Portugal'...")
    news_general = fetch_news_from_api(None)
    print(f"Número de notícias encontradas (Geral): {len(news_general)}")
    
    if news_general:
        print(f"Primeira notícia: {news_general[0]['title']}")
        print(f"Fonte: {news_general[0]['source']}")
    else:
        print("Nenhuma notícia encontrada no geral.")
