import os
import sys

# Adiciona o diretório raiz ao path para encontrar o pacote 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend import create_app, db

app = create_app()

def init_db():
    """
    Limpa e reinicializa a base de dados com o esquema completo.
    """
    with app.app_context():
        print("Limpando base de dados antiga...")
        db.drop_all() # Remove todas as tabelas antigas
        
        print("Criando novas tabelas com esquema atualizado...")
        db.create_all() # Cria as tabelas com todas as colunas novas
        
        print("Base de dados inicializada com sucesso!")

if __name__ == "__main__":
    init_db()
