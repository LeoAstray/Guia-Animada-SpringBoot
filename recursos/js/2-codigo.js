/* Bloques de código: resaltado de Java y botón "Copiar". Tablas con scroll en móvil. */
(function () {
  // Tablas: se envuelven en .tw para que hagan scroll horizontal en pantallas estrechas
  document.querySelectorAll('main table').forEach(function (t) {
    var w = document.createElement('div'); w.className = 'tw';
    t.parentNode.insertBefore(w, t); w.appendChild(t);
  });

  // Resaltado sencillo para Java (comentarios, textos, anotaciones, palabras clave, números)
  var RX = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|(@\w+)|\b(public|private|protected|class|interface|record|enum|extends|implements|return|new|if|else|for|try|catch|throw|import|package|static|final|void|int|long|boolean|double|null|true|false|this|instanceof)\b|\b(\d+L?)\b/g;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  document.querySelectorAll('pre').forEach(function (pre) {
    var text = pre.textContent;
    var esJava = /\b(public|private)\b[\s\S]*[{;]|^@\w+/m.test(text) && /\b(class|interface|record|enum|import)\b/.test(text);
    if (esJava) {
      var out = '', last = 0, m;
      RX.lastIndex = 0;
      while ((m = RX.exec(text))) {
        out += esc(text.slice(last, m.index));
        var cls = m[1] ? 't-c' : m[2] ? 't-s' : m[3] ? 't-a' : m[4] ? 't-k' : 't-n';
        out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
        last = RX.lastIndex;
      }
      out += esc(text.slice(last));
      pre.setAttribute('data-raw', text);
      pre.innerHTML = out;
    }

    // Botón Copiar
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy'; b.textContent = 'Copiar';
    b.addEventListener('click', function () {
      var raw = pre.getAttribute('data-raw') || text;
      function hecho() { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1400); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(raw).then(hecho, function () { copiaAntigua(raw); hecho(); });
      } else { copiaAntigua(raw); hecho(); }
    });
    pre.appendChild(b);
  });

  // Copia para navegadores sin portapapeles moderno (o abriendo el archivo sin servidor)
  function copiaAntigua(t) {
    var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(a);
  }

  // Al imprimir, abrir todos los desplegables
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('details').forEach(function (d) { d.setAttribute('open', ''); });
  });
})();
