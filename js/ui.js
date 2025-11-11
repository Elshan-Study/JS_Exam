function initScrollTop(){
    const btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', ()=> {
        btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
}

function renderBreadcrumb(){
    const bc = document.getElementById('breadcrumb');
    if (!bc) return;
    const path = location.pathname.replace(/\/+$/,'');
    const parts = path.split('/').filter(Boolean);
    const links = [];
    let accum = '';
    parts.forEach((p, i) => {
        accum += '/' + p;
        const name = p.replace(/\.html$/,'').replace(/-/g,' ');
        links.push(`<a href="${accum}" data-link>${name}</a>`);
    });
    if (links.length === 0) bc.innerHTML = '<span>Главная</span>';
    else bc.innerHTML = links.join(' › ');
}

// client-side pagination for article list
function initPaginationArticles(containerSelector = '#articles-list', perPage = 4) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const articles = Array.from(container.querySelectorAll('.article-card'));
    if (!articles.length) return;

    let footerHolder = container.querySelector('.content-footer');
    if (!footerHolder) {
        footerHolder = document.createElement('div');
        footerHolder.className = 'content-footer';
        container.appendChild(footerHolder);
    }
    footerHolder.innerHTML = '';

    const total = articles.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    let current = 1;

    function renderPage(page) {
        current = Math.min(Math.max(1, page), pages);
        articles.forEach((a, i) => {
            const pageIndex = Math.floor(i / perPage) + 1;
            a.style.display = pageIndex === current ? '' : 'none';
        });
        renderControls();
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderControls() {
        footerHolder.innerHTML = '';
        const prev = document.createElement('button');
        prev.textContent = '‹';
        prev.disabled = current === 1;
        prev.addEventListener('click', () => renderPage(current - 1));
        footerHolder.appendChild(prev);

        const maxButtons = 7;
        const half = Math.floor(maxButtons / 2);
        let start = Math.max(1, current - half);
        let end = Math.min(pages, start + maxButtons - 1);
        if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

        for (let p = start; p <= end; p++) {
            const b = document.createElement('button');
            b.textContent = String(p);
            if (p === current) b.disabled = true;
            b.addEventListener('click', () => renderPage(p));
            footerHolder.appendChild(b);
        }

        const next = document.createElement('button');
        next.textContent = '›';
        next.disabled = current === pages;
        next.addEventListener('click', () => renderPage(current + 1));
        footerHolder.appendChild(next);
    }

    articles.forEach(a => a.style.display = 'none');
    renderPage(1);

    return { renderPage };
}

window.initPaginationArticles = initPaginationArticles;

