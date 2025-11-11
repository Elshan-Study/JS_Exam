function initGamesPage() {
    const container = document.querySelector('.games-list');
    if (!container) return;

    const articles = Array.from(container.querySelectorAll('.article'));
    const searchInput = document.getElementById('games-search');

    function showList(list) {
        articles.forEach(a => a.style.display = list.includes(a) ? '' : 'none');
    }

    function doSearch(q) {
        const s = (q || '').trim().toLowerCase();
        if (!s) return articles;
        return articles.filter(a => {
            const title = (a.dataset.title || '').toLowerCase();
            const sys = (a.dataset.system || '').toLowerCase();
            const master = (a.dataset.master || '').toLowerCase();
            const desc = (a.querySelector('.desc')?.textContent || '').toLowerCase();
            return title.includes(s) || sys.includes(s) || master.includes(s) || desc.includes(s);
        });
    }

    function parseDate(a) {
        const v = a.dataset.date;
        return v ? new Date(v).getTime() : 0;
    }
    function parsePlayers(a) {
        const v = parseInt(a.dataset.players || '0', 10);
        return isNaN(v) ? 0 : v;
    }

    function sortArticles(by, order = 'asc') {
        const arr = Array.from(articles);
        arr.sort((A,B) => {
            if (by === 'date') {
                return parseDate(A) - parseDate(B);
            } else if (by === 'players') {
                return parsePlayers(A) - parsePlayers(B);
            } else {
                const va = (A.dataset[by] || '').toLowerCase();
                const vb = (B.dataset[by] || '').toLowerCase();
                return va.localeCompare(vb);
            }
        });
        if (order === 'desc') arr.reverse();
        const parent = container;
        arr.forEach(n => parent.insertBefore(n, parent.querySelector('.content-footer')));
        return arr;
    }

    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const list = doSearch(e.target.value);
                showList(list);
                // rebuild pagination on filtered list
                if (typeof initPaginationArticles === 'function') {
                    // we'll call pagination with perPage 4
                    initPaginationArticles('#games-list', 4);
                }
            }, 180);
        });
    }

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const by = btn.dataset.sort;
            const order = btn.dataset.order || 'asc';
            sortArticles(by, order);
            // toggle order for next click
            btn.dataset.order = order === 'asc' ? 'desc' : 'asc';
        });
    });

    function getCurrentUserLocal() {
        try {
            return JSON.parse(localStorage.getItem('rpa_current_user') || 'null');
        } catch (e) { return null; }
    }

    container.querySelectorAll('.join-btn').forEach(b => {
        b.addEventListener('click', (e) => {
            const cur = getCurrentUserLocal();
            if (!cur) {
                if (typeof showAuthModal === 'function') showAuthModal();
                else alert('Please login first');
                return;
            }
            b.classList.add('joined');
            b.textContent = TRANSLATIONS?.joined_btn || 'ПРИСОЕДИНЕН';
            b.disabled = true;
        });
    });

    if (typeof initPaginationArticles === 'function') initPaginationArticles('#games-list', 4);
}

window.initGamesPage = initGamesPage;
