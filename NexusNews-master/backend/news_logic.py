import time
import random
import concurrent.futures
from utils.api_client import fetch_news_from_api
from utils.ai_utils import summarize_article
from .models import db, NewsArticle
from flask import current_app

# Cache em memória (válido por 30 minutos agora para poupar a API)
API_CACHE = {}
CACHE_DURATION = 1800 # 30 minutos

# Bloqueio global de API (se batermos no limite de 429)
API_BLOCKED_UNTIL = 0

def fetch_category_task(app, cat, per_category=10, ai_limit=3):
    """
    Task inteligente: Prioriza Cache -> DB (se API bloqueada) -> API -> DB (Fallback).
    """
    global API_BLOCKED_UNTIL
    with app.app_context():
        now = time.time()
        
        # 1. Verificar Cache em Memória
        if cat in API_CACHE:
            cached_data, timestamp = API_CACHE[cat]
            if now - timestamp < CACHE_DURATION:
                return process_articles_with_cache(cached_data, max_items=per_category, max_ai_items=ai_limit, category_name=cat)

        # 2. Se a API estiver em "quarentena" por 429, usa a DB sem tentar a API
        if now < API_BLOCKED_UNTIL:
            print(f"[NEXUS] API em quarentena. Usando DB para: {cat}")
            return fetch_from_db(cat, per_category)

        try:
            # 3. Tentar API com pequenos intervalos
            time.sleep(random.uniform(0.5, 1.5))
            print(f"[NEXUS] Consultando Nexus Engine para: {cat}")
            raw_news = fetch_news_from_api(cat)
            
            if not raw_news:
                raise Exception("API retornou vazio ou erro")
            
            # Guardar em Cache de Memória
            API_CACHE[cat] = (raw_news, now)
            return process_articles_with_cache(raw_news, max_items=per_category, max_ai_items=ai_limit, category_name=cat)

        except Exception as e:
            # Se for erro de Rate Limit (429), bloqueamos a API por 5 minutos
            if "429" in str(e):
                print(f"[AVISO] Nexus Engine bloqueado (429). Quarentena de 5 min iniciada.")
                API_BLOCKED_UNTIL = now + 300 # 5 minutos
            
            print(f"[FALLBACK] Nexus Engine falhou para {cat}. Usando DB.")
            return fetch_from_db(cat, per_category)

def fetch_from_db(cat, limit):
    """Auxiliar para buscar na base de dados."""
    cached_articles = NewsArticle.query.filter_by(category=cat).order_by(NewsArticle.published_at.desc()).limit(limit).all()
    if not cached_articles:
        return []
    return [{
        "title": art.title,
        "content": art.content,
        "url": art.url,
        "category": art.category,
        "source": art.source,
        "image_url": art.image_url,
        "published_at": art.published_at,
        "summary": art.ai_summary or (art.content[:200] if art.content else "")
    } for art in cached_articles]

def process_articles_with_cache(raw_news, max_items=100, max_ai_items=5, category_name=None):
    """Processa e guarda artigos no cache persistente."""
    processed_news = []
    for idx, article in enumerate(raw_news[:max_items]):
        existing_article = NewsArticle.query.filter_by(url=article['url']).first()
        if existing_article and existing_article.ai_summary:
            article['summary'] = existing_article.ai_summary
        else:
            if idx < max_ai_items:
                article['summary'] = summarize_article(article['title'], article.get('content'))
            else:
                article['summary'] = article.get('content') or "Sem descrição disponível."
            
            try:
                if not existing_article:
                    new_cache = NewsArticle(
                        title=article['title'],
                        content=article['content'],
                        url=article['url'],
                        category=category_name or article.get('category'),
                        source=article.get('source'),
                        image_url=article.get('image_url'),
                        published_at=article.get('published_at'),
                        ai_summary=article['summary'] if idx < max_ai_items else None
                    )
                    db.session.add(new_cache)
                elif idx < max_ai_items:
                    existing_article.ai_summary = article['summary']
                db.session.commit()
            except Exception:
                db.session.rollback()
        processed_news.append(article)
    return processed_news

def get_latest_news(category=None):
    app = current_app._get_current_object()
    return fetch_category_task(app, category, per_category=50, ai_limit=10)

def get_latest_news_grouped(categories, per_category=10):
    """Agrupamento inteligente: Reduzido paralelismo para evitar 429."""
    sections = []
    app = current_app._get_current_object()
    
    # Reduzido para apenas 2 workers para não bombardear a API
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_to_cat = {executor.submit(fetch_category_task, app, cat, per_category, 3): cat for cat in categories}
        for future in concurrent.futures.as_completed(future_to_cat):
            cat = future_to_cat[future]
            try:
                items = future.result()
                if items:
                    sections.append({"category": cat, "items": items})
            except Exception as exc:
                print(f"Erro Nexus {cat}: {exc}")

    sections.sort(key=lambda x: categories.index(x['category']))
    return sections

def get_latest_news_mixed(categories, limit=12):
    """Versão otimizada para o feed de destaques."""
    all_news = []
    app = current_app._get_current_object()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(fetch_category_task, app, cat, 5, 1) for cat in categories]
        for future in concurrent.futures.as_completed(futures):
            items = future.result()
            if items: all_news.extend(items)
    
    seen = set()
    unique = [x for x in all_news if not (x['url'] in seen or seen.add(x['url']))]
    unique.sort(key=lambda x: x.get('published_at', ''), reverse=True)
    return unique[:limit]



