const USERS_KEY = 'rpa_users_v1';
const CURRENT_USER_KEY = 'rpa_current_user';

async function ensureUsersSeeded(){
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || 'null');
    if (!users) {
        try {
            const res = await fetch('/data/users.json');
            if (res.ok) {
                users = await res.json();
            } else {
                users = []; // empty fallback
            }
        } catch (e) {
            users = [];
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return JSON.parse(localStorage.getItem(USERS_KEY));
}

function saveUsers(users){
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user){
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    renderUserInHeader();
}

function getCurrentUser(){
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
}

function renderUserInHeader(){
    const disp = document.getElementById('user-display');
    const authBtn = document.getElementById('auth-btn');
    const user = getCurrentUser();
    if (!disp || !authBtn) return;
    if (user) {
        disp.textContent = user.username;
        authBtn.textContent = TRANSLATIONS?.auth_logout || 'Выйти';
        authBtn.onclick = () => {
            localStorage.removeItem(CURRENT_USER_KEY);
            renderUserInHeader();
            authBtn.textContent = TRANSLATIONS?.auth_btn || 'Войти/Регистрация';
            authBtn.onclick = showAuthModal;
        };
    } else {
        disp.textContent = '';
        authBtn.textContent = TRANSLATIONS?.auth_btn || 'Войти/Регистрация';
        authBtn.onclick = showAuthModal;
    }
}

// Modal UI
function createAuthModal(){
    let modal = document.getElementById('auth-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
    <div style="background:var(--panel);padding:20px;border-radius:8px;min-width:320px;max-width:420px;color:var(--text)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 id="auth-title">Вход</h3>
        <button id="auth-close" style="background:transparent;border:none;color:var(--muted);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button id="tab-login" class="auth-tab">Вход</button>
        <button id="tab-register" class="auth-tab">Регистрация</button>
      </div>
      <form id="auth-form">
        <div style="margin-bottom:8px">
          <label>Логин / Username</label><br/>
          <input id="auth-username" required style="width:100%;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06)"/>
        </div>
        <div style="margin-bottom:8px">
          <label>Пароль / Password</label><br/>
          <input id="auth-password" type="password" required style="width:100%;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06)"/>
        </div>
        <div id="auth-extra" style="display:none;margin-bottom:8px">
          <label>Email (optional)</label><br/>
          <input id="auth-email" type="email" style="width:100%;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06)"/>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button type="button" id="auth-submit" style="padding:8px 12px;border-radius:6px;background:var(--accent);border:none;color:#fff;cursor:pointer">OK</button>
        </div>
        <div id="auth-msg" style="margin-top:8px;color:var(--muted)"></div>
      </form>
    </div>
  `;
    document.body.appendChild(modal);

    modal.querySelector('#auth-close').addEventListener('click', ()=> modal.remove());
    modal.querySelector('#tab-login').addEventListener('click', ()=> setAuthMode('login'));
    modal.querySelector('#tab-register').addEventListener('click', ()=> setAuthMode('register'));
    modal.querySelector('#auth-submit').addEventListener('click', onAuthSubmit);
    setAuthMode('login');
    return modal;
}

function setAuthMode(mode){
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.querySelector('#auth-msg').textContent = '';
    modal.querySelector('#auth-password').value = '';
    modal.querySelector('#auth-username').value = '';
    modal.querySelector('#auth-email').value = '';
    modal.querySelector('#auth-extra').style.display = mode === 'register' ? '' : 'none';
    modal.querySelector('#auth-title').textContent = mode === 'register' ? (TRANSLATIONS?.auth_register || 'Регистрация') : (TRANSLATIONS?.auth_login || 'Вход');
    modal.dataset.mode = mode;
}

async function onAuthSubmit(){
    const modal = document.getElementById('auth-modal');
    const mode = modal.dataset.mode || 'login';
    const u = document.getElementById('auth-username').value.trim();
    const p = document.getElementById('auth-password').value;
    const e = document.getElementById('auth-email').value.trim();
    const msgEl = document.getElementById('auth-msg');

    if (!u || !p) {
        msgEl.textContent = TRANSLATIONS?.auth_fill || 'Введите логин и пароль';
        return;
    }

    let users = await ensureUsersSeeded() || [];
    if (mode === 'login') {
        const found = users.find(x => x.username === u && x.password === p);
        if (found) {
            setCurrentUser({username: found.username});
            msgEl.style.color = 'green';
            msgEl.textContent = TRANSLATIONS?.auth_success || 'Успешный вход';
            setTimeout(()=> document.getElementById('auth-modal')?.remove(), 700);
        } else {
            msgEl.style.color = 'salmon';
            msgEl.textContent = TRANSLATIONS?.auth_failed || 'Неверные учётные данные';
        }
    } else {
        if (users.find(x => x.username === u)) {
            msgEl.style.color = 'salmon';
            msgEl.textContent = TRANSLATIONS?.auth_exists || 'Пользователь уже существует';
            return;
        }
        const newUser = {username: u, password: p, email: e || ''};
        users.push(newUser);
        saveUsers(users);
        setCurrentUser({username: u});
        msgEl.style.color = 'green';
        msgEl.textContent = TRANSLATIONS?.auth_created || 'Аккаунт создан';
        setTimeout(()=> document.getElementById('auth-modal')?.remove(), 700);
    }
}

function showAuthModal(){
    ensureUsersSeeded().then(()=> {
        createAuthModal();
        renderUserInHeader();
    });
}

function initAuth(){
    const btn = document.getElementById('auth-btn');
    if (btn) btn.addEventListener('click', showAuthModal);
    renderUserInHeader();
}

window.initAuth = initAuth;
window.showAuthModal = showAuthModal;
