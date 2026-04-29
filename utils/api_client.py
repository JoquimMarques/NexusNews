import requests
from flask import current_app

def fetch_news_from_api(category=None):
    """
    Consome a NewsAPI.org de forma robusta.
    Mapeia categorias em português para os parâmetros da API.
    """
    api_key = current_app.config.get('NEWS_API_KEY')
    
    # Mapeamento de categorias PT -> NewsAPI
    category_map = {
        'tecnologia': 'technology',
        'negócios': 'business',
        'ciência': 'science',
        'saúde': 'health',
        'entretenimento': 'entertainment',
        'desporto': 'sports'
    }

    # Se tivermos uma categoria mapeada, tentamos top-headlines primeiro
    if category and category.lower() in category_map:
        base_url = "https://newsapi.org/v2/top-headlines"
        params = {
            "category": category_map[category.lower()],
            "country": "pt",
            "apiKey": api_key
        }
        try:
            response = requests.get(base_url, params=params, timeout=10)
            data = response.json()
            articles = data.get("articles", [])
            
            # Se encontrar notícias, formatamos e devolvemos
            if articles:
                return format_articles(articles, category)
        except Exception as e:
            print(f"Erro em top-headlines: {e}")

    # Se top-headlines falhar ou não houver categoria, usamos everything
    base_url = "https://newsapi.org/v2/everything"
    
    # Melhorar a query: se for IA, expandir para Inteligência Artificial
    q = category if category and category.lower() != 'none' else "notícias portugal"
    
    # Se for uma categoria específica do nosso portal, garantimos que a busca é focada
    if q.lower() == "tecnologia":
        q = "tecnologia"
    elif q.lower() == "inteligência artificial":
        q = '"inteligência artificial" OR "IA"'
    
    params = {
        "q": q,
        "language": "pt",
        "sortBy": "relevancy",
        "apiKey": api_key
    }

    try:
        response = requests.get(base_url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
        return format_articles(articles, category)

    except Exception as e:
        print(f"Erro na API (NewsAPI Everything): {e}")
        return []

def format_articles(articles, category):
    formatted_news = []
    for art in articles[:20]:
        formatted_news.append({
            "title": art.get("title", "Sem Título"),
            "content": art.get("description") or art.get("content") or "Sem descrição disponível.",
            "url": art.get("url", "#"),
            "category": category if category else "Geral",
            "image_url": art.get("urlToImage") or "https://via.placeholder.com/600x400/000/FFCC00?text=NewsAI",
            "source": art.get("source", {}).get("name", "NewsAPI"),
            "published_at": art.get("publishedAt", "Recentemente")
        })
    return formatted_news
