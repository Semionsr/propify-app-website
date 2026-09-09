(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); navLinks.classList.remove('is-open'); }
  menu.addEventListener('click', () => { const expanded = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(expanded)); menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation'); navLinks.classList.toggle('is-open', expanded); });
  navLinks.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });

  const steps = [...document.querySelectorAll('.step')];
  const stepImage = document.querySelector('#step-image');
  const screenData = [ ['home', 'Propify overview with league selection'], ['defense', 'Propify defensive matchups and player prop cards'], ['reports', 'Propify AI report with recent statistics and matchup history'], ['profiles', 'Propify player and team profiles'] ];
  let selectedStep = 0;
  const walkPhone = document.querySelector('.walk-phone');
  walkPhone.addEventListener('animationend', () => walkPhone.classList.remove('is-switching'));
  function selectStep(index) { if (index !== selectedStep && !reducedMotion.matches) { walkPhone.classList.remove('is-switching'); void walkPhone.offsetWidth; walkPhone.classList.add('is-switching'); } selectedStep = index; steps.forEach((step, i) => { step.classList.toggle('is-active', i === index); step.querySelector('button').setAttribute('aria-pressed', String(i === index)); }); stepImage.src = `propify-assets/${screenData[index][0]}.webp`; stepImage.alt = screenData[index][1]; document.querySelector('#step-number').textContent = String(index + 1).padStart(2, '0'); }
  steps.forEach((step, index) => step.querySelector('button').addEventListener('click', () => { selectStep(index); if (window.innerWidth <= 560) document.querySelector('.step-visual').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' }); }));
  let tickPending = false;
  function updateScroll() { tickPending = false; if (window.innerWidth <= 560 || reducedMotion.matches) return; const target = window.innerHeight * .55; let best = selectedStep; let distance = Infinity; for (let i = 0; i < steps.length; i++) { const rect = steps[i].getBoundingClientRect(); const d = Math.abs(rect.top + rect.height / 2 - target); if (d < distance) { best = i; distance = d; } } const bounds = document.querySelector('.walkthrough-layout').getBoundingClientRect(); if (bounds.top < target && bounds.bottom > target && best !== selectedStep) selectStep(best); }
  window.addEventListener('scroll', () => { if (!tickPending) { tickPending = true; requestAnimationFrame(updateScroll); } }, { passive: true });

  const track = document.querySelector('.screens-track');
  const previous = document.querySelector('#screens-prev');
  const next = document.querySelector('#screens-next');
  function galleryState() { previous.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 3; }
  function moveGallery(direction) { const card = track.querySelector('figure'); const gap = parseFloat(getComputedStyle(track).columnGap) || 25; track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reducedMotion.matches ? 'instant' : 'smooth' }); }
  previous.addEventListener('click', () => moveGallery(-1)); next.addEventListener('click', () => moveGallery(1));
  track.addEventListener('scroll', galleryState, { passive: true });
  track.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1); } });
  window.addEventListener('resize', galleryState); galleryState();

  document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => { const yearly = button.dataset.plan === 'yearly'; document.querySelectorAll('[data-plan]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); }); document.querySelector('#plan-title').textContent = yearly ? 'Start with 3 days free.' : 'Go month to month.'; document.querySelector('#plan-description').textContent = yearly ? 'Try every feature with the yearly plan. Subscription renews annually after the trial unless canceled.' : 'Full access with a monthly subscription. No free trial. Subscription renews monthly unless canceled.'; }));
  // Feature connectors: an SVG path (base line that draws in, plus a travelling light) sized to the box.
  function buildConnectors() { document.querySelectorAll('.connector').forEach(connector => { let svg = connector.querySelector('svg'); if (!svg) { connector.innerHTML = '<svg class="connector-svg" aria-hidden="true"><path class="connector-base" pathLength="1"/><path class="connector-light" pathLength="1"/></svg>'; svg = connector.querySelector('svg'); } const w = connector.offsetWidth, h = connector.offsetHeight, r = Math.min(60, w / 2, h - 1); svg.setAttribute('viewBox', `0 0 ${w} ${h}`); const d = `M0 .5H${w - r}A${r - .5} ${r - .5} 0 0 1 ${w - .5} ${r}V${h}`; svg.querySelectorAll('path').forEach(path => path.setAttribute('d', d)); }); }
  buildConnectors(); window.addEventListener('resize', buildConnectors);

  // Scroll reveals: tag elements, stagger groups via --d, then flip them on as they enter the viewport.
  const reveal = (selector, kind) => document.querySelectorAll(selector).forEach(el => el.setAttribute(kind ? 'data-motion' : 'data-reveal', kind || ''));
  const revealGroup = elements => elements.forEach((el, i) => { el.setAttribute('data-reveal', ''); el.style.setProperty('--d', i); });
  reveal('.leagues, .statement-text, .statement-caption, .section-heading, .step-visual, .feature-copy, .feature-visual, .toolkit-center, .gallery-note, .membership-copy, .faq > div:first-child');
  document.querySelector('.membership-art').setAttribute('data-reveal', 'scale'); reveal('.flow-stem', 'stem'); reveal('.connector', 'draw');
  steps.forEach(step => revealGroup([...step.children]));
  document.querySelectorAll('.toolkit-stack').forEach(stack => revealGroup([...stack.children]));
  revealGroup([...document.querySelectorAll('.screens-track figure')]);
  revealGroup([...document.querySelectorAll('.faq details')]);
  revealGroup([...document.querySelectorAll('.final-cta > :not(.flow-stem)')]);
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  document.querySelectorAll('[data-reveal], [data-motion]').forEach(el => observer.observe(el));
})();
