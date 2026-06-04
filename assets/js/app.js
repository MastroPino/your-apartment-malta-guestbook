/* ===================================================================
   Your Apartment Malta — Guest Book
   Tiny hash router + sticky topbar + copy-to-clipboard
   =================================================================== */
(function () {
  'use strict';

  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

  var app = document.getElementById('app');
  var screens = Array.prototype.slice.call(document.querySelectorAll('.screen'));
  var ids = {};
  screens.forEach(function (s) { ids[s.id] = s; });

  var HOME = 'home';
  var scrollMem = {};
  var navigated = false;

  /* ---- Build the sticky topbar (hidden on home) ---- */
  var topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML =
    '<button class="tb-back" type="button" aria-label="Back"><svg class="ico"><use href="#i-arrow-left"></use></svg></button>' +
    '<span class="tb-title"></span>' +
    '<a class="tb-spacer" href="#home" aria-label="Home"></a>';
  app.insertBefore(topbar, app.firstChild);
  var tbTitle = topbar.querySelector('.tb-title');

  topbar.querySelector('.tb-back').addEventListener('click', function () {
    if (navigated && history.length > 1) { history.back(); }
    else { go(HOME); }
  });

  function currentId() {
    var id = (location.hash || '').replace(/^#/, '');
    return ids[id] ? id : HOME;
  }

  function go(id) { location.hash = '#' + id; }

  function render() {
    var id = currentId();
    var next = ids[id];
    var isHome = id === HOME;

    // topbar state is always applied (even when the screen doesn't change)
    topbar.style.display = isHome ? 'none' : 'flex';
    if (!isHome) { tbTitle.textContent = next.getAttribute('data-title') || ''; }
    document.title = (isHome ? 'Your Apartment Malta · Guest Book'
                             : (next.getAttribute('data-title') + ' · Your Apartment Malta'));

    var active = document.querySelector('.screen.is-active');
    if (active === next) { return; }          // already showing
    if (active) {
      scrollMem[active.id] = window.scrollY;   // remember where we were
      active.classList.remove('is-active');
    }
    next.classList.add('is-active');
    window.scrollTo(0, scrollMem[id] || 0);    // top for fresh sections
  }

  window.addEventListener('hashchange', function () { navigated = true; render(); });

  /* ---- Copy to clipboard (Wi-Fi password) ---- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (!btn) { return; }
    var text = btn.getAttribute('data-copy');
    var done = function () {
      btn.classList.add('copied');
      var label = btn.querySelector('.copy-label');
      if (label) { label.textContent = 'Copied'; }
      setTimeout(function () {
        btn.classList.remove('copied');
        if (label) { label.textContent = 'Copy'; }
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', '');
      t.style.position = 'absolute'; t.style.left = '-9999px';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (err) {}
      document.body.removeChild(t);
    }
  });

  /* ---- In-page section nav (e.g. Things to do) ---- */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest ? e.target.closest('[data-scroll-to]') : null;
    if (!chip) { return; }
    var target = document.getElementById(chip.getAttribute('data-scroll-to'));
    if (!target) { return; }
    var tb = document.querySelector('.topbar');
    var nav = chip.parentNode;
    var off = (tb && tb.style.display !== 'none' ? tb.offsetHeight : 0) + (nav ? nav.offsetHeight : 0) + 6;
    var y = target.getBoundingClientRect().top + window.scrollY - off;
    window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
  });

  function updateSectionChips() {
    var secs = document.querySelectorAll('.ttd-sec');
    if (!secs.length) { return; }
    var tb = document.querySelector('.topbar');
    var nav = document.querySelector('.sec-nav');
    var line = (tb && tb.style.display !== 'none' ? tb.offsetHeight : 0) + (nav ? nav.offsetHeight : 0) + 24;
    var cur = secs[0].id;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].getBoundingClientRect().top <= line) { cur = secs[i].id; }
    }
    var chips = document.querySelectorAll('.sec-chip');
    for (var j = 0; j < chips.length; j++) {
      chips[j].classList.toggle('is-active', chips[j].getAttribute('data-scroll-to') === cur);
    }
  }
  var lastSpy = 0;
  window.addEventListener('scroll', function () {
    var now = Date.now();
    if (now - lastSpy < 90) { return; }
    lastSpy = now;
    updateSectionChips();
  }, { passive: true });

  /* ---- Resolve the active theme. LIGHT MODE PAUSED: <html data-theme="dark">
     forces dark; with no attribute we fall back to the OS preference, so the QR
     colors and map tiles stay correct if auto-mode is restored later. ---- */
  function prefersDark() {
    var forced = document.documentElement.getAttribute('data-theme');
    if (forced === 'dark') { return true; }
    if (forced === 'light') { return false; }
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /* ---- Wi-Fi QR code (scan to join) — re-renders if OS toggles dark mode ---- */
  var qrEl = document.getElementById('wifi-qr');
  var darkMq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function renderWifiQr() {
    if (!qrEl || !window.QRCode) { return; }
    qrEl.innerHTML = '';
    var dark = prefersDark();
    new window.QRCode(qrEl, {
      // WIFI:T:<auth>;S:<ssid>;P:<password>;; — scannable by iOS/Android camera
      text: 'WIFI:T:WPA;S:Your Apartment;P:yourapartment85;;',
      width: 340,
      height: 340,
      colorDark: dark ? '#f1ead9' : '#201b15',
      colorLight: dark ? '#1f1a12' : '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.M
    });
  }
  renderWifiQr();
  if (darkMq && darkMq.addEventListener) {
    darkMq.addEventListener('change', renderWifiQr);
  }

  /* ---- Universal "Message the host" CTA on section pages ---- */
  var ctaSkip = { home: 1, host: 1, kitchen: 1 };
  document.querySelectorAll('.screen').forEach(function (s) {
    if (ctaSkip[s.id]) { return; }
    var page = s.querySelector('.page');
    if (!page || page.querySelector('.cta-host-msg')) { return; }
    var cta = document.createElement('a');
    cta.className = 'cta cta-host-msg';
    cta.href = 'https://wa.me/35699320097';
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.innerHTML = '<svg class="ico"><use href="#i-phone"></use></svg> Send a message to the host';
    page.appendChild(cta);
  });

  /* ---- Brand footer (dark logo strip) appended to every screen ---- */
  document.querySelectorAll('.screen').forEach(function (s) {
    if (s.querySelector('.brand-footer')) { return; }
    var bf = document.createElement('footer');
    bf.className = 'brand-footer';
    bf.innerHTML = '<img class="brand-logo" src="assets/img/logo-dark.svg" alt="Your Apartment Malta" width="432" height="333">';
    s.appendChild(bf);
  });

  /* ---- Map card: send Apple devices to Apple Maps, everyone else to Google Maps ---- */
  var mapLink = document.querySelector('[data-map-link]');
  if (mapLink) {
    var ua = navigator.userAgent || '';
    var isApple = /iPhone|iPad|iPod|Macintosh/i.test(ua);
    var nextHref = mapLink.getAttribute(isApple ? 'data-apple-href' : 'data-google-href');
    if (nextHref) { mapLink.setAttribute('href', nextHref); }
  }

  /* ---- Map card: render a non-interactive Leaflet preview ----
     CARTO Voyager (light) and Dark Matter (dark) are both free, key-less
     OSM-derived tile sets that look closer to Apple Maps than stock Mapnik.
     All Leaflet interaction is disabled so the whole card stays a tap-to-open
     surface for the parent <a>. */
  var mapEl = document.getElementById('address-map');
  if (mapEl && typeof L !== 'undefined') {
    var lat = parseFloat(mapEl.getAttribute('data-lat'));
    var lng = parseFloat(mapEl.getAttribute('data-lng'));
    if (isFinite(lat) && isFinite(lng)) {
      var isDarkMap = prefersDark();
      var tileUrl = isDarkMap
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      var addressMap = L.map(mapEl, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false
      }).setView([lat, lng], 16);

      L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 19 }).addTo(addressMap);

      var pinSvg =
        '<svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M18 2C9 2 2.5 8.5 2.5 17c0 10 15.5 25 15.5 25s15.5-15 15.5-25C33.5 8.5 27 2 18 2z" fill="#e0252a" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<circle cx="18" cy="17" r="5" fill="#fff"/>' +
        '</svg>';
      var pinIcon = L.divIcon({
        className: 'map-pin',
        html: pinSvg,
        iconSize: [36, 44],
        iconAnchor: [18, 42]
      });
      L.marker([lat, lng], { icon: pinIcon, keyboard: false, interactive: false }).addTo(addressMap);
    }
  }

  /* ---- Boot ---- */
  render();
  window.scrollTo(0, 0);
  // enable screen transitions only after first paint (avoids initial flash)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.documentElement.classList.add('anim'); });
  });
})();
