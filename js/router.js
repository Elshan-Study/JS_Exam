// js/router.js — универсальный роутер, использует относительные пути и фиксит ресурсы
// Exposes: window.loadPartial, window.loadPage

// helper: fetch relative to current document (handles project subpaths)
function resolveHref(href) {
    // if already an absolute URL with origin, return it
    try {
        const u = new URL(href, location.href);
        return u.href;
    } catch (e) {
        // fallback: ensure string
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
        // apply translations for this partial (if translations already loaded)
        if (typeof applyTranslations === 'function') applyTranslations(target);
        // fix local resource paths inside the partial (remove leading slashes)
        fixLocalPaths(target);
        return html;
    } catch (err) {
        console.error('loadPartial error', err);
        const t = document.querySelector(selector);
        if (t) t.innerHTML = '';
        throw err;
    }
}

// map a user-provided href to a content URL (relative to document)
function mapToContentUrl(href) {
    if (!href) return 'pages/main.html';
    // if object with contentUrl
    if (typeof href === 'object' && href.contentUrl) return href.contentUrl;

    // try to resolve to a pathname relative to current document location
    let u;
    try {
        u = new URL(href, location.href);
    } catch (e) {
        // fallback treat as plain string
        const cleaned = String(href).replace(/^\/+/, '');
        if (!cleaned) return 'pages/main.html';
        return cleaned.endsWith('.html') ? cleaned : `pages/${cleaned}.html`;
    }

    // if root or index or main -> canonical main file
    const p = u.pathname.replace(/\/+$/, '');
    if (p === '' || p === '/' || p.endsWith('/index.html') || p.endsWith('/main.html')) {
        return 'pages/main.html';
    }
    // if path already points to pages/... use without leading slash
    if (p.startsWith('/pages/')) return p.replace(/^\//, '');
    // if ends with .html -> remove leading slash
    if (p.match(/\.html$/)) return p.replace(/^\//, '');
    // else map to pages/<name>.html
    const name = p.replace(/^\//, '');
    return `pages/${name}.html`;
}

// display url for history (friendly). We'll use path relative to origin
function mapToDisplayUrl(href) {
    const content = mapToContentUrl(href);
    if (content === 'pages/main.html') return './'; // keep URL clean
    // show without pages/ prefix
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

        // fix local resource paths inside loaded page (images/links that start with /)
        fixLocalPaths(app);

        // pushState (store contentUrl for popstate)
        if (addToHistory) history.pushState({ contentUrl }, '', displayUrl);
        else history.replaceState({ contentUrl }, '', displayUrl);

        initPageScripts(contentUrl);

        // breadcrumbs and i18n
        if (typeof renderBreadcrumb === 'function') renderBreadcrumb();
        if (typeof applyTranslations === 'function') applyTranslations();

    } catch (err) {
        console.error('loadPage error', err);
        app.innerHTML = '<h2>Ошибка загрузки страницы</h2>';
    }
}

// popstate
window.addEventListener('popstate', (e) => {
    const contentUrl = e.state?.contentUrl || mapToContentUrl(location.pathname);
    loadPage(contentUrl, false);
});

// internal navigation: delegate clicks on a[data-link]
document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if (!a) return;
    // allow ctrl/meta clicks
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const href = a.getAttribute('href') || './';
    const contentUrl = mapToContentUrl(href);
    loadPage(contentUrl, true);
});

// Called after injecting page content
function initPageScripts(contentUrl) {
    // repair resource paths again just in case
    fixLocalPaths();

    // init slider(s) on main
    if (contentUrl && contentUrl.includes('main.html')) {
        setTimeout(() => {
            try { if (document.querySelector('#heroSlider') && window.Slider) new Slider('#heroSlider'); } catch(e){/*noop*/}
            try { if (document.querySelector('#gamesSlider') && window.Slider) new Slider('#gamesSlider'); } catch(e){/*noop*/}
        }, 60);
    }

    // init global search
    const searchEl = document.getElementById('global-search');
    if (searchEl && typeof initGlobalSearch === 'function') initGlobalSearch(searchEl);

    // init auth UI
    if (typeof initAuth === 'function') initAuth();

    // apply translations (again)
    if (typeof applyTranslations === 'function') applyTranslations();
}

// --- fixLocalPaths: removes leading slash from local resource URLs so they resolve under current project path ---
// This helps when server serves project under non-root path (IDE servers).
function fixLocalPaths(root) {
    const container = root || document;
    // images
    container.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || '';
        if (!src) return;
        // if src begins with "/" but not with "//" (protocol)
        if (/^\/(?!\/)/.test(src)) {
            img.setAttribute('src', src.replace(/^\/+/, ''));
        }
    });
    // script/link tags (only when present inside page partials)
    container.querySelectorAll('link[rel="stylesheet"]').forEach(lnk => {
        const href = lnk.getAttribute('href') || '';
        if (/^\/(?!\/)/.test(href)) lnk.setAttribute('href', href.replace(/^\/+/, ''));
    });
    // anchors that point to internal HTML files starting with "/pages" or "/"
    container.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (!href) return;
        // fix internal links that start with slash and reference local files
        if (/^\//.test(href) && !/^(https?:|mailto:|tel:|\/\/)/.test(href)) {
            a.setAttribute('href', href.replace(/^\/+/, ''));
        }
    });
}

// expose
window.loadPartial = loadPartial;
window.loadPage = loadPage;
window.mapToContentUrl = mapToContentUrl;
