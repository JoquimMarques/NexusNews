from backend import create_app, db # Importe o db também

app = create_app()

# Este bloco garante que as tabelas sejam criadas sempre que o app iniciar
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)