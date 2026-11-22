/* Animaciones de las cartas: sobres de la portada, cartas de sección y diagramas */
(function () {
  // Guarda dónde está el puntero dentro del elemento (--mx y --my, en %) para el brillo; devuelve [x, y] de 0 a 1
  function brillo(el, e) {
    var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', x * 100 + '%');
    el.style.setProperty('--my', y * 100 + '%');
    return [x, y];
  }

  // Sobres de la portada: se inclinan y brillan siguiendo el puntero
  document.querySelectorAll('.pack').forEach(function (p) {
    p.addEventListener('pointermove', function (e) {
      var xy = brillo(p, e);
      if (!Guia.reduce) {
        p.style.setProperty('--ry', (xy[0] - .5) * 26 + 'deg');
        p.style.setProperty('--rx', (.5 - xy[1]) * 26 + 'deg');
      }
    });
    p.addEventListener('pointerleave', function () {
      p.style.setProperty('--rx', '0deg');
      p.style.setProperty('--ry', '0deg');
    });
  });

  // Cartas de sección: se dan la vuelta al entrar en pantalla y tienen un brillo que sigue al puntero
  var cartas = document.querySelectorAll('.opener');
  Guia.alEntrar(cartas, function (o) { o.classList.add('in'); }, .25);
  if (!Guia.reduce) cartas.forEach(function (o) {
    o.addEventListener('pointermove', function (e) { brillo(o, e); });
  });

  // Diagramas: las líneas se dibujan al entrar en pantalla
  Guia.alEntrar(document.querySelectorAll('.fig'), function (f) { f.classList.add('in'); }, .3);
})();
