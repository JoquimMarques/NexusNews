from flask import Blueprint, render_template, jsonify, request, redirect, url_for, flash
from flask_login import login_required, current_user
from .news_logic import get_latest_news, get_latest_news_grouped, get_latest_news_mixed
from .db_operations import update_user_preferences, save_favorite, get_user_favorites
from .models import db, NewsArticle

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """
    Página Principal.
    Permite que visitantes explorem categorias e notícias sem precisar de login.
    """
    return render_template('index.html')

@main_bp.route('/dashboard')
@login_required
def dashboard():
    """Painel do utilizador com resumo das atividades."""
    return render_template('dashboard.html')

@main_bp.route('/preferences', methods=['GET', 'POST'])
@login_required
def preferences():
    """Página de seleção de categorias preferidas."""
    if request.method == 'POST':
        selected_categories = request.form.getlist('categories')
        if selected_categories:
            update_user_preferences(current_user.id, selected_categories)
            flash('Preferências guardadas com sucesso!', 'success')
            return redirect(url_for('main.index'))
        else:
            flash('Por favor, selecione pelo menos uma categoria.', 'error')
            
    return render_template('preferences.html')

@main_bp.route('/news')
def news_api():
    """Endpoint JSON público que retorna notícias baseadas na categoria selecionada."""
    category = request.args.get('category')
    
    # Regras:
    # - Sem categoria ou categoria "Tudo": devolve feed cheio, agrupado por categorias
    # - Categoria específica: devolve notícias dessa categoria
    if category and category.strip().lower() == 'tudo':
        categories = ['Mundo', 'Economia', 'Tecnologia', 'IA', 'Ciência', 'Saúde', 'Gaming', 'Cultura', 'Cinema', 'Desporto']
        sections = get_latest_news_grouped(categories, per_category=40)
        trending = get_latest_news_mixed(categories, limit=12)
        return jsonify({"mode": "grouped", "sections": sections, "trending": trending})
    elif category and category.strip().lower() == 'para mim':
        if current_user.is_authenticated and current_user.preferences:
            categories = current_user.preferences.split(',')
            sections = get_latest_news_grouped(categories, per_category=40)
            trending = get_latest_news_mixed(categories, limit=12)
            return jsonify({"mode": "grouped", "sections": sections, "trending": trending})
        else:
            categories = ['Mundo', 'Economia', 'Tecnologia', 'IA', 'Ciência', 'Saúde', 'Gaming', 'Cultura', 'Cinema', 'Desporto']
            sections = get_latest_news_grouped(categories, per_category=40)
            trending = get_latest_news_mixed(categories, limit=12)
            return jsonify({"mode": "grouped", "sections": sections, "trending": trending})
    elif not category:
        categories = ['Mundo', 'Economia', 'Tecnologia', 'IA', 'Ciência', 'Saúde', 'Gaming', 'Cultura', 'Cinema', 'Desporto']
        sections = get_latest_news_grouped(categories, per_category=40)
        trending = get_latest_news_mixed(categories, limit=12)
        return jsonify({"mode": "grouped", "sections": sections, "trending": trending})
    else:
        news = get_latest_news(category)
        return jsonify({"mode": "flat", "items": news})
@main_bp.route('/favorites')
@login_required
def favorites():
    """Página que lista os artigos guardados pelo utilizador."""
    favs = get_user_favorites(current_user.id)
    return render_template('favorites.html', favorites=favs)

@main_bp.route('/api/favorite/add', methods=['POST'])
@login_required
def add_favorite():
    """Endpoint para guardar um favorito via AJAX."""
    data = request.json
    success = save_favorite(current_user.id, data)
    return jsonify({"success": success})

@main_bp.route('/api/favorite/remove/<int:article_id>', methods=['POST'])
@login_required
def remove_favorite(article_id):
    """Endpoint para remover um favorito."""
    article = NewsArticle.query.get(article_id)
    if article and article in current_user.favorite_articles:
        current_user.favorite_articles.remove(article)
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False})
