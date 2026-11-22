/* Selector de guías: un gesto de scroll = una opción. La rueda, el dedo y el teclado llevan a la opción
   siguiente con un deslizamiento suave (no hace falta recorrer la página); las tarjetas giran siguiendo ese
   scroll y, al elegir, una cortina de color abre la guía (la página de destino la recoge: resumen/entrada.js).
   Sin este script la página sigue siendo usable: las tres opciones salen una debajo de otra (ver <noscript>). */
(function () {
  var pista = document.getElementById('pista');
  var cartas = [].slice.call(document.querySelectorAll('.carta'));
  var textos = [].slice.call(document.querySelectorAll('.texto'));
  var fondos = [].slice.call(document.querySelectorAll('.fondo'));
  var rieles = [].slice.call(document.querySelectorAll('.riel a'));
  var cuenta = document.getElementById('cuenta');
  var cortina = document.getElementById('cortina');
  var n = cartas.length;
  var quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pos = 0, meta = 0, activa = -1, cuadro = 0;

  // Dónde está el scroll, en "opciones": 0 es la primera, 1 la segunda, 2 la tercera (admite decimales)
  function medir() {
    meta = Math.max(0, Math.min(n - 1, window.scrollY / (pista.offsetHeight / n)));
  }
  function limitar(v) { return Math.max(0, Math.min(1, v)); }

  function pintar() {
    var paso = cartas[0].offsetWidth * 0.86;
    cartas.forEach(function (c, i) {
      var d = i - pos, a = Math.abs(d);
      c.style.transform = 'translate(-50%, -50%) translate3d(' + (d * paso) + 'px, 0, ' + (-Math.min(a, 1.4) * 140) + 'px)' +
        ' rotateY(' + (-d * 34) + 'deg) scale(' + (1.04 - Math.min(a, 1) * 0.3) + ')';
      c.style.opacity = 1 - Math.min(a, 1) * 0.55;
      c.style.zIndex = 10 - Math.round(a * 4);
    });
    textos.forEach(function (t, i) {
      var d = i - pos;
      t.style.opacity = limitar(1 - Math.abs(d) * 2.2);
      t.style.transform = 'translateY(' + (d * 26) + 'px)';
    });
    fondos.forEach(function (f, i) { f.style.opacity = limitar(1 - Math.abs(i - pos) * 1.1); });
    var cerca = Math.round(pos);
    if (cerca !== activa) marcar(cerca);
  }

  // La opción del centro: qué tarjeta se dibuja, qué texto se puede pulsar y qué número se ilumina
  function marcar(i) {
    activa = i;
    cartas.forEach(function (c, k) { c.classList.toggle('activa', k === i); });
    textos.forEach(function (t, k) { t.classList.toggle('activa', k === i); t.inert = k !== i; });
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.texto[inert]')) rieles[i].focus({ preventScroll: true });   // el foco no se pierde al girar
    rieles.forEach(function (r, k) { r.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    cuenta.textContent = (i + 1) + ' / ' + n;
    cuenta.setAttribute('aria-label', 'Opción ' + (i + 1) + ' de ' + n);
  }

  function bucle() {
    cuadro = 0;
    medir();
    var dif = meta - pos;
    pos = quieto || Math.abs(dif) < 0.002 ? meta : pos + dif * 0.2;
    pintar();
    document.body.classList.toggle('visto', window.scrollY > 40);
    if (pos !== meta) cuadro = requestAnimationFrame(bucle);
  }
  function pedir() { if (!cuadro) cuadro = requestAnimationFrame(bucle); }

  // ---------- Ir a una opción con un deslizamiento suave ----------
  var yendo = false, libreHasta = 0, ultimoGesto = 0, espera = 0;
  function suave(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function ir(i) {
    i = Math.max(0, Math.min(n - 1, i));
    var desde = window.scrollY, hasta = i * (pista.offsetHeight / n);
    if (Math.abs(hasta - desde) < 1) return;
    if (quieto) { window.scrollTo(0, hasta); return; }
    var t0 = performance.now(), dur = 1000;
    yendo = true;
    (function paso(ahora) {
      var t = Math.min(1, (ahora - t0) / dur);
      window.scrollTo(0, desde + (hasta - desde) * suave(t));
      if (t < 1) requestAnimationFrame(paso);
      else { yendo = false; libreHasta = performance.now() + 150; }
    })(t0);
  }
  // Un gesto (aunque la rueda o el dedo sigan "rodando" por inercia) solo cuenta una vez
  function gesto(sentido) {
    var ahora = performance.now(), seguido = ahora - ultimoGesto < 160;
    ultimoGesto = ahora;
    if (yendo || seguido || ahora < libreHasta) return;
    ir(Math.round(meta) + sentido);
  }

  addEventListener('scroll', function () {
    pedir();
    if (yendo) return;
    // Arrastrar la barra de scroll: al soltar, se acomoda en la opción más cercana
    clearTimeout(espera);
    espera = setTimeout(function () { if (!yendo) ir(Math.round(meta)); }, 180);
  }, { passive: true });
  addEventListener('resize', pedir);

  addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;               // el zoom del navegador
    e.preventDefault();
    if (Math.abs(e.deltaY) > 2) gesto(e.deltaY > 0 ? 1 : -1);
    else ultimoGesto = performance.now();
  }, { passive: false });

  var y0 = null;                          // dedo (el CSS desactiva el scroll nativo táctil: touch-action: none)
  addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', function (e) {
    if (y0 === null) return;
    var dy = y0 - e.changedTouches[0].clientY; y0 = null;
    if (Math.abs(dy) > 36) gesto(dy > 0 ? 1 : -1);
  }, { passive: true });

  addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var s = { ArrowDown: 1, PageDown: 1, ArrowRight: 1, ArrowUp: -1, PageUp: -1, ArrowLeft: -1 }[e.key];
    if (e.key === ' ' && !(e.target.closest && e.target.closest('a, button'))) s = e.shiftKey ? -1 : 1;
    if (e.key === 'Home') { e.preventDefault(); ir(0); return; }
    if (e.key === 'End') { e.preventDefault(); ir(n - 1); return; }
    if (!s) return;
    e.preventDefault();
    gesto(s);
  });

  // Los números de la derecha y las tarjetas: la de los lados se coloca en el centro; la del centro abre su guía
  rieles.forEach(function (r, i) {
    r.addEventListener('click', function (e) { e.preventDefault(); ir(i); });
  });
  cartas.forEach(function (c, i) {
    c.addEventListener('click', function () {
      if (i === activa) textos[i].querySelector('.abrir').click(); else ir(i);
    });
  });

  // ---------- Abrir una guía ----------
  // La cortina crece desde el botón con el color de la opción. Al cubrirlo todo se navega, y la página de
  // destino la recoge con la misma cortina (los datos viajan por sessionStorage, o por mensaje en el archivo único).
  [].forEach.call(document.querySelectorAll('.abrir'), function (a) {
    a.addEventListener('click', function (e) {
      if (a.dataset.sigue || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      e.stopPropagation();          // en el archivo único, el puente de la guía no debe adelantarse a la cortina
      var r = a.getBoundingClientRect();
      var datos = {
        x: Math.round(e.clientX || r.left + r.width / 2), y: Math.round(e.clientY || r.top + r.height / 2),
        color: getComputedStyle(a).backgroundColor, texto: 'Abriendo ' + a.dataset.nombre
      };
      cortina.style.setProperty('--x', datos.x + 'px');
      cortina.style.setProperty('--y', datos.y + 'px');
      cortina.style.setProperty('--color', datos.color);
      cortina.firstElementChild.textContent = datos.texto;
      cortina.classList.add('cierra');
      setTimeout(function () {
        datos.t = Date.now();
        try { sessionStorage.setItem('cortina', JSON.stringify(datos)); } catch (err) {}
        if (parent !== window) parent.postMessage({ cortina: datos }, '*');
        a.dataset.sigue = '1'; a.click(); delete a.dataset.sigue;
        setTimeout(function () { cortina.classList.remove('cierra'); }, 1500);   // por si la página sigue aquí
      }, quieto ? 350 : 900);
    });
  });
  addEventListener('pageshow', function (e) { if (e.persisted) cortina.classList.remove('cierra'); });

  medir(); pos = meta; pintar(); pedir();
})();
