function debounce(fn, wait=250){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

function initGlobalSearch(inputEl){
    const gamesContainer = document.getElementById('games-list');
    const articlesContainer = document.getElementById('articles-list');

    const doSearch = () => {
        const q = inputEl.value.trim().toLowerCase();
        if (gamesContainer) {
            const cards = gamesContainer.querySelectorAll('.game-card');
            cards.forEach(card => {
                const title = (card.dataset.title || '').toLowerCase();
                const tags = (card.dataset.tags || '').toLowerCase();
                const desc = (card.querySelector('.desc')?.textContent || '').toLowerCase();
                const match = !q || title.includes(q) || tags.includes(q) || desc.includes(q);
                card.style.display = match ? '' : 'none';
            });
        }
        if (articlesContainer) {
            const items = articlesContainer.querySelectorAll('.article-card');
            items.forEach(a => {
                const title = (a.dataset.title || a.querySelector('h2')?.textContent || '').toLowerCase();
                const body = (a.querySelector('p')?.textContent || '').toLowerCase();
                const match = !q || title.includes(q) || body.includes(q);
                a.style.display = match ? '' : 'none';
            });
        }
    };

    const debounced = debounce(doSearch, 200);
    inputEl.addEventListener('input', debounced);

    if (inputEl.value) doSearch();
}

window.initGlobalSearch = initGlobalSearch;
