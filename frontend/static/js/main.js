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

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const featuredContainer = document.getElementById('featured-container');
    const trendingContainer = document.getElementById('trending-container');
    const searchInput = document.getElementById('global-search');
    const searchBtn = document.getElementById('search-btn');
    const categoriesNav = document.querySelector('.categories-nav');

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

        modalBody.innerHTML = `
            <div class="modal-meta">
                <span>${art.source ?? ''}</span>
                <span class="dot">•</span>
                <span>${art.published_at ?? ''}</span>
            </div>
            <h2 class="modal-title">${art.title ?? ''}</h2>
            <img class="modal-image" src="${imageUrl}" alt="">
            <div class="modal-text">${art.summary ?? ''}</div>
            <div class="modal-actions">
                <a href="${art.url ?? '#'}" target="_blank" rel="noreferrer" class="btn-primary btn-block">Ler reportagem completa</a>
                <button type="button" class="btn-secondary btn-icon" data-action="favorite" data-article="${safeJsonEncode(art)}" aria-label="Guardar nos favoritos">★</button>
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
            const data = await res.json();
            if (data?.success) showToast('Adicionado aos favoritos.', 'success');
            else showToast('Já estava nos favoritos (ou ocorreu um erro).', 'info');
        } catch {
            showToast('Erro ao guardar favorito.', 'error');
        }
    }

    function renderPortal(payload) {
        if (!newsContainer || !featuredContainer || !trendingContainer) return;

        const mode = payload?.mode || 'flat';
        const news = mode === 'flat' ? payload?.items : null;
        const sections = mode === 'grouped' ? payload?.sections : null;

        if ((mode === 'flat' && (!news || news.length === 0)) || (mode === 'grouped' && (!sections || sections.length === 0))) {
            newsContainer.innerHTML = '<p class="empty-state">Nenhuma notícia encontrada.</p>';
            featuredContainer.innerHTML = '';
            trendingContainer.innerHTML = '';
            return;
        }

        if (mode === 'grouped') {
            newsContainer.classList.remove('news-feed');
            newsContainer.classList.add('feed-sections');

            // "Tudo": secções por categoria para encher o feed
            featuredContainer.innerHTML = `
                <section class="all-header">
                    <h1 class="all-title">Todas as categorias</h1>
                    <p class="all-subtitle">Últimas notícias, organizadas por tema.</p>
                </section>
            `;

            const flatForTrending = sections.flatMap((s) => s.items || []);
            const trending = flatForTrending.slice(0, 8);
            trendingContainer.innerHTML = trending
                .map(
                    (art, idx) => `
                <div class="trend-item js-open-article" data-article="${safeJsonEncode(art)}" role="button" tabindex="0">
                    <div class="trend-rank">${String(idx + 1).padStart(2, '0')}</div>
                    <div class="trend-body">
                        <h4 class="trend-title">${art.title ?? ''}</h4>
                        <p class="trend-source">${art.source ?? ''}</p>
                    </div>
                </div>
            `
                )
                .join('');

            newsContainer.innerHTML = sections
                .map((sec) => {
                    const items = (sec.items || []).slice(0, 8);
                    return `
                        <section class="category-section" data-section="${sec.category}">
                            <div class="category-section-header">
                                <h2 class="category-section-title">${sec.category}</h2>
                                <button class="category-section-btn" type="button" data-action="jump" data-category="${sec.category}">Ver mais</button>
                            </div>
                            <div class="category-grid">
                                ${items
                                    .map(
                                        (art) => `
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
                                            <p class="story-excerpt">${art.summary ?? ''}</p>
                                        </div>
                                    </article>
                                `
                                    )
                                    .join('')}
                            </div>
                        </section>
                    `;
                })
                .join('');

            return;
        }

        newsContainer.classList.remove('feed-sections');
        newsContainer.classList.add('news-feed');

        const heroMain = news[0];
        const heroSideA = news[1];
        const heroSideB = news[2];

        featuredContainer.innerHTML = `
            <section class="mag-hero">
                <div class="mag-hero-grid">
                    <article class="hero-main js-open-article" data-article="${safeJsonEncode(heroMain)}" role="button" tabindex="0">
                        <div class="hero-media">
                            <img src="${
                                heroMain?.image_url ||
                                'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1500'
                            }" alt="">
                        </div>
                        <div class="hero-content">
                            <div class="hero-meta">
                                <span class="kicker">${heroMain?.source ?? ''}</span>
                                <span class="dot">•</span>
                                <span>${heroMain?.published_at ?? ''}</span>
                            </div>
                            <h1 class="hero-title">${heroMain?.title ?? ''}</h1>
                            <p class="hero-summary">${heroMain?.summary ?? ''}</p>
                        </div>
                    </article>

                    <div class="hero-side">
                        ${
                            [heroSideA, heroSideB]
                                .filter(Boolean)
                                .map(
                                    (art) => `
                            <article class="hero-mini js-open-article" data-article="${safeJsonEncode(art)}" role="button" tabindex="0">
                                <div class="hero-mini-media">
                                    <img src="${
                                        art?.image_url ||
                                        'https://images.unsplash.com/photo-1585829365234-78d9bce17b8f?auto=format&fit=crop&q=80&w=800'
                                    }" alt="">
                                </div>
                                <div class="hero-mini-content">
                                    <div class="hero-mini-meta">${art?.source ?? ''} <span class="dot">•</span> ${
                                        art?.published_at ?? ''
                                    }</div>
                                    <h3 class="hero-mini-title">${art?.title ?? ''}</h3>
                                </div>
                            </article>
                        `
                                )
                                .join('')
                        }
                    </div>
                </div>
            </section>
        `;

        const feedNews = news.slice(3, 15);
        newsContainer.innerHTML = feedNews
            .map(
                (art) => `
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
                    <h2 class="story-title">${art.title ?? ''}</h2>
                    <p class="story-excerpt">${art.summary ?? ''}</p>
                </div>
            </article>
        `
            )
            .join('');

        const trending = news.slice(15, 20);
        trendingContainer.innerHTML = trending
            .map(
                (art, idx) => `
            <div class="trend-item js-open-article" data-article="${safeJsonEncode(art)}" role="button" tabindex="0">
                <div class="trend-rank">${String(idx + 1).padStart(2, '0')}</div>
                <div class="trend-body">
                    <h4 class="trend-title">${art.title ?? ''}</h4>
                    <p class="trend-source">${art.source ?? ''}</p>
                </div>
            </div>
        `
            )
            .join('');
    }

    window.fetchNews = async function fetchNews(category = '') {
        if (!newsContainer) return;

        newsContainer.innerHTML = '<p class="loading-state">A atualizar portal com IA…</p>';

        try {
            const url =
                category
                    ? `/news?category=${encodeURIComponent(category)}`
                    : '/news';
            const response = await fetch(url);
            const payload = await response.json();
            renderPortal(payload);
        } catch {
            showToast('Erro ao carregar o portal.', 'error');
        }
    };

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => window.fetchNews(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.fetchNews(searchInput.value);
        });
    }

    if (categoriesNav) {
        categoriesNav.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="carousel-prev"], [data-action="carousel-next"]');
            if (btn) {
                e.preventDefault();
                const dir = btn.getAttribute('data-action') === 'carousel-next' ? 1 : -1;
                categoriesNav.scrollBy({ left: dir * 260, behavior: 'smooth' });
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

    window.fetchNews();
});
