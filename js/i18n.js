let TRANSLATIONS = {};
let LANG = localStorage.getItem('lang') || 'ru';
const LANG_SELECT_ID = 'lang-switch';

async function loadTranslationsFor(lang){
    try {
        const res = await fetch(`/i18n/${lang}.json`);
        if (!res.ok) throw new Error('i18n not found');
        TRANSLATIONS = await res.json();
        LANG = lang;
        localStorage.setItem('lang', lang);
        const sel = document.getElementById(LANG_SELECT_ID);
        if (sel) sel.value = lang;
        applyTranslations();
    } catch (e) { console.error(e); }
}

function applyTranslations(root = document){
    root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (!key) return;
        const val = TRANSLATIONS[key];
        if (val !== undefined) el.textContent = val;
    });
}

function initLangSwitcher(){
    const sel = document.getElementById(LANG_SELECT_ID);
    if (sel) {
        sel.value = LANG;
        sel.addEventListener('change', (e) => loadTranslationsFor(e.target.value));
    }
    loadTranslationsFor(LANG);
}
