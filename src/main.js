import './styles.css';
import { event, agenda, materials, photos } from './data.js';

const $ = (sel, root = document) => root.querySelector(sel);

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
const links = [...document.querySelectorAll('.nav-link')];
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
        <span>${d.day}: ${d.title}</span>${chevron}
      </button>
    </h4>
    <div id="acc-panel-${i}" role="region" aria-labelledby="acc-btn-${i}" hidden class="border-x border-b border-slate-200 bg-white px-5 py-4">
      <ul class="list-disc space-y-1 pl-5 text-sm text-slate-700">${d.items.map((t) => `<li>${t}</li>`).join('')}</ul>
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

/* ---------- Materials grid ---------- */
const fileColors = { pdf: '#e53935', pptx: '#f4811f', xlsx: '#1e8e3e' };
const fileLabels = { pdf: 'PDF', pptx: 'PPTX', xlsx: 'XLSX' };
const fileIcon = (type) => `
  <svg viewBox="0 0 40 48" class="h-14 w-12" aria-hidden="true">
    <path d="M4 2h22l10 10v32a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#fff" stroke="${fileColors[type]}" stroke-width="2.500"/>
    <path d="M26 2v10h10" fill="none" stroke="${fileColors[type]}" stroke-width="2.500"/>
    <text x="19" y="35" text-anchor="middle" font-size="9.500" font-weight="800" fill="${fileColors[type]}" font-family="Inter, sans-serif">${fileLabels[type]}</text>
  </svg>`;

$('#materials-grid').innerHTML = materials
  .map(
    (m) => `
  <li class="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
    ${fileIcon(m.type)}
    <span class="min-h-[2.5rem] break-words text-xs font-medium text-slate-700">${m.name}</span>
    <a href="${m.href}" target="_blank" rel="noopener noreferrer" class="w-full rounded bg-brand px-2 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
       aria-label="${m.action}: ${m.name}">${m.action}</a>
  </li>`,
  )
  .join('');

/* ---------- Photos ---------- */
const photoHtml = (p, cls = '') =>
  p.src
    ? `<img src="${p.src}" alt="${p.alt}" loading="lazy" class="h-full w-full object-cover ${cls}" />`
    : `<div role="img" aria-label="${p.alt} (placeholder)" class="h-full w-full ${cls}"
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
form.addEventListener('submit', (e) => {
  e.preventDefault();
  status.className = 'min-h-[1.25rem] text-sm';
  if (!form.checkValidity()) {
    status.classList.add('text-red-600');
    status.textContent = 'Please complete all fields and accept the consent box.';
    form.reportValidity();
    return;
  }
  if (event.registerUrl && event.registerUrl !== '#register') {
    window.open(event.registerUrl, '_blank', 'noopener');
    return;
  }
  // No registration backend is connected yet (see README).
  status.classList.add('text-amber-700');
  status.textContent =
    'Registration is not connected yet. Set registerUrl in src/data.js to your registration form link.';
});
