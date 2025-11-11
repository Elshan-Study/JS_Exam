function applySavedTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('theme', cur);
}

function setupThemeHandler() {
    if (window.__themeHandlerInstalled) return;
    window.__themeHandlerInstalled = true;

    document.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('#theme-toggle');
        if (!btn) return;
        e.preventDefault();
        toggleTheme();
    });
}

function initTheme() {
    applySavedTheme();
    setupThemeHandler();
}

window.initTheme = initTheme;
window.toggleTheme = toggleTheme;
