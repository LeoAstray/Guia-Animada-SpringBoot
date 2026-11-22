/* Llegar a un paso desde fuera (por ejemplo, desde la guía resumida: guia-completa.html#paso-11).
   El navegador no siempre baja hasta el paso al abrir la página, porque el cargador y las
   tipografías cambian la altura mientras carga. Aquí se baja al paso cuando todo ha asentado,
   y se deja de insistir en cuanto la persona empieza a mover la página. */
(function () {
  var id = '';
  // En el archivo único la guía va dentro de un marco y el paso llega en window.ANCLA_INICIAL
  try { id = decodeURIComponent((location.hash || '#' + (window.ANCLA_INICIAL || '')).slice(1)); } catch (e) {}
  if (!id) return;

  var tocado = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, function () { tocado = true; }, { passive: true, once: true });
  });

  function ir() {
    var el = document.getElementById(id);
    if (!el || tocado) return;
    var raiz = document.documentElement, antes = raiz.style.scrollBehavior;
    raiz.style.scrollBehavior = 'auto';       // salto directo, sin deslizarse desde arriba
    el.scrollIntoView();
    raiz.style.scrollBehavior = antes;
  }

  function lanzar() {
    ir();
    setTimeout(ir, 300);
    setTimeout(ir, 1300);                    // después de que desaparezca el cargador
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ir);
  }
  if (document.readyState === 'complete') lanzar();
  else window.addEventListener('load', lanzar);
})();
