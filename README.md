# 📰 NexusNews — A Tua Janela Inteligente para o Mundo! ⚡

E aí! Bem-vindo(a) ao **NexusNews**, um agregador de notícias feito para quem gosta de ir direto ao ponto sem perder tempo. Cansado de ler textos enormes? O NexusNews junta as melhores notícias em tempo real e usa a Inteligência Artificial (valeu, Google Gemini!) para resumir o que realmente importa. Tudo isto com um visual incrível e super agradável.

---

## 🌟 O que é que o NexusNews faz?

- **🧠 Resumos Inteligentes (IA):** Encontrou uma notícia interessante mas está sem tempo? Clique no botão Mágico ✨ e a nossa IA dá-lhe um resumo fresquinho em segundos!
- **🎨 Visual Premium & Modo Escuro:** Uma interface limpa, botões suaves, animações e o tão aclamado *Modo Escuro* para não cansar a vista à noite.
- **🎯 Só o que te Interessa:** Registe-se, crie a sua conta e escolha as suas categorias preferidas (ex: Tecnologia, Gaming, Desporto). O site vai mostrar logo de cara aquilo de que mais gosta — a secção "Para mim"!
- **❤️ Guardar para mais Tarde:** Não consegue ler agora? Dê um "Guardar" no artigo e ele vai direitinho para a sua pasta de Favoritos pessoal.

---

## 📱 Passo-a-Passo: Como usar o site?

Não tem nenhum segredo, é super fácil:

1. **Bem-vindo à página Inicial:** Ao entrar, logo vai ver um "mix" de todas as categorias na secção "Tudo". Pode explorar à vontade e usar a barra de pesquisa!
2. **Crie a sua Conta 📝:** Vá no botão "Entrar" e faça o seu registo.
3. **Configure as suas Preferências ⚙️:** Depois de entrar, vá ao seu "Perfil". Escolha os temas que mais curte.
4. **Desfrute do Feed "Para mim" 🎉:** Quando voltar à página inicial, a sua primeira aba será "Para mim", feita com os seus temas preferidos!
5. **Ler com IA e Guardar 🤖:** Clique em qualquer notícia para ver os detalhes, ler o resumo gerado pelo Gemini, ler a matéria original ou apenas clicar em "Guardar" se quiser ver depois nos seus **Favoritos**.

---

## 🛠️ Tecnologias que usamos (Os bastidores)

- **Backend:** Python + Flask (Rápido e direto!)
- **Banco de Dados:** SQLite (Perfeito para gerir contas e favoritos)
- **IA Magia:** API do Google Gemini (Resumos super avançados)
- **Frontend (A Cara do Site):** HTML5, CSS3 super detalhado, JavaScript Puro e Ícones da biblioteca *Lucide*.
- **E muito carinho na responsividade para Telemóveis!**

---

## 🚀 Como testar no teu próprio computador (Para os Devs!)

Quer ver o código a funcionar na sua máquina? Siga estes passos simples:

1. **Faça um Clone desta maravilha:**
   ```bash
   git clone <o-link-deste-repositorio>
   cd NexusNews
   ```

2. **Crie a sua bolha (Ambiente Virtual):**
   ```bash
   python -m venv venv
   # No Windows:
   .\venv\Scripts\activate
   # No Mac/Linux:
   source venv/bin/activate
   ```

3. **Instale as ferramentas necessárias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **O Segredo (API Key):**
   Crie um ficheiro chamado `.env` na raiz do projeto e cole a sua chave do Gemini lá dentro:
   ```env
   GEMINI_API_KEY=sua_chave_secreta_aqui
   ```

5. **Prepare o Banco de Dados:**
   ```bash
   python -c "from database.schema import init_db; init_db()"
   ```

6. **Ligue os Motores! 🏎️**
   ```bash
   python app.py
   ```
   *Agora é só abrir `http://localhost:5000` no seu navegador!*

---

**© 2026 NexusNews - Todos os direitos reservados.**
Um abraço forte do grupo! Se encontrar problemas... bem, já estamos a resolvê-los! 😄
