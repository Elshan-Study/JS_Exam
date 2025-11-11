let TRANSLATIONS = {};
let LANG = localStorage.getItem('lang') || 'ru';
const LANG_SELECT_ID = 'lang-switch';

function resolveLocalPath(path) {
    try { return new URL(path, location.href).href; }
    catch(e) { return path; }
}

async function loadTranslationsFor(lang) {
    try {
        const res = await fetch(resolveLocalPath(`i18n/${lang}.json`), {cache: 'no-store'});
        if (!res.ok) throw new Error('i18n not found: ' + lang);
        TRANSLATIONS = await res.json();
        LANG = lang;
        localStorage.setItem('lang', lang);
        const sel = document.getElementById(LANG_SELECT_ID);
        if (sel) sel.value = lang;
        applyTranslations();
    } catch (e) {
        console.warn('i18n load failed', e);
    }
}

function applyTranslations(root = document) {
    if (!TRANSLATIONS) return;
    root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (!key) return;
        const val = TRANSLATIONS[key];
        if (val !== undefined) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.setAttribute('placeholder', val);
            } else {
                el.textContent = val;
            }
        }
    });
}

function initLangSwitcher() {
    const sel = document.getElementById(LANG_SELECT_ID);
    if (sel) {
        sel.value = LANG;
        sel.addEventListener('change', (e) => loadTranslationsFor(e.target.value));
    }
    loadTranslationsFor(LANG);
}

window.applyTranslations = applyTranslations;
window.initLangSwitcher = initLangSwitcher;
