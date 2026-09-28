/* ============================================================
   FIBERRED — Interacciones
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header, barra de progreso y botón subir ---------- */
  const header = $('#siteHeader');
  const progress = $('#progressBar');
  const toTop = $('#toTop');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 600);
    const max = document.body.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    markCurrentSection(y);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* ---------- Menú móvil ---------- */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Enlace activo según la sección visible ---------- */
  const sections = $$('section[id]');
  function markCurrentSection(y) {
    let currentId = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 140) currentId = sec.id;
    });
    $$('#navLinks a').forEach(a => {
      a.classList.toggle('current', a.getAttribute('href') === '#' + currentId);
    });
  }

  /* ---------- Título con máquina de escribir ---------- */
  const typeTarget = $('#typeTarget');
  const words = ['fibra óptica', '250 Mbps reales', 'internet sin cortes'];
  if (typeTarget) {
    if (reduced) {
      typeTarget.textContent = words[0];
      typeTarget.classList.remove('type-target');
    } else {
      let w = 0, i = 0, deleting = false;
      (function type() {
        const word = words[w];
        typeTarget.textContent = word.slice(0, i);
        if (!deleting && i < word.length) { i++; setTimeout(type, 75); }
        else if (!deleting) { deleting = true; setTimeout(type, 1800); }
        else if (i > 0) { i--; setTimeout(type, 35); }
        else { deleting = false; w = (w + 1) % words.length; setTimeout(type, 260); }
      })();
    }
  }

  /* ---------- Revelado al hacer scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Contadores del hero ---------- */
  function animateCount(el) {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = end + suffix; return; }
    const dur = 1600, t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); countObserver.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countObserver.observe(el));

  /* ---------- Panel de fibra: medidor y barras ---------- */
  const gauge = $('#gaugeNum');
  if (gauge) {
    if (reduced) { gauge.textContent = '248'; }
    else {
      let val = 0;
      const climb = setInterval(() => {
        val += Math.random() * 22;
        if (val >= 248) { val = 248; clearInterval(climb); setInterval(fluctuate, 2200); }
        gauge.textContent = Math.round(val);
      }, 60);
      function fluctuate() {
        const v = 244 + Math.round(Math.random() * 8);
        gauge.textContent = v;
      }
    }
    setTimeout(() => $$('.bar > span').forEach(b => b.style.width = b.dataset.fill + '%'), 700);
  }

  /* ---------- Pestañas de planes ---------- */
  const tabs = $('#tabs');
  const indicator = $('#tabIndicator');
  const tabBtns = $$('.tab-btn');

  function moveIndicator(btn) {
    indicator.style.left = btn.offsetLeft + 'px';
    indicator.style.width = btn.offsetWidth + 'px';
  }

  function switchTab(btn) {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moveIndicator(btn);

    const mode = btn.dataset.tab;
    $$('.tv-only').forEach(li => { li.hidden = mode !== 'tv'; });

    $$('.amount').forEach(el => {
      const from = parseInt(el.textContent, 10);
      const to = parseInt(mode === 'tv' ? el.dataset.tv : el.dataset.solo, 10);
      if (from === to) return;
      if (reduced) { el.textContent = to; return; }
      const dur = 550, t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  if (tabs) {
    tabBtns.forEach(b => b.addEventListener('click', () => switchTab(b)));
    window.addEventListener('load', () => moveIndicator($('.tab-btn.active')));
    window.addEventListener('resize', () => moveIndicator($('.tab-btn.active')));
    moveIndicator($('.tab-btn.active'));
  }

  /* ---------- Brillo que sigue al cursor en las tarjetas ---------- */
  $$('.pro-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Comparador de descargas ---------- */
  const race = $('#race');
  let sizeGB = 1.5;
  let raceSeen = false;

  function formatTime(seconds) {
    if (seconds < 60) return Math.round(seconds) + ' s';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m < 60) return m + ' min ' + (s ? s + ' s' : '');
    const h = Math.floor(m / 60);
    return h + ' h ' + (m % 60) + ' min';
  }

  function runRace() {
    const speeds = [20, 100, 500];
    const times = speeds.map(sp => (sizeGB * 8000) / sp); // segundos aprox.
    const slowest = Math.max(...times);
    $$('.race-fill', race).forEach(fill => {
      const sp = parseInt(fill.dataset.speed, 10);
      const t = (sizeGB * 8000) / sp;
      fill.style.width = Math.max(6, (t / slowest) * 100) + '%';
    });
    $$('.time', race).forEach(el => {
      const sp = parseInt(el.dataset.speed, 10);
      el.textContent = formatTime((sizeGB * 8000) / sp);
    });
  }

  if (race) {
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting && !raceSeen) { raceSeen = true; runRace(); obs.disconnect(); } });
    }, { threshold: 0.4 }).observe(race);

    $$('.chip').forEach(chip => chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      sizeGB = parseFloat(chip.dataset.size);
      runRace();
    }));
  }

  /* ---------- Cobertura ---------- */
  const form = $('#coverageForm');
  if (form) {
    const result = $('#coverageResult');
    const btn = $('#coverageBtn');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const district = $('#districtInput').value.trim();
      const city = $('#cityInput').value;
      if (!district) return;

      result.className = 'coverage-result wait show';
      result.innerHTML = '<i class="fas fa-circle-notch spin"></i> Buscando nodos de fibra en ' + district + '…';
      btn.disabled = true;

      setTimeout(() => {
        btn.disabled = false;
        result.className = 'coverage-result ok show';
        result.innerHTML = '<i class="fas fa-circle-check"></i> <span>Tenemos fibra en ' + district + ', ' + city +
          '. Podemos instalar mañana. <a href="https://wa.me/51948518211?text=Hola,%20quiero%20instalar%20en%20' +
          encodeURIComponent(district) + '" target="_blank" rel="noopener"><b>Agendar instalación</b></a></span>';
      }, 1500);
    });
  }

  /* ---------- Carrusel de opiniones ---------- */
  const track = $('#slidesTrack');
  if (track) {
    const slides = $$('.slide', track);
    const nav = $('#sliderNav');
    let index = 0, timer;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Opinión ' + (i + 1));
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => { go(i); restart(); });
      nav.appendChild(b);
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      $$('button', nav).forEach((b, k) => b.classList.toggle('active', k === index));
    }
    function restart() { clearInterval(timer); if (!reduced) timer = setInterval(() => go(index + 1), 6000); }
    restart();

    const slider = $('#slider');
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', restart);

    // Deslizar con el dedo
    let startX = null;
    slider.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    slider.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });
  }

  /* ---------- Acordeón de preguntas ---------- */
  $$('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = $('.faq-a', item);
      const isOpen = item.classList.contains('open');

      $$('.faq-item.open').forEach(other => {
        other.classList.remove('open');
        $('.faq-a', other).style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Marquesina: duplica el grupo para el bucle ---------- */
  const marquee = $('#marquee');
  if (marquee) {
    const group = $('.marquee-group', marquee);
    marquee.appendChild(group.cloneNode(true));
  }

  onScroll();
})();
