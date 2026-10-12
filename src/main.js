import './styles.css';
import { event, agenda, materials as staticMaterials, photos } from './data.js';
import { apiEnabled, call, getSession, setSession, clearSession } from './api.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ---------- Event details from data.js ---------- */
$('#event-location').textContent = event.location;
$('#event-attendees').textContent = event.attendees;
$('#register-cta').setAttribute('href', event.registerUrl);
$('#drive-link').setAttribute('href', event.driveUrl);

/* ---------- Mobile nav ---------- */
const navToggle = $('#nav-toggle');
const siteNav = $('#site-nav');
navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('hidden') === false;
  navToggle.setAttribute('aria-expanded', String(open));
});
siteNav.addEventListener('click', (e) => {
  if (e.target.closest('a') && window.innerWidth < 768) {
    siteNav.classList.add('hidden');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- Active nav link on scroll ---------- */
const links = [...document.querySelectorAll('a.nav-link')];
const sections = links.map((l) => $(l.getAttribute('href')));
const setActive = (id) =>
  links.forEach((l) =>
    l.getAttribute('href') === `#${id}` ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current'),
  );
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => en.isIntersecting && setActive(en.target.id));
  },
  { rootMargin: '-40% 0px -55% 0px' },
);
sections.forEach((s) => s && observer.observe(s));
setActive('home');

/* ---------- Agenda accordion ---------- */
const chevron =
  '<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.500" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const agendaEl = $('#agenda');
agenda.forEach((d, i) => {
  const wrap = document.createElement('div');
  wrap.className = 'overflow-hidden rounded-md';
  wrap.innerHTML = `
    <h4>
      <button type="button" id="acc-btn-${i}" aria-controls="acc-panel-${i}" aria-expanded="false"
        class="acc-btn flex w-full items-center justify-between gap-3 bg-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
        <span>${esc(d.day)}: ${esc(d.title)}</span>${chevron}
      </button>
    </h4>
    <div id="acc-panel-${i}" role="region" aria-labelledby="acc-btn-${i}" hidden class="border-x border-b border-slate-200 bg-white px-5 py-4">
      <ul class="list-disc space-y-1 pl-5 text-sm text-slate-700">${d.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>`;
  agendaEl.appendChild(wrap);
});

function toggleAcc(btn, open) {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  btn.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  btn.classList.toggle('bg-brand', open);
  btn.classList.toggle('text-white', open);
  btn.classList.toggle('hover:bg-brand-dark', open);
  btn.classList.toggle('bg-slate-200', !open);
  btn.classList.toggle('hover:bg-slate-300', !open);
  btn.classList.toggle('text-slate-800', !open);
  btn.querySelector('svg').style.transform = open ? 'rotate(180deg)' : '';
}
agendaEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.acc-btn');
  if (!btn) return;
  const willOpen = btn.getAttribute('aria-expanded') !== 'true';
  agendaEl.querySelectorAll('.acc-btn').forEach((b) => toggleAcc(b, false));
  toggleAcc(btn, willOpen);
});
// Day 2 opens by default, as in the design.
toggleAcc($('#acc-btn-1'), true);

/* ---------- Materials grid (gated when apiUrl is set) ---------- */
const fileColors = { pdf: '#e53935', pptx: '#f4811f', xlsx: '#1e8e3e' };
const fileLabels = { pdf: 'PDF', pptx: 'PPTX', xlsx: 'XLSX' };
const fileIcon = (type) => {
  const t = fileColors[type] ? type : 'pdf';
  return `
  <svg viewBox="0 0 40 48" class="h-14 w-12" aria-hidden="true">
    <path d="M4 2h22l10 10v32a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#fff" stroke="${fileColors[t]}" stroke-width="2.500"/>
    <path d="M26 2v10h10" fill="none" stroke="${fileColors[t]}" stroke-width="2.500"/>
    <text x="19" y="35" text-anchor="middle" font-size="9.500" font-weight="800" fill="${fileColors[t]}" font-family="Inter, sans-serif">${fileLabels[t]}</text>
  </svg>`;
};

const grid = $('#materials-grid');
const lockedBox = $('#materials-locked');
const lockedMsg = $('#materials-locked-msg');
const driveLink = $('#drive-link');
const authUser = $('#auth-user');
const DEFAULT_LOCKED_MSG = lockedMsg.textContent;

function renderMaterials(list) {
  lockedBox.classList.add('hidden');
  grid.classList.remove('hidden');
  // The shared Drive folder link is only shown on the public (ungated) site.
  driveLink.classList.toggle('hidden', apiEnabled());
  grid.innerHTML = list
    .filter((m) => /^https:\/\//i.test(m.href) || m.href === '#')
    .map(
      (m) => `
  <li class="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
    ${fileIcon(m.type)}
    <span class="min-h-[2.5rem] break-words text-xs font-medium text-slate-700">${esc(m.name)}</span>
    <a href="${esc(m.href)}" target="_blank" rel="noopener noreferrer" class="w-full rounded bg-brand px-2 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
       aria-label="${esc(m.action)}: ${esc(m.name)}">${esc(m.action)}</a>
  </li>`,
    )
    .join('');
}

function lockMaterials(message = DEFAULT_LOCKED_MSG) {
  grid.classList.add('hidden');
  grid.innerHTML = '';
  driveLink.classList.add('hidden');
  lockedMsg.textContent = message;
  lockedBox.classList.remove('hidden');
}

async function loadMaterials() {
  if (!apiEnabled()) {
    renderMaterials(staticMaterials);
    return;
  }
  const s = getSession();
  if (!s) {
    lockMaterials();
    return;
  }
  try {
    const r = await call('materials', { token: s.token });
    if (r.ok) {
      renderMaterials(r.materials);
    } else {
      clearSession();
      updateAuthUI();
      lockMaterials('Your session expired. Please sign in again.');
    }
  } catch {
    lockMaterials('Could not load the materials. Check your connection and try again.');
  }
}

/* ---------- Sign in / sign out ---------- */
const authItem = $('#auth-item');
const authBtn = $('#auth-btn');
const dlg = $('#auth-dialog');
const emailForm = $('#auth-email-form');
const codeForm = $('#auth-code-form');
const authMsg = $('#auth-msg');
let pendingEmail = '';

function updateAuthUI() {
  const s = getSession();
  authBtn.textContent = s ? 'Sign out' : 'Sign in';
  authUser.classList.toggle('hidden', !s);
  authUser.textContent = s ? `Signed in${s.name ? ' as ' + s.name : ''}.` : '';
}

function setAuthMsg(text, kind = '') {
  authMsg.textContent = text;
  authMsg.className = 'mt-3 min-h-[1.25rem] text-sm ' + (kind === 'error' ? 'text-red-600' : kind === 'ok' ? 'text-green-700' : 'text-slate-600');
}

function showStep(step) {
  emailForm.classList.toggle('hidden', step !== 'email');
  codeForm.classList.toggle('hidden', step !== 'code');
}

function openAuth(prefillEmail = '') {
  showStep('email');
  setAuthMsg('');
  if (prefillEmail) $('#auth-email').value = prefillEmail;
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
  $('#auth-email').focus();
}

function closeAuth() {
  if (typeof dlg.close === 'function') dlg.close();
  else dlg.removeAttribute('open');
}

async function signOut() {
  const s = getSession();
  clearSession();
  updateAuthUI();
  lockMaterials();
  if (s) call('logout', { token: s.token }).catch(() => {});
}

if (apiEnabled()) {
  authItem.classList.remove('hidden');
  authBtn.addEventListener('click', () => (getSession() ? signOut() : openAuth()));
  $('#materials-signin').addEventListener('click', () => openAuth());
  $('#auth-close').addEventListener('click', closeAuth);
  $('#auth-back').addEventListener('click', () => {
    showStep('email');
    setAuthMsg('');
    $('#auth-email').focus();
  });

  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#auth-email').value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthMsg('Enter a valid email address.', 'error');
      return;
    }
    const btn = emailForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    setAuthMsg('Sending code…');
    try {
      const r = await call('requestCode', { email });
      if (!r.ok) {
        setAuthMsg(r.error || 'Could not send the code.', 'error');
        return;
      }
      pendingEmail = email;
      $('#auth-code-hint').textContent = r.message;
      $('#auth-code').value = '';
      showStep('code');
      setAuthMsg('');
      $('#auth-code').focus();
    } catch {
      setAuthMsg('Network problem. Please try again.', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('#auth-code').value.trim();
    if (!/^\d{6}$/.test(code)) {
      setAuthMsg('Enter the 6-digit code from your email.', 'error');
      return;
    }
    const btn = codeForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    setAuthMsg('Checking…');
    try {
      const r = await call('verifyCode', { email: pendingEmail, code });
      if (!r.ok) {
        setAuthMsg(r.error || 'Could not verify the code.', 'error');
        return;
      }
      setSession({ token: r.token, name: r.name });
      closeAuth();
      updateAuthUI();
      loadMaterials();
      $('#materials').scrollIntoView();
    } catch {
      setAuthMsg('Network problem. Please try again.', 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

updateAuthUI();
loadMaterials();

/* ---------- Photos ---------- */
const photoHtml = (p, cls = '') =>
  p.src
    ? `<img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" class="h-full w-full object-cover ${cls}" />`
    : `<div role="img" aria-label="${esc(p.alt)} (placeholder)" class="h-full w-full ${cls}"
         style="background:linear-gradient(135deg,hsl(${p.hue} 55% 38%),hsl(${p.hue + 25} 60% 60%))"></div>`;

const perPage = () => (window.innerWidth >= 640 ? 3 : 1);
let page = 0;
const track = $('#carousel-track');
const dots = $('#carousel-dots');

function renderCarousel() {
  const n = perPage();
  const pages = Math.ceil(photos.length / n);
  page = (page + pages) % pages;
  track.innerHTML = photos
    .slice(page * n, page * n + n)
    .map((p) => `<figure class="aspect-[4/3] overflow-hidden rounded-md bg-slate-200">${photoHtml(p)}</figure>`)
    .join('');
  dots.innerHTML = Array.from(
    { length: pages },
    (_, i) => `<span class="h-1.5 w-1.5 rounded-full ${i === page ? 'bg-brand' : 'bg-slate-300'}"></span>`,
  ).join('');
}
$('#carousel-prev').addEventListener('click', () => { page -= 1; renderCarousel(); });
$('#carousel-next').addEventListener('click', () => { page += 1; renderCarousel(); });
window.addEventListener('resize', () => { page = 0; renderCarousel(); });
renderCarousel();

$('#recent-grid').innerHTML = photos
  .map((p) => `<div class="aspect-[4/3] overflow-hidden rounded">${photoHtml(p)}</div>`)
  .join('');

/* ---------- Registration form ---------- */
const form = $('#register-form');
const status = $('#form-status');
const setStatus = (text, cls) => {
  status.className = 'min-h-[1.25rem] text-sm ' + cls;
  status.textContent = text;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    setStatus('Please complete all fields and accept the consent box.', 'text-red-600');
    form.reportValidity();
    return;
  }

  if (apiEnabled()) {
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    setStatus('Submitting…', 'text-slate-600');
    try {
      const r = await call('register', {
        fullname: $('#fullname').value,
        email: $('#email').value,
        office: $('#office').value,
        position: $('#position').value,
        consent: $('#consent').checked,
      });
      if (r.ok) {
        setStatus(r.message, 'text-green-700');
        if (!r.already) form.reset();
      } else {
        setStatus(r.error || 'Registration failed. Please try again.', 'text-red-600');
      }
    } catch {
      setStatus('Network problem. Please try again.', 'text-red-600');
    } finally {
      btn.disabled = false;
    }
    return;
  }

  if (event.registerUrl && event.registerUrl !== '#register') {
    window.open(event.registerUrl, '_blank', 'noopener');
    return;
  }
  setStatus(
    'Registration is not connected yet. Set apiUrl (or registerUrl) in src/data.js. See docs/SETUP-GUIDE.md.',
    'text-amber-700',
  );
});
