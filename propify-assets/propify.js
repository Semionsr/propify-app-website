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

  // Walkthrough: the stage pins and full-width panels sweep left-to-right with scroll; on phones the track swipes natively.
  const steps = [...document.querySelectorAll('.step')];
  const pin = document.querySelector('.walkthrough-pin');
  const walkTrack = document.querySelector('.walk-track');
  const walkFooter = document.querySelector('.walk-footer');
  const navButtons = [...document.querySelectorAll('.steps-nav button')];
  const isRailScroll = () => window.innerWidth <= 560;
  const last = steps.length - 1;
  let selectedStep = 0, targetPos = 0, currentPos = 0, rafId = 0;
  function selectStep(index) { selectedStep = index; steps.forEach((step, i) => step.classList.toggle('is-active', i === index)); navButtons.forEach((button, i) => { button.classList.toggle('is-active', i === index); if (i === index) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); }); }
  const stepPitch = () => steps[1].offsetLeft - steps[0].offsetLeft;
  function render() { currentPos += (targetPos - currentPos) * .14; if (Math.abs(targetPos - currentPos) < .002) currentPos = targetPos; walkTrack.style.transform = `translate3d(${-currentPos * stepPitch()}px,0,0)`; walkFooter.style.setProperty('--p', (currentPos / last).toFixed(4)); const index = Math.round(currentPos); if (index !== selectedStep) selectStep(index); rafId = currentPos === targetPos ? 0 : requestAnimationFrame(render); }
  const scrollRange = () => pin.offsetHeight - window.innerHeight;
  // Dwell on each panel for most of its scroll segment, sweeping only through the middle 44% so panels rest fully in view.
  const smooth = t => t * t * (3 - 2 * t);
  function toPosition(progress) { const raw = progress * last; const i = Math.floor(raw); if (i >= last) return last; const t = Math.min(1, Math.max(0, (raw - i - .28) / .44)); return i + smooth(t); }
  function updateScroll() { tickPending = false; if (isRailScroll()) return; const progress = Math.min(1, Math.max(0, -pin.getBoundingClientRect().top / scrollRange())); targetPos = toPosition(progress); if (reducedMotion.matches) currentPos = targetPos; if (!rafId) rafId = requestAnimationFrame(render); }
  let tickPending = false;
  window.addEventListener('scroll', () => { if (!tickPending) { tickPending = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', () => { if (isRailScroll()) { walkTrack.style.transform = ''; walkFooter.style.setProperty('--p', (selectedStep / last).toFixed(4)); } else updateScroll(); });
  walkTrack.addEventListener('scroll', () => { if (!isRailScroll()) return; const index = Math.min(last, Math.max(0, Math.round(walkTrack.scrollLeft / stepPitch()))); if (index !== selectedStep) selectStep(index); walkFooter.style.setProperty('--p', (index / last).toFixed(4)); }, { passive: true });
  navButtons.forEach((button, index) => button.addEventListener('click', () => { const behavior = reducedMotion.matches ? 'instant' : 'smooth'; if (isRailScroll()) walkTrack.scrollTo({ left: steps[index].offsetLeft, behavior }); else window.scrollTo({ top: window.scrollY + pin.getBoundingClientRect().top + index / last * scrollRange(), behavior }); }));
  updateScroll();

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
  reveal('.leagues, .statement-text, .statement-caption, .section-heading, .feature-copy, .feature-visual, .toolkit-center, .gallery-note, .membership-copy, .faq > div:first-child');
  document.querySelector('.membership-art').setAttribute('data-reveal', 'scale'); reveal('.flow-stem', 'stem'); reveal('.connector', 'draw');
  steps.forEach(step => revealGroup([...step.children]));
  document.querySelectorAll('.toolkit-stack').forEach(stack => revealGroup([...stack.children]));
  revealGroup([...document.querySelectorAll('.screens-track figure')]);
  revealGroup([...document.querySelectorAll('.faq details')]);
  revealGroup([...document.querySelectorAll('.final-cta > :not(.flow-stem)')]);
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  document.querySelectorAll('[data-reveal], [data-motion]').forEach(el => observer.observe(el));
})();

// Background: curved light streams that drift with scroll.
// Perf: soft glow on a low-res canvas, crisp lines on a second canvas, edge shading done by a CSS mask,
// full frame rate only while scrolling (so lines track the page), ~30fps when idle, paused when hidden.
(() => {
  const lines = document.getElementById('light-stream');
  if (!lines) return;
  const glow = document.createElement('canvas');
  glow.id = 'light-stream-glow'; glow.setAttribute('aria-hidden', 'true');
  lines.before(glow);
  const opts = { alpha: true, desynchronized: true };
  const lctx = lines.getContext('2d', opts), gctx = glow.getContext('2d', opts);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINE_SCALE = Math.min(window.devicePixelRatio || 1, 1.25), GLOW_SCALE = 0.35, COUNT = 28, IDLE_FRAME = 1000 / 30;
  const hues = Array.from({ length: COUNT }, (_, i) => i % 7 === 0 ? '64,214,196' : '72,219,138');
  let W, H, last = 0, queued = false, scrollingUntil = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    lines.width = Math.round(W * LINE_SCALE); lines.height = Math.round(H * LINE_SCALE);
    glow.width = Math.round(W * GLOW_SCALE); glow.height = Math.round(H * GLOW_SCALE);
    lctx.setTransform(LINE_SCALE, 0, 0, LINE_SCALE, 0, 0); gctx.setTransform(GLOW_SCALE, 0, 0, GLOW_SCALE, 0, 0);
    lctx.lineJoin = gctx.lineJoin = 'round';
  }
  function path(ctx, i, t, scroll) {
    ctx.beginPath();
    for (let y = -20; y < H + 20; y += 18) {
      const world = y + scroll, phase = world / (H * 1.3);
      const center = W * (.69 + .35 * Math.cos(phase * 3.4 + .5));
      const spread = 45 + Math.pow(Math.sin(phase * 2.2 + 1), 2) * 110;
      const x = center + Math.sin(i * 1.81 + world * .0017 + t * .22) * spread + (i - COUNT / 2) * 4 + Math.sin(world * .004 + i * .22 + t * .17) * 15;
      y === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
  }
  function draw(now) {
    queued = false;
    if (document.hidden) return;
    const scrolling = now < scrollingUntil;
    if (!scrolling && !reduced && now - last < IDLE_FRAME) { schedule(); return; }
    last = now;
    const t = now * .001, scroll = window.scrollY;
    gctx.clearRect(0, 0, W, H); lctx.clearRect(0, 0, W, H);
    gctx.globalCompositeOperation = lctx.globalCompositeOperation = 'lighter';
    gctx.lineWidth = 30;
    for (let i = 0; i < COUNT; i++) {
      path(gctx, i, t, scroll);
      gctx.strokeStyle = `rgba(${hues[i]},${.045 + (i % 4) * .01})`; gctx.stroke();
      path(lctx, i, t, scroll);
      lctx.lineWidth = i % 6 === 0 ? 1.6 : .8;
      lctx.strokeStyle = `rgba(${hues[i]},${.3 + (Math.sin(i * 3.1 + t * .3) + 1) * .2})`; lctx.stroke();
    }
    if (!reduced || scrolling) schedule();
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(draw); } }
  resize();
  addEventListener('resize', () => { resize(); schedule(); });
  addEventListener('scroll', () => { scrollingUntil = performance.now() + 200; schedule(); }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
