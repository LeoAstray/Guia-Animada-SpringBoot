/* Entrada con cortina: si se llega desde el selector, la cortina del color de la opción elegida sigue tapando
   la página mientras carga y luego se recoge hacia el punto donde se pulsó. Va en el <head> para que ni un
   instante se vea la página sin cortina. En la carpeta, los datos llegan por sessionStorage; en el archivo
   único, por window.REVELA (página nueva) o por un mensaje (página que ya estaba abierta). */
(function () {
  var d, quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    d = window.REVELA;
    if (!d) d = JSON.parse(sessionStorage.getItem('cortina') || 'null');
    sessionStorage.removeItem('cortina');
  } catch (e) {}

  function abrir(d) {
    if (!d || Date.now() - d.t > 8000) return;
    var raiz = document.documentElement, punto = d.x + 'px ' + d.y + 'px';
    var cortina = document.createElement('div'), texto = document.createElement('span');
    cortina.setAttribute('aria-hidden', 'true');
    cortina.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;pointer-events:none;background:' +
      d.color + ';clip-path:circle(150vmax at ' + punto + ')';
    texto.style.cssText = 'color:#0d0a1f;font:700 14px Silkscreen,monospace;letter-spacing:.06em;text-transform:uppercase;text-align:center;padding:0 1rem';
    texto.textContent = d.texto || '';
    cortina.appendChild(texto);
    raiz.classList.add('entra');          // la guía completa se salta su cargador: la cortina ya hace de cargador
    raiz.appendChild(cortina);

    var hecho = false;
    function recoger() {
      if (hecho) return;
      hecho = true;
      cortina.getBoundingClientRect();    // fija el estado inicial para que la transición arranque
      texto.style.transition = 'opacity .25s';
      texto.style.opacity = '0';
      cortina.style.transition = quieto ? 'opacity .3s' : 'clip-path .95s cubic-bezier(.16,1,.3,1)';
      if (quieto) cortina.style.opacity = '0'; else cortina.style.clipPath = 'circle(0 at ' + punto + ')';
      setTimeout(function () { cortina.remove(); raiz.classList.remove('entra'); }, 1100);
    }
    // Se espera a la página Y a las tipografías: si se recogiera antes, se vería el texto saltar al cambiar de letra
    var lista = new Promise(function (ok) {
      if (document.readyState === 'complete') ok(); else addEventListener('load', ok);
    }).then(function () { return document.fonts ? document.fonts.ready : 0; });
    lista.then(function () { setTimeout(recoger, 250); });
    setTimeout(recoger, 3500);            // por si la carga se alarga (sin conexión, por ejemplo)
  }

  addEventListener('message', function (e) { if (e.source === parent && e.data && e.data.revela) abrir(e.data.revela); });
  abrir(d);
})();
