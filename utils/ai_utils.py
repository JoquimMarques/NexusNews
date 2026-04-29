import requests
import json
from flask import current_app

def summarize_article(title, text):
    """
    Usa o modelo Gemini via OpenRouter para resumir a notícia.
    """
    api_key = current_app.config.get('OPENROUTER_API_KEY')
    model = current_app.config.get('AI_MODEL')
    
    if not api_key or not text or len(text) < 50:
        return text if text else "Sem conteúdo disponível para resumir."

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000", # Necessário para OpenRouter
        "X-Title": "NewsAI Aggregator"
    }
    
    prompt = f"""
    Como um jornalista especializado em resumos, resuma a seguinte notícia em apenas um parágrafo curto e impactante (máximo 3 linhas). 
    Foca nos factos principais. Escreve em Português de Portugal.
    
    Título: {title}
    Conteúdo: {text}
    
    Resumo:
    """

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 150
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
        response.raise_for_status()
        result = response.json()
        
        summary = result['choices'][0]['message']['content'].strip()
        return summary
    except Exception as e:
        print(f"Erro ao gerar resumo IA: {e}")
        # Se falhar a IA, retorna o texto original cortado como fallback
        return text[:200] + "..." if text else "Erro ao processar resumo."
