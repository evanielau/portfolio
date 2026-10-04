(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // ── Language toggle ──
  // Always opens in English (no browser-language detection, nothing remembered).
  var titles = {
    en: 'Yanxi Liu — Marketing Portfolio',
    fr: 'Yanxi Liu — Portfolio Marketing'
  };
  var langButtons = document.querySelectorAll('[data-set-lang]');

  function setLang(lang) {
    root.lang = lang;
    document.title = titles[lang];
    langButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
    });
  }
  langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.dataset.setLang); });
  });
  setLang('en');

  // ── Dark / light toggle ──
  // Always opens in light mode (the brand look); nothing remembered.
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var themeLabels = {
    en: ['Switch to dark mode', 'Switch to light mode'],
    fr: ['Passer en mode sombre', 'Passer en mode clair']
  };
  function syncThemeLabel() {
    var dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', themeLabels[root.lang][dark ? 1 : 0]);
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      syncThemeLabel();
    });
    langButtons.forEach(function (btn) { btn.addEventListener('click', syncThemeLabel); });
    syncThemeLabel();
  }

  // ── Back to top (logo + footer link) ──
  // #top is the sticky nav, so the browser's own jump does nothing; scroll manually.
  document.querySelectorAll('a[href="#top"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotionPref() ? 'auto' : 'smooth' });
      history.replaceState(null, '', location.pathname + location.search);
    });
  });
  function reduceMotionPref() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  // ── Copy email (Let's talk + address) ──
  // mailto alone does nothing when no mail app is set up, so also copy the address.
  var toast = document.querySelector('.toast');
  var toastTimer;
  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2600);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    return Promise.resolve();
  }
  document.querySelectorAll('[data-copy-email]').forEach(function (el) {
    el.addEventListener('click', function () {
      copyText(el.dataset.copyEmail).then(showToast, showToast);
    });
  });

  // ── Nav border once scrolled ──
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Ticker: duplicate the list for a seamless loop ──
  var track = document.querySelector('.ticker__track');
  if (track) {
    var copy = track.firstElementChild.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.appendChild(copy);
  }

  // ── Count-up numbers ──
  function countUp(el) {
    var target = Number(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Reveal on scroll ──
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-in');
      if (!reduceMotion) el.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { io.observe(el); });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
