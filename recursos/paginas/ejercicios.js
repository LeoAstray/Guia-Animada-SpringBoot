/* =========================================================
   CHECKLIST DE LOS EJERCICIOS
   Cada paso del enunciado (<p class="paso">) lleva una casilla para marcarlo como hecho.
   Lo marcado se guarda en el navegador (localStorage), así sigue igual al volver a abrir la página.
   Arriba del enunciado se ve el progreso, y en la tarjeta de la lista, cuántos pasos llevas.
   ========================================================= */
(function () {
  // localStorage protegido (en modo privado o en algunos navegadores con archivos locales puede fallar)
  function leer(clave) {
    try { return JSON.parse(localStorage.getItem(clave) || '[]'); } catch (e) { return []; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {}
  }

  document.querySelectorAll('.panel[id^="ejercicio-"]').forEach(function (panel) {
    var pasos = panel.querySelectorAll('p.paso');
    if (!pasos.length) return;
    var clave = 'checklist-' + panel.id;
    var hechos = leer(clave);

    // Progreso arriba del enunciado
    var progreso = document.createElement('div');
    progreso.className = 'progreso';
    progreso.innerHTML = '<span class="txt" aria-live="polite"></span>' +
      '<span class="barra" aria-hidden="true"><span></span></span>' +
      '<button type="button" class="reset">Desmarcar todo</button>';
    (panel.querySelector('header') || panel).appendChild(progreso);

    // Contador en la tarjeta de la lista
    var enlace = document.querySelector('.ej a.ver[href="#' + panel.id + '"]');
    var meta = enlace && enlace.closest('.ej').querySelector('.meta');
    var contador = null;
    if (meta) {
      contador = document.createElement('span');
      contador.className = 'hechos';
      meta.appendChild(contador);
    }

    var casillas = [];
    pasos.forEach(function (p) {
      var b = p.querySelector('b');
      var n = b ? b.textContent.replace('.', '').trim() : String(casillas.length + 1);
      var etiqueta = document.createElement('label');
      etiqueta.className = 'check';
      var casilla = document.createElement('input');
      casilla.type = 'checkbox';
      casilla.value = n;
      casilla.checked = hechos.indexOf(n) !== -1;
      casilla.setAttribute('aria-label', 'Paso ' + n + ' hecho');
      etiqueta.appendChild(casilla);
      p.insertBefore(etiqueta, p.firstChild);
      p.classList.toggle('hecho', casilla.checked);
      casilla.addEventListener('change', function () {
        p.classList.toggle('hecho', casilla.checked);
        actualizar(true);
      });
      casillas.push(casilla);
    });

    function actualizar(guardarCambios) {
      var marcados = casillas.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      if (guardarCambios) guardar(clave, marcados);
      var total = casillas.length, n = marcados.length;
      progreso.querySelector('.txt').textContent = n === total ? '¡Todo hecho! ' + n + ' de ' + total + ' pasos'
                                                              : n + ' de ' + total + ' pasos hechos';
      progreso.querySelector('.barra > span').style.width = (100 * n / total) + '%';
      progreso.classList.toggle('completo', n === total);
      if (contador) {
        contador.textContent = n + '/' + total + ' hechos';
        contador.hidden = n === 0;
      }
    }

    progreso.querySelector('.reset').addEventListener('click', function () {
      casillas.forEach(function (c) { c.checked = false; c.closest('p').classList.remove('hecho'); });
      actualizar(true);
    });

    actualizar(false);
  });
})();
