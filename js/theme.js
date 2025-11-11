function initTheme(){
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const tbtn = document.getElementById('theme-toggle');
    if (tbtn) tbtn.addEventListener('click', toggleTheme);
}

function toggleTheme(){
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('theme', cur);
}
