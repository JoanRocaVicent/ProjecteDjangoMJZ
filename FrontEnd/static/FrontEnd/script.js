/**
 * API — Real fetch-based client for Django REST endpoints.
 *
 * Endpoints expected on the Django side:
 *   GET    /api/recursos/        → list all Recurs
 *   GET    /api/recursos/:id/    → retrieve one Recurs
 *   POST   /api/recursos/        → create a Recurs   (JSON body)
 *   DELETE /api/recursos/:id/    → delete a Recurs
 *   GET    /api/autors/          → list all Autor
 *   GET    /api/autors/:id/      → retrieve one Autor
 *   POST   /api/autors/          → create an Autor   (JSON body)
 *   DELETE /api/autors/:id/      → delete an Autor
 *
 * Response shape (same as the old MockAPI so the router needs no changes):
 *   Success  → { ok: true,  data: <object|array> }
 *   Error    → { ok: false, error: <string>, errors: <object> }
 */

// ── CSRF helper (required by Django for POST / DELETE) ──────────
function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

// ── Base fetch wrapper ──────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const isReadOnly = !options.method || options.method === 'GET';

  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(isReadOnly ? {} : { 'X-CSRFToken': getCsrfToken() }),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // 204 No Content (typical for DELETE success) — no body to parse
    if (response.status === 204) {
      return { ok: true };
    }

    const json = await response.json();

    if (!response.ok) {
      // Django REST Framework returns field errors as { field: ["msg", ...] }
      // and non-field errors as { detail: "msg" } or { non_field_errors: [...] }
      if (typeof json === 'object' && !json.detail && !json.non_field_errors) {
        // Field-level validation errors — normalise to { field: "first message" }
        const errors = {};
        for (const [key, val] of Object.entries(json)) {
          errors[key] = Array.isArray(val) ? val[0] : val;
        }
        return { ok: false, errors };
      }
      const msg = json.detail || (Array.isArray(json.non_field_errors) ? json.non_field_errors[0] : 'Error desconegut');
      return { ok: false, error: msg };
    }

    return { ok: true, data: json };

  } catch (err) {
    // Network failure or JSON parse error
    console.error('API error:', err);
    return { ok: false, error: 'No s\'ha pogut connectar amb el servidor.' };
  }
}

const BASE_URL = 'http://192.168.18.238:8000';

// ── Public API object (same interface as old MockAPI) ───────────
const API = {
  // RECURSOS
  getRecursos()       { return apiFetch(`${BASE_URL}/api/recursos/`); },
  getRecurs(id)       { return apiFetch(`${BASE_URL}/api/recursos/${id}/`); },
  createRecurs(data)  { return apiFetch(`${BASE_URL}/api/recursos/`,  { method: 'POST',   body: JSON.stringify(data) }); },
  deleteRecurs(id)    { return apiFetch(`${BASE_URL}/api/recursos/${id}/`, { method: 'DELETE' }); },

  // AUTORS
  getAutors()         { return apiFetch(`${BASE_URL}/api/autors/`); },
  getAutor(id)        { return apiFetch(`${BASE_URL}/api/autors/${id}/`); },
  createAutor(data)   { return apiFetch(`${BASE_URL}/api/autors/`,   { method: 'POST',   body: JSON.stringify(data) }); },
  deleteAutor(id)     { return apiFetch(`${BASE_URL}/api/autors/${id}/`,  { method: 'DELETE' }); },
};

// ── Helpers ─────────────────────────────────────────────────────
const catLabel = { TEC:'Tecnologia', EDU:'Educació', SAL:'Salut', ENT:'Entreteniment', ALT:'Altres' };
const fmt = (iso) => new Date(iso).toLocaleDateString('ca-ES', { day:'2-digit', month:'short', year:'numeric' });
const initials = (nom, cognoms) => (nom[0] + (cognoms[0] || '')).toUpperCase();

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-dot"></span>${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function showConfirm(title, body) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-icon">🗑️</div>
        <h3>${title}</h3>
        <p>${body}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="modal-cancel">Cancel·lar</button>
          <button class="btn btn-danger" id="modal-confirm">Sí, eliminar</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const cleanup = (result) => { backdrop.remove(); resolve(result); };
    backdrop.querySelector('#modal-confirm').onclick = () => cleanup(true);
    backdrop.querySelector('#modal-cancel').onclick  = () => cleanup(false);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) cleanup(false); });
  });
}

function renderTemplate(id) {
  const tpl = document.getElementById(id);
  return document.importNode(tpl.content, true);
}

// ── Router ──────────────────────────────────────────────────────
const router = {
  go(hash) { window.location.hash = hash; },
  async handle() {
    const hash = window.location.hash || '#/';
    const nav = document.getElementById('nav');
    nav.querySelectorAll('a').forEach(a => {
      a.classList.toggle('active', hash.startsWith('#/' + a.dataset.route));
    });

    const main = document.getElementById('main-content');

    // HOME
    if (hash === '#/' || hash === '') {
      main.innerHTML = '';
      main.appendChild(renderTemplate('tpl-home'));

    // RECURS LIST
    } else if (hash === '#/recursos') {
      main.innerHTML = '';
      main.appendChild(renderTemplate('tpl-recursos'));
      const res = await API.getRecursos();
      const cnt = document.getElementById('recursos-count');
      const box = document.getElementById('recursos-list-content');
      if (!res.ok) { box.innerHTML = `<p style="color:var(--accent)">${res.error}</p>`; return; }
      const items = res.data;
      cnt.textContent = `${items.length} recurs${items.length !== 1 ? 'os' : ''} trobat${items.length !== 1 ? 's' : ''}`;
      if (!items.length) {
        box.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><h3>Sense recursos</h3><p>Crea el primer recurs per començar.</p></div>`;
        return;
      }
      const grid = document.createElement('div'); grid.className = 'grid';
      items.forEach((r, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${i * 0.05}s`;
        card.onclick = () => router.go(`#/recursos/${r.id}`);
        card.innerHTML = `
          <div class="card-top">
            <span class="card-title">${r.titol}</span>
            <span class="tag tag-${r.categoria}">${catLabel[r.categoria]}</span>
          </div>
          ${r.descripcio ? `<p class="card-desc">${r.descripcio}</p>` : ''}
          <div class="card-meta">
            <span class="status-dot ${r.is_activ ? 'activ' : 'inactiv'}"></span>
            <span class="status-label">${r.is_activ ? 'Actiu' : 'Inactiu'}</span>
            <span class="card-date">${fmt(r.data_publicacio)}</span>
            <button class="card-delete-btn" data-id="${r.id}" title="Eliminar recurs">
              <svg viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            </button>
          </div>`;
        grid.appendChild(card);
      });
      box.innerHTML = '';
      box.appendChild(grid);
      grid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.card-delete-btn');
        if (!btn) return;
        e.stopPropagation();
        const id = btn.dataset.id;
        const card = btn.closest('.card');
        const title = card.querySelector('.card-title').textContent;
        const confirmed = await showConfirm('Eliminar recurs', `Segur que vols eliminar "<strong>${title}</strong>"? Aquesta acció no es pot desfer.`);
        if (!confirmed) return;
        const res = await API.deleteRecurs(id);
        if (res.ok) {
          card.style.transition = 'opacity .3s, transform .3s';
          card.style.opacity = '0'; card.style.transform = 'scale(.97)';
          setTimeout(() => {
            card.remove();
            const rem = grid.querySelectorAll('.card').length;
            document.getElementById('recursos-count').textContent = `${rem} recurs${rem !== 1 ? 'os' : ''} trobat${rem !== 1 ? 's' : ''}`;
          }, 300);
          showToast('Recurs eliminat.');
        } else showToast(res.error, 'error');
      });

    // RECURS DETAIL
    } else if (hash.match(/^#\/recursos\/(\d+)$/)) {
      const id = hash.match(/^#\/recursos\/(\d+)$/)[1];
      main.innerHTML = '';
      main.appendChild(renderTemplate('tpl-recurs-detail'));
      const res = await API.getRecurs(id);
      const box = document.getElementById('recurs-detail-content');
      if (!res.ok) { box.innerHTML = `<p style="color:var(--accent)">${res.error}</p>`; return; }
      const r = res.data;
      box.innerHTML = `
        <div class="detail-card">
          <p class="detail-eyebrow">Recurs #${r.id}</p>
          <h1 class="detail-title">${r.titol}</h1>
          <div class="detail-tags">
            <span class="tag tag-${r.categoria}">${catLabel[r.categoria]}</span>
            <span class="tag" style="background:${r.is_activ ? 'var(--active-bg)' : '#F0F0F0'};color:${r.is_activ ? 'var(--accent-2)' : 'var(--ink-faint)'}">
              ${r.is_activ ? '● Actiu' : '○ Inactiu'}
            </span>
          </div>
          <div class="divider"></div>
          <p class="detail-body">${r.descripcio || '<em style="color:var(--ink-faint)">Sense descripció</em>'}</p>
          <div class="meta-grid">
            <div class="meta-item"><label>Data de publicació</label><span>${fmt(r.data_publicacio)}</span></div>
            <div class="meta-item"><label>Identificador</label><span style="font-family:'DM Mono',monospace">#${r.id}</span></div>
          </div>
          <div class="divider"></div>
          <button class="btn btn-danger" id="detail-delete-recurs">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            Eliminar recurs
          </button>
        </div>`;
      document.getElementById('detail-delete-recurs').onclick = async () => {
        const confirmed = await showConfirm('Eliminar recurs', `Segur que vols eliminar "<strong>${r.titol}</strong>"? Aquesta acció no es pot desfer.`);
        if (!confirmed) return;
        const del = await API.deleteRecurs(r.id);
        if (del.ok) { showToast('Recurs eliminat.'); router.go('#/recursos'); }
        else showToast(del.error, 'error');
      };

    // RECURS FORM
    } else if (hash === '#/recursos/nou') {
      main.innerHTML = '';
      main.appendChild(renderTemplate('tpl-recurs-form'));
      document.getElementById('recurs-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('recurs-submit-btn');
        btn.textContent = 'Desant…'; btn.disabled = true;
        ['titol','categoria'].forEach(k => document.getElementById(`err-${k}`).textContent = '');
        const data = {
          titol:      document.getElementById('r-titol').value,
          descripcio: document.getElementById('r-descripcio').value,
          categoria:  document.getElementById('r-categoria').value,
          is_activ:   document.getElementById('r-activ').checked,
        };
        const res = await API.createRecurs(data);
        if (!res.ok) {
          if (res.errors) {
            Object.entries(res.errors).forEach(([k, v]) => {
              const el = document.getElementById(`err-${k}`);
              if (el) { el.textContent = v; document.getElementById(`r-${k}`)?.classList.add('error'); }
            });
          } else {
            showToast(res.error, 'error');
          }
          btn.textContent = 'Desar recurs'; btn.disabled = false;
          return;
        }
        showToast('Recurs creat correctament!');
        router.go('#/recursos');
      });

    // AUTOR LIST
    } else if (hash === '#/autors') {
      main.innerHTML = '';
      main.appendChild(renderTemplate('tpl-autors'));
      const res = await API.getAutors();
      const cnt = document.getElementById('autors-count');
      const box = document.getElementById('autors-list-content');
      if (!res.ok) { box.innerHTML = `<p style="color:var(--accent)">${res.error}</p>`; return; }
      const items = res.data;
      cnt.textContent = `${items.length} autor${items.length !== 1 ? 's' : ''} trobat${items.length !== 1 ? 's' : ''}`;
      if (!items.length) {
        box.innerHTML = `<div class="empty"><div class="empty-icon">👤</div><h3>Sense autors</h3><p>Afegeix el primer autor per començar.</p></div>`;
        return;
      }
      const grid = document.createElement('div');
      grid.style.display = 'flex'; grid.style.flexDirection = 'column'; grid.style.gap = '.75rem';
      items.forEach((a, i) => {
        const card = document.createElement('div');
        card.className = 'autor-card';
        card.style.animationDelay = `${i * 0.05}s`;
        card.onclick = () => router.go(`#/autors/${a.id}`);
        card.innerHTML = `
          <div class="avatar">${initials(a.nom, a.cognoms)}</div>
          <div class="autor-info">
            <div class="autor-name">${a.nom} ${a.cognoms}</div>
            <div class="autor-sub">${a.càrrec || '—'}</div>
            <div class="autor-email">${a.email}</div>
          </div>
          <button class="card-delete-btn" data-id="${a.id}" title="Eliminar autor">
            <svg viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>`;
        grid.appendChild(card);
      });
      box.innerHTML = '';
      box.appendChild(grid);
      grid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.card-delete-btn');
        if (!btn) return;
        e.stopPropagation();
        const id = btn.dataset.id;
        const card = btn.closest('.autor-card');
        const name = card.querySelector('.autor-name').textContent;
        const confirmed = await showConfirm('Eliminar autor', `Segur que vols eliminar "<strong>${name}</strong>"? Aquesta acció no es pot desfer.`);
        if (!confirmed) return;
        const res = await API.deleteAutor(id);
        if (res.ok) {
          card.style.transition = 'opacity .3s, transform .3s';
          card.style.opacity = '0'; card.style.transform = 'translateX(10px)';
          setTimeout(() => {
            card.remove();
            const rem = grid.querySelectorAll('.autor-card').length;
            document.getElementById('autors-count').textContent = `${rem} autor${rem !== 1 ? 's' : ''} trobat${rem !== 1 ? 's' : ''}`;
          }, 300);
          showToast('Autor eliminat.');
        } else showToast(res.error, 'error');
      });

    // AUTOR DETAIL
    } else if (hash.match(/^#\/autors\/(\d+)$/)) {
      const id = hash.match(/^#\/autors\/(\d+)$/)[1];
      main.innerHTML = '';
      main.appendChild(renderTemplate('tpl-autor-detail'));
      const res = await API.getAutor(id);
      const box = document.getElementById('autor-detail-content');
      if (!res.ok) { box.innerHTML = `<p style="color:var(--accent)">${res.error}</p>`; return; }
      const a = res.data;
      box.innerHTML = `
        <div class="detail-card">
          <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1.5rem">
            <div class="avatar" style="width:72px;height:72px;font-size:1.5rem">${initials(a.nom, a.cognoms)}</div>
            <div>
              <p class="detail-eyebrow">Autor #${a.id}</p>
              <h1 class="detail-title" style="font-size:1.7rem;margin-bottom:0">${a.nom} ${a.cognoms}</h1>
              ${a.càrrec ? `<p style="font-size:.9rem;color:var(--ink-dim);margin-top:.25rem">${a.càrrec}</p>` : ''}
            </div>
          </div>
          <div class="divider"></div>
          <div class="meta-grid">
            <div class="meta-item"><label>Correu electrònic</label>
              <span style="font-family:'DM Mono',monospace;font-size:.82rem">${a.email}</span></div>
            <div class="meta-item"><label>Data de naixement</label>
              <span>${a.data_naixement ? fmt(a.data_naixement) : '—'}</span></div>
            <div class="meta-item"><label>Càrrec</label><span>${a.càrrec || '—'}</span></div>
            <div class="meta-item"><label>Identificador</label>
              <span style="font-family:'DM Mono',monospace">#${a.id}</span></div>
          </div>
          <div class="divider"></div>
          <button class="btn btn-danger" id="detail-delete-autor">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            Eliminar autor
          </button>
        </div>`;
      document.getElementById('detail-delete-autor').onclick = async () => {
        const confirmed = await showConfirm('Eliminar autor', `Segur que vols eliminar "<strong>${a.nom} ${a.cognoms}</strong>"? Aquesta acció no es pot desfer.`);
        if (!confirmed) return;
        const del = await API.deleteAutor(a.id);
        if (del.ok) { showToast('Autor eliminat.'); router.go('#/autors'); }
        else showToast(del.error, 'error');
      };

    // AUTOR FORM
    } else if (hash === '#/autors/nou') {
      main.innerHTML = '';
      main.appendChild(renderTemplate('tpl-autor-form'));
      document.getElementById('autor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('autor-submit-btn');
        btn.textContent = 'Desant…'; btn.disabled = true;
        ['nom','cognoms','email'].forEach(k => document.getElementById(`err-${k}`).textContent = '');
        const data = {
          nom:            document.getElementById('a-nom').value,
          cognoms:        document.getElementById('a-cognoms').value,
          email:          document.getElementById('a-email').value,
          data_naixement: document.getElementById('a-data').value || null,
          càrrec:         document.getElementById('a-carrec').value,
        };
        const res = await API.createAutor(data);
        if (!res.ok) {
          if (res.errors) {
            Object.entries(res.errors).forEach(([k, v]) => {
              const el = document.getElementById(`err-${k}`);
              if (el) { el.textContent = v; document.getElementById(`a-${k}`)?.classList.add('error'); }
            });
          } else {
            showToast(res.error, 'error');
          }
          btn.textContent = 'Desar autor'; btn.disabled = false;
          return;
        }
        showToast('Autor creat correctament!');
        router.go('#/autors');
      });

    // 404
    } else {
      main.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div>
        <h3>Pàgina no trobada</h3><p>Torna a l'<a href="#/" style="color:var(--accent)">inici</a>.</p></div>`;
    }
  }
};

window.addEventListener('hashchange', () => router.handle());
router.handle();
