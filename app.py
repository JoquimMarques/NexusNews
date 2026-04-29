from flask import Flask
from backend import create_app

# Ponto de entrada da aplicação
# Este ficheiro inicializa o servidor Flask usando a fábrica de aplicações definida no backend.

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
