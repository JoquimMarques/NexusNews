from . import db
from .models import User, NewsArticle

def save_user(username, email, password):
    """CRUD: Guardar novo utilizador."""
    try:
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return new_user
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao guardar utilizador: {e}")
        return None

def validate_login(username, password):
    """CRUD: Validar credenciais de login."""
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return user
    return None

def save_favorite(user_id, article_data):
    """CRUD: Guardar artigo nos favoritos de um utilizador."""
    try:
        user = User.query.get(user_id)
        if not user: return False

        # Verificar se o artigo já existe na base de dados global
        article = NewsArticle.query.filter_by(url=article_data['url']).first()
        if not article:
            article = NewsArticle(
                title=article_data['title'],
                content=article_data.get('content'),
                url=article_data['url'],
                category=article_data.get('category'),
                source=article_data.get('source'),
                image_url=article_data.get('image_url'),
                published_at=article_data.get('published_at'),
                ai_summary=article_data.get('summary')
            )
            db.session.add(article)
            db.session.flush() # Para obter o ID do artigo

        # Adicionar à lista de favoritos do utilizador se ainda não estiver lá
        if article not in user.favorite_articles:
            user.favorite_articles.append(article)
            db.session.commit()
            return True
        return False
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao guardar favorito: {e}")
        return False

def get_user_favorites(user_id):
    """CRUD: Buscar todos os favoritos de um utilizador."""
    user = User.query.get(user_id)
    return user.favorite_articles if user else []

def update_user_preferences(user_id, categories_list):
    """CRUD: Atualizar categorias de interesse."""
    try:
        user = User.query.get(user_id)
        if user:
            user.preferences = ",".join(categories_list)
            db.session.commit()
            return True
        return False
    except Exception as e:
        db.session.rollback()
        return False
