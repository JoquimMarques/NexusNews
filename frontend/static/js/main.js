function safeJsonEncode(obj) {
    return encodeURIComponent(JSON.stringify(obj ?? {}));
}

function safeJsonDecode(str) {
    try {
        return JSON.parse(decodeURIComponent(str));
    } catch {
        return null;
    }
}

window.showToast = function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        'success': 'check-circle',
        'error': 'alert-circle',
        'info': 'info'
    };
    const iconName = icons[type] || icons['info'];

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide) {
        window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = window.innerWidth <= 768 ? 'translateY(120%)' : 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    const newsContainer = document.getElementById('news-container');
    const featuredContainer = document.getElementById('featured-container');
    const trendingContainer = document.getElementById('trending-container');
    const searchInput = document.getElementById('global-search');
    const searchBtn = document.getElementById('search-btn');

    const modal = document.getElementById('news-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('#news-modal .close-modal');

    function setModalOpen(isOpen) {
        if (!modal) return;
        modal.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('modal-open', isOpen);
    }

    function openModal(art) {
        if (!modal || !modalBody || !art) return;
        const imageUrl =
            art.image_url ||
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1500';

        const guestNote = window.isAuthenticated === 'false' ? `
            <div class="guest-note">
                Está a navegar como visitante. Faça login para guardar artigos e personalizar o feed.
            </div>
        ` : '';

        modalBody.innerHTML = `
            <div class="modal-meta">
                <span class="source-tag">${art.source ?? ''}</span>
                <span class="dot">•</span>
                <span>${art.published_at ?? ''}</span>
            </div>
            <h2 class="modal-title">${art.title ?? ''}</h2>
            
            <div class="modal-image-wrapper">
                <img class="modal-image" src="${imageUrl}" alt="">
            </div>

            <div class="modal-content-layout">
                <div class="ai-summary-box">
                    <div class="ai-summary-header">
                        <span class="sparkle-icon">✨</span>
                        <h3>Resumo de Inteligência Artificial</h3>
                    </div>
                    <div class="modal-text ai-text">${art.summary || 'Resumo indisponível para esta notícia.'}</div>
                </div>
                ${guestNote}
                <div class="modal-footer-actions">
                    <a href="${art.url ?? '#'}" target="_blank" rel="noreferrer" class="btn-primary read-full">Ler notícia no site original</a>
                    <button type="button" class="btn-secondary fav-btn" data-action="favorite" data-article="${safeJsonEncode(art)}">
                        <span>★ Guardar</span>
                    </button>
                </div>
            </div>
        `;
        setModalOpen(true);
    }

    async function saveFav(art) {
        try {
            const res = await fetch('/api/favorite/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(art),
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                showToast('Faça login para guardar favoritos.', 'info');
                return;
            }

            const data = await res.json();
            if (data?.success) showToast('Adicionado aos favoritos.', 'success');
            else showToast('Já estava nos favoritos (ou ocorreu um erro).', 'info');
        } catch {
            showToast('Erro ao guardar favorito.', 'error');
        }
    }

    function renderPortal(payload) {
        if (!newsContainer || !featuredContainer) return;

        const mode = payload?.mode || 'flat';
        const news = mode === 'flat' ? payload?.items : null;
        const sections = mode === 'grouped' ? payload?.sections : null;

        if ((mode === 'flat' && (!news || news.length === 0)) || (mode === 'grouped' && (!sections || sections.length === 0))) {
            newsContainer.innerHTML = '<p class="empty-state">Nenhuma notícia encontrada.</p>';
            featuredContainer.innerHTML = '';
            return;
        }

        // Cabeçalho da Página
        if (mode === 'grouped') {
            newsContainer.className = 'feed-sections';
            featuredContainer.innerHTML = `
                <section class="all-header">
                    <h1 class="all-title">NexusNews Terminal</h1>
                    <p class="all-subtitle">Fluxo de notícias em tempo real sintetizado por Nexus AI.</p>
                </section>
            `;
            
            newsContainer.innerHTML = sections.map((sec) => `
                <section class="category-section" data-section="${sec.category}">
                    <div class="category-section-header">
                        <h2 class="category-section-title">${sec.category}</h2>
                        <button class="category-section-btn" type="button" data-action="jump" data-category="${sec.category}">Ver mais</button>
                    </div>
                    <div class="category-grid">
                        ${(sec.items || []).map(art => `
                            <article class="story-card js-open-article" data-article="${safeJsonEncode(art)}" role="button" tabindex="0">
                                <div class="story-media">
                                    <img src="${art.image_url || 'https://images.unsplash.com/photo-1585829365234-78d9bce17b8f?auto=format&fit=crop&q=80&w=800'}" alt="">
                                </div>
                                <div class="story-content">
                                    <div class="story-meta">
                                        <span class="kicker">${art.source ?? ''}</span>
                                        <span class="dot">•</span>
                                        <span>${art.published_at ?? ''}</span>
                                    </div>
                                    <h3 class="story-title">${art.title ?? ''}</h3>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>
            `).join('');

            // Secção de Grandes Destaques Globais no fundo
            if (payload.trending && payload.trending.length > 0) {
                newsContainer.innerHTML += `
                    <section class="bottom-highlights-section">
                        <div class="category-section-header">
                            <h2 class="category-section-title">✨ Grandes Destaques Globais</h2>
                        </div>
                        <div class="highlights-grid">
                            ${payload.trending.map(art => `
                                <div class="highlight-card js-open-article" data-article="${safeJsonEncode(art)}" role="button" tabindex="0">
                                    <div class="highlight-img">
                                        <img src="${art.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'}" alt="">
                                    </div>
                                    <div class="highlight-content">
                                        <span class="highlight-source">${art.source}</span>
                                        <h3 class="highlight-title">${art.title}</h3>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                `;
            }
        } else {
            // Modo Individual (Single Category)
            newsContainer.className = 'news-feed';
            featuredContainer.innerHTML = `
                <section class="all-header">
                    <h1 class="all-title">Secção: ${news[0]?.category || 'Destaques'}</h1>
                </section>
            `;

            newsContainer.innerHTML = news.map(art => `
                <article class="story-card js-open-article" data-article="${safeJsonEncode(art)}" role="button" tabindex="0">
                    <div class="story-media">
                        <img src="${art.image_url || 'https://images.unsplash.com/photo-1585829365234-78d9bce17b8f?auto=format&fit=crop&q=80&w=800'}" alt="">
                    </div>
                    <div class="story-content">
                        <div class="story-meta">
                            <span class="kicker">${art.source ?? ''}</span>
                            <span class="dot">•</span>
                            <span>${art.published_at ?? ''}</span>
                        </div>
                        <h3 class="story-title">${art.title ?? ''}</h3>
                    </div>
                </article>
            `).join('');
        }
    }

    window.fetchNews = async function fetchNews(category = '') {
        const loadingOverlay = document.getElementById('loading-overlay');
        
        // Se não houver container de notícias, apenas removemos o overlay (caso exista) e saímos
        if (!newsContainer) {
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            return;
        }

        if (loadingOverlay) loadingOverlay.classList.remove('hidden');

        try {
            const url = category ? `/news?category=${encodeURIComponent(category)}` : '/news';
            const response = await fetch(url);
            const payload = await response.json();
            renderPortal(payload);
        } catch {
            showToast('Erro ao conectar com o Nexus Engine.', 'error');
        } finally {
            if (loadingOverlay) {
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                }, 500);
            }
        }
    };

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.fetchNews(searchInput.value);
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => window.fetchNews(searchInput.value));
    }

    const categoriesWrapper = document.querySelector('.categories-nav-wrapper');
    const carouselContainer = document.querySelector('.carousel-container');

    if (categoriesWrapper && carouselContainer) {
        categoriesWrapper.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="carousel-prev"], [data-action="carousel-next"]');
            if (btn) {
                e.preventDefault();
                const dir = btn.getAttribute('data-action') === 'carousel-next' ? 1 : -1;
                carouselContainer.scrollBy({ left: dir * 260, behavior: 'smooth' });
                return;
            }

            const a = e.target.closest('[data-category]');
            if (!a) return;
            e.preventDefault();
            const cat = a.getAttribute('data-category') || '';
            document.querySelectorAll('.category-pill').forEach((p) => p.classList.remove('active'));
            a.classList.add('active');
            window.fetchNews(cat);
        });
    }

    function handleOpenFromElement(el) {
        const payload = el?.getAttribute?.('data-article');
        const art = payload ? safeJsonDecode(payload) : null;
        if (art) openModal(art);
    }

    document.addEventListener('click', (e) => {
        const openEl = e.target.closest('.js-open-article');
        if (openEl) {
            handleOpenFromElement(openEl);
            return;
        }

        const favBtn = e.target.closest('[data-action="favorite"][data-article]');
        if (favBtn) {
            const art = safeJsonDecode(favBtn.getAttribute('data-article'));
            if (art) saveFav(art);
        }

        const jumpBtn = e.target.closest('[data-action="jump"][data-category]');
        if (jumpBtn) {
            const cat = jumpBtn.getAttribute('data-category');
            const section = document.querySelector(`[data-section="${cat}"]`);
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setModalOpen(false);
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const openEl = document.activeElement?.closest?.('.js-open-article');
        if (openEl) {
            e.preventDefault();
            handleOpenFromElement(openEl);
        }
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) setModalOpen(false);
        });
    }
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => setModalOpen(false));

    // Mobile Menu Logic
    const mobileToggle = document.getElementById('mobile-toggle');
    const navWrapper = document.getElementById('nav-wrapper');

    if (mobileToggle && navWrapper) {
        mobileToggle.addEventListener('click', () => {
            const isActive = navWrapper.classList.toggle('is-active');
            mobileToggle.classList.toggle('is-active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Fechar ao clicar em links
        navWrapper.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                navWrapper.classList.remove('is-active');
                mobileToggle.classList.remove('is-active');
                document.body.style.overflow = '';
            });
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!navWrapper.contains(e.target) && !mobileToggle.contains(e.target) && navWrapper.classList.contains('is-active')) {
                navWrapper.classList.remove('is-active');
                mobileToggle.classList.remove('is-active');
                document.body.style.overflow = '';
            }
        });
    }

    const initialActivePill = document.querySelector('.category-pill.active');
    const initialCat = initialActivePill ? (initialActivePill.getAttribute('data-category') || '') : '';
    window.fetchNews(initialCat);
});
