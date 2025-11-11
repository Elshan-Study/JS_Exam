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
