function debounce(fn, wait=250){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

async function loadSearchIndex(){
    try {
        const res = await fetch('/search/index.json');
        if (!res.ok) throw new Error('no index');
        return await res.json();
    } catch (e) {
        console.warn('search index not available, fallback to DOM search');
        return null;
    }
}

function renderSearchResults(results){
    let container = document.getElementById('search-results');
    if (!container) {
        container = document.createElement('div');
        container.id = 'search-results';
        container.style.position = 'absolute';
        container.style.top = '56px';
        container.style.right = '18px';
        container.style.background = 'var(--panel)';
        container.style.minWidth = '240px';
        container.style.maxHeight = '320px';
        container.style.overflowY = 'auto';
        container.style.boxShadow = '0 6px 18px rgba(0,0,0,.2)';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    container.innerHTML = '';
    if (!results || results.length === 0) {
        container.innerHTML = '<div style="padding:10px;color:var(--muted)">Ничего не найдено</div>';
        return;
    }
    results.slice(0,10).forEach(r => {
        const a = document.createElement('a');
        a.href = r.path;
        a.setAttribute('data-link','');
        a.style.display = 'block';
        a.style.padding = '10px';
        a.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
        a.style.color = 'var(--text)';
        a.textContent = r.title + ' — ' + (r.content || '').slice(0,80);
        container.appendChild(a);
    });
}

function initGlobalSearch(inputEl){
    let index = null;
    loadSearchIndex().then(data => index = data);

    const doSearch = () => {
        const q = inputEl.value.trim().toLowerCase();
        if (!q) {
            renderSearchResults([]);
            return;
        }
        if (index) {
            const matched = index.filter(p => {
                const t = (p.title||'').toLowerCase();
                const c = (p.content||'').toLowerCase();
                return t.includes(q) || c.includes(q) || (p.path||'').toLowerCase().includes(q);
            });
            renderSearchResults(matched);
            return;
        }
        const results = [];
        document.querySelectorAll('article, .game-card, .article-card, .game-item').forEach(el => {
            const text = (el.dataset.title || el.textContent || '').toLowerCase();
            if (text.includes(q)) {
                let link = el.querySelector('a[data-link]')?.getAttribute('href') || location.pathname;
                results.push({path: link, title: (el.dataset.title || el.querySelector('h2, h3')?.textContent || 'Страница'), content: (el.textContent||'').slice(0,120)});
            }
        });
        renderSearchResults(results);
    };

    const debounced = debounce(doSearch, 200);
    inputEl.addEventListener('input', debounced);

    document.addEventListener('click', (e) => {
        const sr = document.getElementById('search-results');
        if (!sr) return;
        if (!sr.contains(e.target) && e.target !== inputEl) sr.style.display = 'none';
    });
    inputEl.addEventListener('focus', ()=> { const sr = document.getElementById('search-results'); if (sr) sr.style.display = ''; });
    window.initGlobalSearch = initGlobalSearch;
}
