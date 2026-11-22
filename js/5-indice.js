/* Índice lateral: sección activa, "aquí lo dejaste" y cajón en el móvil */
(function () {
  var sb = document.querySelector('.sidebar');
  var idx = document.getElementById('dock-idx');
  var cerrar = document.getElementById('drawer-close');
  if (!sb) return;

  // --- Sección activa en el índice + contador del dock + recordar la última ---
  var links = {};
  sb.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var contador = document.getElementById('dock-count');
  var actual = null;

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sec = e.target;
        if (contador) contador.textContent = Guia.numero(sec) + '/' + Guia.total;
        Guia.set('guia-ultima', sec.id);
        var a = links[sec.id];
        if (!a) return;
        if (actual) actual.classList.remove('active');
        actual = a; a.classList.add('active');
        // En escritorio, mantener visible el enlace activo dentro del índice
        if (sb.scrollHeight > sb.clientHeight && innerWidth >= 960) {
          var r = a.getBoundingClientRect();
          if (r.top < 80 || r.bottom > innerHeight - 40) a.scrollIntoView({ block: 'center' });
        }
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  // --- "Seguir donde lo dejé" ---
  var ultima = Guia.get('guia-ultima'), sec = ultima && document.getElementById(ultima);
  if (sec) {
    var btn = document.getElementById('resume');
    if (btn) {
      btn.href = '#' + ultima; btn.hidden = false;
      document.getElementById('resume-n').textContent = Guia.numero(sec) + '/' + Guia.total;
    }
    if (links[ultima]) links[ultima].classList.add('left');
  }

  // --- Cajón del índice en el móvil ---
  var scrim = document.createElement('div'); scrim.className = 'scrim';
  document.body.appendChild(scrim);
  function abrir() {
    sb.classList.add('open'); scrim.classList.add('on');
    if (idx) idx.setAttribute('aria-expanded', 'true');
    if (cerrar) cerrar.focus();
  }
  function cerrarIndice() {
    if (!sb.classList.contains('open')) return;
    sb.classList.remove('open'); scrim.classList.remove('on');
    if (idx) idx.setAttribute('aria-expanded', 'false');
  }
  if (idx) {
    idx.setAttribute('aria-expanded', 'false');
    idx.addEventListener('click', function () { sb.classList.contains('open') ? cerrarIndice() : abrir(); });
  }
  if (cerrar) cerrar.addEventListener('click', function () { cerrarIndice(); if (idx) idx.focus(); });
  scrim.addEventListener('click', cerrarIndice);
  sb.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', cerrarIndice); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarIndice(); });
})();
