/* Barra de progreso, mostrar/ocultar el dock y modo repaso */
(function () {
  var prog = document.getElementById('progress');
  var dock = document.getElementById('dock');
  var hero = document.querySelector('.hero');

  // Barra de progreso y dock oculto mientras estás en la portada
  function alHacerScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (prog) prog.style.setProperty('--p', max > 0 ? (h.scrollTop / max).toFixed(4) : 0);
    if (dock && hero) dock.classList.toggle('hide', h.scrollTop < hero.offsetHeight * .6);
  }
  addEventListener('scroll', alHacerScroll, { passive: true });
  alHacerScroll();

  // Modo repaso: oculta párrafos, código y figuras; deja títulos, notas y tablas
  var rep = document.getElementById('dock-repaso');
  if (!rep) return;
  function ponerRepaso(on) {
    document.documentElement.classList.toggle('repaso', on);
    rep.setAttribute('aria-pressed', on ? 'true' : 'false');
    Guia.set('guia-repaso', on ? '1' : '0');
  }
  rep.addEventListener('click', function () { ponerRepaso(!document.documentElement.classList.contains('repaso')); });
  if (Guia.get('guia-repaso') === '1') ponerRepaso(true);
})();
