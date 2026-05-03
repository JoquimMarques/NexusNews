import os
from backend import create_app, db # Importe o db também

app = create_app()

# Garantir que o ficheiro/ diretório da base de dados existe antes de criar tabelas.
# Extrai o caminho se a URI for sqlite:///...
db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
if db_uri.startswith('sqlite:///'):
    db_path = db_uri.replace('sqlite:///', '', 1)
    db_abs = os.path.abspath(db_path)
    db_dir = os.path.dirname(db_abs)
    try:
        os.makedirs(db_dir, exist_ok=True)
        # Garante que o ficheiro existe (touch)
        open(db_abs, 'a').close()
    except Exception as e:
        print(f"Aviso: não foi possível assegurar ficheiro BD: {e}")

# Este bloco garante que as tabelas sejam criadas sempre que o app iniciar
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)