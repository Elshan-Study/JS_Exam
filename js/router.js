function resolveHref(href) {
    try {
        const u = new URL(href, location.href);
        return u.href;
    } catch (e) {
        return new URL(String(href), location.href).href;
    }
}

async function loadPartial(url, selector) {
    try {
        const res = await fetch(resolveHref(url), { cache: 'no-store' });
        if (!res.ok) throw new Error(`Partial not found ${url} (${res.status})`);
        const html = await res.text();
        const target = document.querySelector(selector);
        if (!target) throw new Error(`Selector ${selector} not found`);
        target.innerHTML = html;
        if (typeof applyTranslations === 'function') applyTranslations(target);
        fixLocalPaths(target);
        return html;
    } catch (err) {
        console.error('loadPartial error', err);
        const t = document.querySelector(selector);
        if (t) t.innerHTML = '';
        throw err;
    }
}

function mapToContentUrl(href) {
    if (!href) return 'pages/main.html';
    if (typeof href === 'object' && href.contentUrl) return href.contentUrl;

    let u;
    try {
        u = new URL(href, location.href);
    } catch (e) {
        const cleaned = String(href).replace(/^\/+/, '');
        if (!cleaned) return 'pages/main.html';
        return cleaned.endsWith('.html') ? cleaned : `pages/${cleaned}.html`;
    }

    const p = u.pathname.replace(/\/+$/, '');
    if (p === '' || p === '/' || p.endsWith('/index.html') || p.endsWith('/main.html')) {
        return 'pages/main.html';
    }
    if (p.startsWith('/pages/')) return p.replace(/^\//, '');
    if (p.match(/\.html$/)) return p.replace(/^\//, '');
    const name = p.replace(/^\//, '');
    return `pages/${name}.html`;
}

function mapToDisplayUrl(href) {
    const content = mapToContentUrl(href);
    if (content === 'pages/main.html') return './'; // keep URL clean
    if (content.startsWith('pages/')) return './' + content.replace(/^pages\//, '');
    return './' + content;
}

const APP_SELECTOR = '#app';
const app = document.querySelector(APP_SELECTOR);

async function loadPage(hrefOrContentUrl, addToHistory = true) {
    const contentUrl = mapToContentUrl(hrefOrContentUrl);
    const displayUrl = mapToDisplayUrl(hrefOrContentUrl);

    if (!app) {
        console.error('App container not found:', APP_SELECTOR);
        return;
    }

    try {
        const res = await fetch(resolveHref(contentUrl), { cache: 'no-store' });
        if (!res.ok) {
            app.innerHTML = `<h2>Error ${res.status} loading ${contentUrl}</h2>`;
            console.error('Failed to fetch', contentUrl, res.status);
            return;
        }
        const html = await res.text();
        app.innerHTML = html;

        fixLocalPaths(app);

        if (addToHistory) history.pushState({ contentUrl }, '', displayUrl);
        else history.replaceState({ contentUrl }, '', displayUrl);

        initPageScripts(contentUrl);

        if (typeof renderBreadcrumb === 'function') renderBreadcrumb();
        if (typeof applyTranslations === 'function') applyTranslations();

    } catch (err) {
        console.error('loadPage error', err);
        app.innerHTML = '<h2>Ошибка загрузки страницы</h2>';
    }
}

window.addEventListener('popstate', (e) => {
    const contentUrl = e.state?.contentUrl || mapToContentUrl(location.pathname);
    loadPage(contentUrl, false);
});

document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if (!a) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const href = a.getAttribute('href') || './';
    const contentUrl = mapToContentUrl(href);
    loadPage(contentUrl, true);
});

function initPageScripts(contentUrl) {
    fixLocalPaths();

    if (contentUrl && contentUrl.includes('main.html')) {
        setTimeout(() => {
            try { if (document.querySelector('#heroSlider') && window.Slider) new Slider('#heroSlider'); } catch(e){/*noop*/}
            try { if (document.querySelector('#gamesSlider') && window.Slider) new Slider('#gamesSlider'); } catch(e){/*noop*/}
        }, 60);
        if (typeof initPaginationArticles === 'function') initPaginationArticles('#articles-list', 4);
    }

    const searchEl = document.getElementById('global-search');
    if (searchEl && typeof initGlobalSearch === 'function') initGlobalSearch(searchEl);

    if (typeof initAuth === 'function') initAuth();

    if (typeof applyTranslations === 'function') applyTranslations();

    if (contentUrl && contentUrl.includes('games.html') && typeof initGamesPage === 'function') {
        initGamesPage();
    }

    if (contentUrl && contentUrl.includes('archive.html') && typeof initArchivePage === 'function') {
        initArchivePage();
    }
}

// --- fixLocalPaths
function fixLocalPaths(root) {
    const container = root || document;
    container.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || '';
        if (!src) return;
        if (/^\/(?!\/)/.test(src)) {
            img.setAttribute('src', src.replace(/^\/+/, ''));
        }
    });
    container.querySelectorAll('link[rel="stylesheet"]').forEach(lnk => {
        const href = lnk.getAttribute('href') || '';
        if (/^\/(?!\/)/.test(href)) lnk.setAttribute('href', href.replace(/^\/+/, ''));
    });
    container.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (!href) return;
        if (/^\//.test(href) && !/^(https?:|mailto:|tel:|\/\/)/.test(href)) {
            a.setAttribute('href', href.replace(/^\/+/, ''));
        }
    });
}

window.loadPartial = loadPartial;
window.loadPage = loadPage;
window.mapToContentUrl = mapToContentUrl;
