from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import Config

# Inicialização das extensões
db = SQLAlchemy()
login_manager = LoginManager()

def create_app(config_class=Config):
    """
    Fábrica de Aplicação Flask.
    Configura a aplicação, inicializa extensões e regista Blueprints.
    """
    app = Flask(__name__, 
                template_folder='../frontend/templates', 
                static_folder='../frontend/static')
    app.config.from_object(config_class)

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    # Registo de Blueprints (Rotas)
    from backend.routes import main_bp
    from backend.auth import auth_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)

    return app

@login_manager.user_loader
def load_user(user_id):
    from backend.models import User
    return User.query.get(int(user_id))
