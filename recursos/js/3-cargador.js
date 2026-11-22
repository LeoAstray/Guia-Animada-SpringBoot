/* Cargador con porcentaje: solo la primera vez que abres la guía en la sesión */
(function () {
  var L = document.getElementById('loader');
  if (!L) return;
  var visto = false;
  try { visto = sessionStorage.getItem('guia-loaded'); sessionStorage.setItem('guia-loaded', '1'); } catch (e) {}

  // Si se llega desde el selector, su cortina de color ya hace de cargador (ver recursos/paginas/entrada.js)
  if (document.documentElement.classList.contains('entra')) { L.remove(); return; }

  if (Guia.reduce || visto) {
    L.remove();
    // Sin cargador, la portada anima sin esperar
    document.querySelectorAll('.hero h1 .w, .pack').forEach(function (el) { el.style.animationDelay = '0s'; });
    return;
  }

  var bar = document.getElementById('bar'), pct = document.getElementById('pct'), n = 0;
  for (var i = 0; i < 12; i++) bar.appendChild(document.createElement('i'));
  var t = setInterval(function () {
    n = Math.min(100, n + Math.ceil(Math.random() * 15));
    pct.textContent = 'BARAJANDO ' + parseInt(Guia.total, 10) + ' CARTAS · ' + n + '%';
    Array.prototype.forEach.call(bar.children, function (b, i) { b.classList.toggle('on', i < Math.round(n / 100 * 12)); });
    if (n >= 100) {
      clearInterval(t);
      setTimeout(function () { L.classList.add('done'); }, 150);
      setTimeout(function () { L.remove(); }, 1100);
    }
  }, 55);
})();
