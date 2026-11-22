/* Utilidades compartidas por el resto de scripts */
window.Guia = {
  // Total de cartas (lo escribe construir.py en <html data-total>)
  total: document.documentElement.getAttribute('data-total') || '030',
  // ¿El usuario pide menos movimiento en su sistema?
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,

  // localStorage protegido (en modo privado puede fallar)
  get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },

  // Ejecuta fn(elemento) la primera vez que cada elemento entra en pantalla
  alEntrar: function (elementos, fn, umbral) {
    if (!('IntersectionObserver' in window) || Guia.reduce) { elementos.forEach(fn); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { threshold: umbral || .25 });
    elementos.forEach(function (el) { io.observe(el); });
  },

  // Número de carta (p. ej. "007") de una sección
  numero: function (sec) { var b = sec.querySelector('.opener .set b'); return b ? b.textContent : '000'; }
};
