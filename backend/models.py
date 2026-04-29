from . import db
from flask_login import UserMixin
from datetime import datetime
import bcrypt

# Tabela de associação para Favoritos (User <-> NewsArticle)
favorites_table = db.Table('favorites',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('article_id', db.Integer, db.ForeignKey('news_article.id'), primary_key=True)
)

class User(UserMixin, db.Model):
    """Modelo de utilizador."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Preferências guardadas como string separada por vírgulas (ex: "Tecnologia,Saúde")
    preferences = db.Column(db.String(500), default="")

    # Relacionamento com artigos favoritos
    favorite_articles = db.relationship('NewsArticle', secondary=favorites_table, backref='favorited_by')

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

class NewsArticle(db.Model):
    """Modelo para armazenar artigos de notícias."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=False)
    content = db.Column(db.Text)
    url = db.Column(db.String(500), unique=True, nullable=False)
    category = db.Column(db.String(50))
    source = db.Column(db.String(100))
    image_url = db.Column(db.String(500))
    published_at = db.Column(db.String(50))
    ai_summary = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
