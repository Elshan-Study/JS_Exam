function initArchivePage() {
    const container = document.querySelector('.archive-list');
    if (!container) return;

    const items = Array.from(container.querySelectorAll('.article'));
    const searchEl = document.getElementById('archive-search');
    const tagListEl = document.getElementById('tag-list');

    const tagSet = new Set();
    items.forEach(it => {
        const tags = (it.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(t => tagSet.add(t));
    });

    tagListEl.innerHTML = '';
    const tagsArray = Array.from(tagSet).sort();
    tagsArray.forEach(t => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tag-btn';
        btn.dataset.tag = t;
        btn.textContent = t;
        tagListEl.appendChild(btn);
    });

    let activeTag = null;

    function setActiveTag(tag) {
        activeTag = tag || null;
        tagListEl.querySelectorAll('.tag-btn').forEach(b => {
            if (b.dataset.tag === activeTag) b.classList.add('active');
            else b.classList.remove('active');
        });
    }

    function filterList(q = '', tag = null) {
        const s = (q || '').trim().toLowerCase();
        items.forEach(it => {
            const title = (it.dataset.title || '').toLowerCase();
            const sys = (it.dataset.system || '').toLowerCase();
            const desc = (it.querySelector('.desc')?.textContent || '').toLowerCase();
            const tags = (it.dataset.tags || '').toLowerCase();
            const byText = !s || title.includes(s) || sys.includes(s) || desc.includes(s);
            const byTag = !tag || tags.split(',').map(x => x.trim()).includes(tag.toLowerCase());
            it.style.display = (byText && byTag) ? '' : 'none';
        });
        if (typeof initPaginationArticles === 'function') initPaginationArticles('#archive-list', 5);
    }

    if (searchEl) {
        let t;
        searchEl.addEventListener('input', (e) => {
            clearTimeout(t);
            t = setTimeout(()=> {
                filterList(e.target.value, activeTag);
            }, 160);
        });
    }

    tagListEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        const tag = btn.dataset.tag;
        if (btn.classList.contains('active')) {
            setActiveTag(null);
            filterList(searchEl?.value || '', null);
        } else {
            setActiveTag(tag);
            filterList(searchEl?.value || '', tag);
        }
    });

    container.addEventListener('click', (e) => {
        const chip = e.target.closest('.tag-chip');
        if (!chip) return;
        const tag = chip.dataset.tag;
        const btn = tagListEl.querySelector(`.tag-btn[data-tag="${CSS.escape(tag)}"]`);
        if (btn) {
            btn.click();
        } else {
            setActiveTag(tag);
            filterList(searchEl?.value || '', tag);
        }
    });

    const sideBar = document.querySelector('.side-bar');
    if (sideBar) {
        sideBar.addEventListener('click', (e) => {
            const sbtn = e.target.closest('.sort-btn');
            if (!sbtn) return;
            const by = sbtn.dataset.sort;
            const order = sbtn.dataset.order || 'asc';
            sortArchive(by, order);
            sbtn.dataset.order = order === 'asc' ? 'desc' : 'asc';
        });
    }

    function sortArchive(by, order = 'asc') {
        const arr = Array.from(items).sort((A,B) => {
            if (by === 'date') {
                return new Date(A.dataset.date).getTime() - new Date(B.dataset.date).getTime();
            }
            if (by === 'title') {
                return (A.dataset.title || '').localeCompare(B.dataset.title || '');
            }
            return 0;
        });
        if (order === 'desc') arr.reverse();
        arr.forEach(n => container.insertBefore(n, container.querySelector('.content-footer')));
    }

    setActiveTag(null);
    filterList('', null);
}

window.initArchivePage = initArchivePage;
