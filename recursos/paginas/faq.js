/* =========================================================
   PREGUNTAS FRECUENTES: buscador y filtros por tema
   - Mientras escribes, solo quedan las preguntas que contienen todas tus palabras (en la pregunta,
     en la respuesta o en sus data-claves). No distingue mayúsculas ni tildes: «lazy» encuentra «LAZY»
     y «relacion» encuentra «relación». Lo que coincide se resalta.
   - Los temas filtran la lista; cada uno muestra cuántas preguntas suyas encajan con la búsqueda.
   - Atajos: «/» va al buscador, Esc lo borra, Intro abre la primera pregunta encontrada.
   - Una dirección con #id-de-pregunta abre esa pregunta (sirve para compartir una respuesta).
   Sin este script la página se lee entera y los temas son enlaces normales.
   ========================================================= */
(function () {
  var q = document.getElementById('q');
  if (!q) return;
  var borrar = document.querySelector('.borrar');
  var estado = document.getElementById('estado');
  var vacio = document.getElementById('vacio');
  var vacioQ = document.getElementById('vacio-q');
  var vacioTema = document.getElementById('vacio-tema');
  var vacioOtros = document.getElementById('vacio-otros');
  var vacioN = document.getElementById('vacio-n');
  var buscador = document.querySelector('.buscador');
  var temas = [].slice.call(document.querySelectorAll('.tema'));
  var chips = [].slice.call(document.querySelectorAll('.temas .chip'));
  var faqs = [].slice.call(document.querySelectorAll('details.faq'));
  var total = faqs.length;
  var temaActivo = '';                     // '' = todos

  // Texto sin tildes y en minúsculas, para comparar
  function normal(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Lo que se busca de cada pregunta: su texto completo más sus palabras clave
  var indice = faqs.map(function (f) {
    var pregunta = f.querySelector('summary');
    return {
      el: f,
      tema: f.closest('.tema'),
      pregunta: normal(pregunta.textContent),
      todo: normal(f.textContent + ' ' + (f.dataset.claves || ''))
    };
  });

  // ---------- Resaltado (sin tocar los bloques de código, que tienen sus botones) ----------
  function quitarResaltado() {
    [].forEach.call(document.querySelectorAll('mark.hl'), function (m) {
      var padre = m.parentNode;
      padre.replaceChild(document.createTextNode(m.textContent), m);
      padre.normalize();
    });
  }
  function resaltar(raiz, palabras) {
    if (!palabras.length) return;
    var paseo = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.parentNode.closest('pre, button, .ver, mark') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodos = [];
    while (paseo.nextNode()) nodos.push(paseo.currentNode);
    nodos.forEach(function (nodo) {
      var texto = nodo.nodeValue, plano = normal(texto), trozos = [];
      // Las tildes se quitan carácter a carácter, así que las posiciones de «plano» y «texto» coinciden
      if (plano.length !== texto.length) return;
      palabras.forEach(function (p) {
        var i = plano.indexOf(p);
        while (i !== -1) { trozos.push([i, i + p.length]); i = plano.indexOf(p, i + p.length); }
      });
      if (!trozos.length) return;
      trozos.sort(function (a, b) { return a[0] - b[0]; });
      var frag = document.createDocumentFragment(), desde = 0;
      trozos.forEach(function (t) {
        if (t[0] < desde) return;                               // se solapa con el anterior
        frag.appendChild(document.createTextNode(texto.slice(desde, t[0])));
        var m = document.createElement('mark');
        m.className = 'hl';
        m.textContent = texto.slice(t[0], t[1]);
        frag.appendChild(m);
        desde = t[1];
      });
      frag.appendChild(document.createTextNode(texto.slice(desde)));
      nodo.parentNode.replaceChild(frag, nodo);
    });
  }

  // ---------- Filtrar ----------
  // ---------- Animación del filtrado ----------
  // Lo que vuelve a aparecer entra con un fundido corto y escalonado; un número que cambia hace un «tic».
  // La primera vez (al cargar) no se anima nada, y con «reducir movimiento» el CSS lo desactiva.
  var primeraVez = true, orden = 0;
  function entrar(el) {
    if (primeraVez) return;
    el.classList.remove('entra');
    void el.offsetWidth;                   // reinicia la animación si ya la tenía
    el.style.animationDelay = Math.min(orden++, 10) * 22 + 'ms';
    el.classList.add('entra');
  }
  function contar(el, valor) {
    if (el.textContent === String(valor)) return;
    el.textContent = valor;
    if (primeraVez) return;
    el.classList.remove('tic');
    void el.offsetWidth;
    el.classList.add('tic');
  }
  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'faq-entra') { e.target.classList.remove('entra'); e.target.style.animationDelay = ''; }
    if (e.animationName === 'faq-tic') e.target.classList.remove('tic');
  });

  var abiertasPorBusqueda = [];
  function aplicar() {
    orden = 0;
    var texto = q.value.trim();
    var palabras = normal(texto).split(/\s+/).filter(Boolean);
    borrar.hidden = !texto;
    quitarResaltado();
    abiertasPorBusqueda.forEach(function (f) { f.open = false; });
    abiertasPorBusqueda = [];

    var porTema = {}, visibles = [];
    indice.forEach(function (item) {
      var coincide = palabras.every(function (p) { return item.todo.indexOf(p) !== -1; });
      if (coincide) porTema[item.tema.id] = (porTema[item.tema.id] || 0) + 1;
      var ver = coincide && (!temaActivo || item.tema.id === temaActivo);
      var estaba = !item.el.hidden;
      item.el.hidden = !ver;
      if (ver && !estaba) entrar(item.el);
      if (ver) visibles.push(item);
    });

    temas.forEach(function (t) {
      var n = t.querySelectorAll('details.faq:not([hidden])').length;
      var estaba = !t.hidden;
      t.hidden = n === 0;
      if (n && !estaba) entrar(t.querySelector('h2'));
      var cuenta = t.querySelector('h2 .n');
      if (cuenta) contar(cuenta, n === 1 ? '1 pregunta' : n + ' preguntas');
    });
    var encontradas = Object.keys(porTema).reduce(function (s, k) { return s + porTema[k]; }, 0);
    chips.forEach(function (c) {
      var id = c.getAttribute('href').slice(1), n = id === 'inicio' ? encontradas : (porTema[id] || 0);
      contar(c.querySelector('span'), n);
      c.classList.toggle('cero', n === 0 && id !== 'inicio');
    });

    if (palabras.length) {
      // Pocas coincidencias: se abren solas, para ver la respuesta sin un clic más
      if (visibles.length <= 2) visibles.forEach(function (item) { if (!item.el.open) { item.el.open = true; abiertasPorBusqueda.push(item.el); } });
      visibles.forEach(function (item) { resaltar(item.el, palabras); });
    }

    var n = visibles.length;
    var vacioAntes = !vacio.hidden;
    vacio.hidden = n !== 0;
    vacio.classList.toggle('dibuja', n === 0 && !vacioAntes);
    vacioQ.textContent = '«' + texto + '»';
    // Si no sale nada por culpa del tema elegido, se dice y se ofrece volver a todos
    var enTema = temaActivo && encontradas > 0;
    var nombreTema = temaActivo ? document.getElementById(temaActivo).querySelector('h2').firstChild.textContent.trim() : '';
    vacioTema.textContent = enTema ? ' en «' + nombreTema + '»' : '';
    vacioOtros.hidden = !enTema;
    vacioN.textContent = encontradas === 1 ? '1 pregunta' : encontradas + ' preguntas';
    if (!palabras.length && !temaActivo) estado.textContent = '';
    else if (n === 0) estado.textContent = '';
    else estado.innerHTML = '<b>' + n + '</b> ' + (n === 1 ? 'pregunta encontrada' : 'preguntas encontradas') +
      (palabras.length ? '' : ' en este tema') + '. Intro abre la primera.';
    primeraVez = false;
  }

  var espera = 0;
  q.addEventListener('input', function () { clearTimeout(espera); espera = setTimeout(aplicar, 90); });
  borrar.addEventListener('click', function () { q.value = ''; aplicar(); q.focus(); });

  // Intro: abre la primera pregunta visible y lleva hasta ella
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (q.value) { e.preventDefault(); q.value = ''; aplicar(); } else q.blur(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(espera);                // por si aún no se había aplicado lo último que se escribió
      aplicar();
      var primera = faqs.filter(function (f) { return !f.hidden; })[0];
      if (!primera) return;
      primera.open = true;
      primera.scrollIntoView({ block: 'start' });
      primera.querySelector('summary').focus({ preventScroll: true });
    }
  });

  // «/» desde cualquier parte de la página lleva al buscador
  addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    e.preventDefault();
    q.focus();
    q.select();
  });

  // Temas: filtran (pulsar el activo, o «Todos», quita el filtro)
  chips.forEach(function (c) {
    c.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();                 // en el archivo único, el puente no debe tratarlo como un enlace
      var id = c.getAttribute('href').slice(1);
      temaActivo = (id === 'inicio' || id === temaActivo) ? '' : id;
      chips.forEach(function (k) {
        var kid = k.getAttribute('href').slice(1);
        k.setAttribute('aria-current', String(temaActivo ? kid === temaActivo : kid === 'inicio'));
      });
      aplicar();
      if (buscador.getBoundingClientRect().top <= parseFloat(getComputedStyle(buscador).top) + 1) {
        var lista = document.querySelector('.lista');
        scrollTo({ top: lista.getBoundingClientRect().top + scrollY - buscador.offsetHeight - buscador.offsetTop - 16 });
      }
    });
  });

  // «Ver las N de todos los temas» (estado vacío con un tema elegido)
  document.getElementById('ver-todos').addEventListener('click', function () { chips[0].click(); q.focus(); });

  // Sugerencias del estado vacío
  [].forEach.call(document.querySelectorAll('.sugerencias button'), function (b) {
    b.addEventListener('click', function () {
      q.value = b.dataset.q;
      if (temaActivo) chips[0].click(); else aplicar();
      q.focus();
    });
  });

  // ---------- Abrir la pregunta de la dirección (#id) ----------
  function abrirAncla() {
    var id = decodeURIComponent(location.hash.slice(1));
    var f = id && document.getElementById(id);
    if (!f || f.tagName !== 'DETAILS' || !f.classList.contains('faq')) return;
    if (f.hidden) { q.value = ''; temaActivo = ''; chips[0].click(); }
    f.open = true;
    f.scrollIntoView({ block: 'start' });
  }
  // Al saltar a una pregunta (Intro, #id), que quede debajo del buscador fijo y no tapada por él
  function ajustarHueco() {
    var arriba = parseFloat(getComputedStyle(buscador).top) || 0;
    document.documentElement.style.scrollPaddingTop = Math.ceil(arriba + buscador.offsetHeight + 16) + 'px';
  }
  ajustarHueco();
  addEventListener('resize', ajustarHueco);
  if (document.fonts) document.fonts.ready.then(ajustarHueco);   // las fuentes cambian la altura del campo

  addEventListener('hashchange', abrirAncla);
  abrirAncla();

  aplicar();
})();
