async function loadPartial(url, selector){
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Partial not found: ' + url);
        const html = await res.text();
        document.querySelector(selector).innerHTML = html;
        return html;
    } catch (e) { console.error(e); }
}

const app = document.getElementById('app');

async function loadPage(url, addToHistory = true){
    try {
        const res = await fetch(url);
        if (!res.ok) {
            app.innerHTML = '<h2>Ошибка загрузки страницы</h2>';
            return;
        }
        const html = await res.text();
        app.innerHTML = html;
        if (addToHistory) history.pushState({url}, '', url);
        initPageScripts(url);
        renderBreadcrumb();
        applyTranslations();
    } catch (e) {
        console.error('loadPage error', e);
        app.innerHTML = '<h2>Ошибка сервера</h2>';
    }
}

window.addEventListener('popstate', (e) => {
    const url = e.state?.url || '/pages/main.html';
    loadPage(url, false);
});

document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    if (href) loadPage(href)
});

function initPageScripts(url){
    if (url && url.includes('main.html')) {
        setTimeout(()=> {
            const s = document.querySelector('#heroSlider');
            if (s && window.Slider) new Slider('#heroSlider');
        }, 60);
    }
    const searchEl = document.getElementById('global-search');
    if (searchEl && window.initGlobalSearch) initGlobalSearch(searchEl);
}
