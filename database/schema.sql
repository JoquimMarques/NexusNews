-- Esquema SQLite para Agregador de Notícias

-- Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    preferences TEXT DEFAULT ''
);

-- Tabela de Artigos de Notícias (Cache/Favoritos)
CREATE TABLE IF NOT EXISTS news_article (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    category TEXT,
    source TEXT,
    image_url TEXT,
    published_at TEXT,
    ai_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Favoritos (Relacionamento N:M entre User e NewsArticle)
CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES news_article (id) ON DELETE CASCADE
);
