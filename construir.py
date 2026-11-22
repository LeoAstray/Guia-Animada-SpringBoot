"""
Construye las guías a partir de los archivos de contenido/, plantillas/ y recursos/.

En guia/ (enlazan los css/, js/ e img/ de recursos/, para trabajar):
  - index.html           -> el SELECTOR: elige entre la guía completa, la resumida y los ejercicios
  - guia-completa.html   -> la guía principal (todas las explicaciones)
  - guia-resumida.html   -> los mismos pasos, muy resumidos, cada uno con un enlace a la completa
  - ejercicios.html      -> la lista de ejercicios, con su enunciado y su solucionario

También en esta carpeta, para compartir: UN solo archivo con todo lo anterior dentro (el selector y
las tres secciones, que se eligen igual que en la carpeta):
  - Guia_Animada_SpringBoot_DataJPA_y_REST.html

Uso: doble clic en "Construir guia.bat"  o  python construir.py
"""
import base64, html, io, json, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
CONTENIDO = os.path.join(AQUI, 'contenido')
RESUMEN = os.path.join(CONTENIDO, 'resumen')          # los resúmenes de cada paso (pasos-parte-N.html)
PLANTILLAS = os.path.join(AQUI, 'plantillas')
RECURSOS = os.path.join(AQUI, 'recursos')             # css/, js/, fuentes/, img/ y paginas/
SALIDA = os.path.join(AQUI, 'guia')                   # las cuatro páginas generadas para la carpeta
ARCHIVO_UNICO = 'Guia_Animada_SpringBoot_DataJPA_y_REST.html'
RAREZA = {1: 'COMÚN', 2: 'RARA', 3: 'HOLO', 4: 'RETO'}
LINEAS_PARA_PLEGAR = 60   # los bloques de código más largos van dentro de un desplegable


def leer(*ruta):
    return io.open(os.path.join(*ruta), encoding='utf-8').read()


def escribir(ruta, texto):
    io.open(ruta, 'w', encoding='utf-8', newline='\n').write(texto)


def sin_etiquetas(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()


def archivos(carpeta, extension):
    """Rutas relativas a recursos/ ('css/01-variables.css', ...) de una carpeta, ordenadas por nombre."""
    return ['%s/%s' % (carpeta, f) for f in sorted(os.listdir(os.path.join(RECURSOS, carpeta))) if f.endswith(extension)]


# ---------------------------------------------------------------- guía completa

def construir_parte(n, carpeta):
    """Devuelve (html de la parte, grupo del índice, nº de entradas, números de carta, datos de la parte).
    Los datos (título, subtítulo, pasos con su html) los usa la guía resumida."""
    ruta = os.path.join(CONTENIDO, carpeta)
    trozos, enlaces, numeros, nombre_grupo = [], [], [], 'Parte %d' % n
    datos = {'titulo': 'Parte %d' % n, 'subtitulo': '', 'pasos': []}

    for f in sorted(f for f in os.listdir(ruta) if f.endswith('.html')):
        texto = re.sub(r'<!--.*?-->\s*', '', leer(ruta, f), flags=re.S)  # quita comentarios de ayuda

        # Sobre de la parte
        m = re.search(r'<div class="part[^"]*"[^>]*>', texto)
        if f.startswith('00') and m:
            ind = re.search(r'data-indice="([^"]*)"', m.group(0))
            if ind: nombre_grupo = ind.group(1)
            ttl = re.search(r'<span class="ttl">(.*?)<small>(.*?)</small>', texto, re.S)
            if ttl: datos['titulo'], datos['subtitulo'] = sin_etiquetas(ttl.group(1)), sin_etiquetas(ttl.group(2))
            # Insignia "CARTAS 001–017 · COMÚN": el rango se calcula al final
            trozos.append(re.sub(r'</span>\s*</div>\s*$',
                                 '</span>\n  <span class="set">CARTAS {{RANGO%d}} · %s</span>\n</div>' % (n, RAREZA.get(n, '')),
                                 texto.strip()))
            continue

        # Sección: el <h2>N Título</h2> se convierte en la carta de cabecera
        sec = re.search(r'<section id="([^"]+)">\s*<h2>(.*?)</h2>', texto, re.S)
        if not sec:
            print('  AVISO: %s no empieza por <section id="..."><h2>...</h2>; se copia tal cual' % f)
            trozos.append(texto)
            continue
        sid, titulo = sec.group(1), sec.group(2).strip()
        num = re.match(r'(\d+)\s+(.*)$', titulo, re.S)
        numero, titulo_carta = (int(num.group(1)), num.group(2)) if num else (0, titulo)
        carta = ('<section id="%s">\n<header class="opener r%d"><h2>%s</h2>'
                 '<div class="set"><b>%03d</b>/{{TOTAL}} <span class="rar">%s</span></div></header>'
                 % (sid, n, titulo_carta, numero, RAREZA.get(n, '')))
        texto = texto[:sec.start()] + carta + texto[sec.end():]
        trozos.append(texto)
        if num:
            numeros.append(numero)
            datos['pasos'].append({'numero': numero, 'id': sid, 'titulo': sin_etiquetas(titulo_carta), 'html': texto})

        # Enlaces del índice: la sección y sus <h3 id="..."> (con data-indice opcional)
        enlaces.append('<li><a href="#%s">%s</a></li>' % (sid, html.escape(sin_etiquetas(titulo))))
        for h3 in re.finditer(r'<h3 id="([^"]+)"([^>]*)>(.*?)</h3>', texto, re.S):
            et = re.search(r'data-indice="([^"]*)"', h3.group(2))
            enlaces.append('<li class="sub"><a href="#%s">%s</a></li>' % (
                h3.group(1), html.escape(et.group(1) if et else sin_etiquetas(h3.group(3)))))

    grupo = ('<details class="group g%d" open><summary><span class="n">%d</span>%s</summary><ul>%s</ul></details>'
             % (n, n, html.escape(nombre_grupo), ''.join(enlaces)))
    return '\n'.join(trozos), grupo, len(enlaces), numeros, datos


# ---------------------------------------------------------------- guía resumida

def leer_resumenes():
    """Lee contenido/resumen/pasos-parte-*.html y devuelve {nº de paso: html}."""
    res = {}
    for f in sorted(os.listdir(RESUMEN)):
        if f.startswith('pasos-parte-') and f.endswith('.html'):
            texto = re.sub(r'<!--.*?-->', '', leer(RESUMEN, f), flags=re.S)
            for m in re.finditer(r'<article data-paso="(\d+)">\s*(.*?)\s*</article>', texto, re.S):
                res[int(m.group(1))] = m.group(2)
    return res


def poner_codigo(cuerpo, pasos_por_numero):
    """Sustituye cada marca [[codigo:N:texto]] por el bloque <pre> del paso N de la guía completa
    cuyo contenido incluye 'texto'. Así el código se escribe una sola vez (en la guía completa)."""
    def bloque(m):
        n, buscado = int(m.group(1)), html.unescape(m.group(2)).strip()
        paso = pasos_por_numero.get(n)
        if paso is None:
            print('  AVISO: [[codigo:%d:...]] apunta a un paso que no existe' % n)
            return ''
        for pre in re.finditer(r'<pre\b[^>]*>(.*?)</pre>', paso['html'], re.S):
            contenido = html.unescape(re.sub(r'<[^>]+>', '', pre.group(1)))
            if buscado not in contenido:
                continue
            if 'data-f=' not in pre.group(0).split('>', 1)[0]:
                print('  AVISO: el bloque del paso %d con «%s» no tiene título (data-f) en la guía completa' % (n, buscado[:40]))
            lineas = contenido.count('\n') + 1
            if lineas > LINEAS_PARA_PLEGAR:
                return ('<details class="cod"><summary>Ver el código completo (%d líneas)</summary>%s</details>'
                        % (lineas, pre.group(0)))
            return pre.group(0)
        print('  AVISO: en el paso %d no hay ningún bloque de código con «%s»' % (n, buscado[:50]))
        return ''
    return re.sub(r'\[\[codigo:(\d+):(.*?)\]\]', bloque, cuerpo)


def construir_resumida(partes_datos):
    """Devuelve (índice de saltos, partes). Los enlaces a la guía completa empiezan por la marca {{COMPLETA}}."""
    resumenes = leer_resumenes()
    pasos = {p['numero']: p for d in partes_datos for p in d['pasos']}
    indice, partes = [], []
    for n, d in enumerate(partes_datos, 1):
        chips, tarjetas = [], []
        for p in d['pasos']:
            if p['numero'] not in resumenes:
                print('  AVISO: el paso %d (%s) no tiene resumen en contenido/resumen/pasos-parte-*.html' % (p['numero'], p['titulo']))
                continue
            num, tit = p['numero'], html.escape(p['titulo'])
            chips.append('<a href="#r-%d" title="%d. %s">%d</a>' % (num, num, tit, num))
            tarjetas.append(
                '<article class="paso" id="r-%d">\n  <span class="num" aria-hidden="true">%d</span>\n  <h3>%s</h3>\n'
                '  %s\n  <a class="mas" href="{{COMPLETA}}%s">Ver explicación completa →</a>\n</article>'
                % (num, num, tit, poner_codigo(resumenes[num], pasos), p['id']))
        indice.append('    <div class="row p%d"><b>PARTE %d</b>%s</div>' % (n, n, ''.join(chips)))
        sub = '<p>%s</p>' % html.escape(d['subtitulo']) if d['subtitulo'] else ''
        partes.append('<section class="parte p%d" id="parte%d">\n  <header><p class="n">PARTE %d</p><h2>%s</h2>%s</header>\n%s\n</section>'
                      % (n, n, n, html.escape(d['titulo']), sub, '\n'.join(tarjetas)))
    for sobra in sorted(set(resumenes) - set(pasos)):
        print('  AVISO: hay un resumen del paso %d pero no existe ese paso en la guía completa' % sobra)
    return '\n'.join(indice), '\n\n'.join(partes)


# ---------------------------------------------------------------- ejercicios

def leer_ejercicios():
    """Lee contenido/ejercicios/NN-nombre-enunciado.html y, si existe, NN-nombre-solucion.html.
    Los datos de la tarjeta (titulo, resumen, tiempo, puntos) salen de los atributos data-... del <article>."""
    ejercicios = {}
    carpeta = os.path.join(CONTENIDO, 'ejercicios')
    for f in sorted(os.listdir(carpeta)):
        m = re.match(r'(\d+)-.+-(enunciado|solucion)\.html$', f)
        if not m:
            continue
        texto = re.sub(r'<!--.*?-->\s*', '', leer(carpeta, f), flags=re.S)
        art = re.search(r'<article([^>]*)>(.*)</article>', texto, re.S)
        if not art:
            print('  AVISO: %s no está dentro de <article>...</article>; se ignora' % f)
            continue
        ej = ejercicios.setdefault(int(m.group(1)), {'num': int(m.group(1)), 'titulo': 'Ejercicio %d' % int(m.group(1)),
                                                      'resumen': '', 'tiempo': '', 'puntos': '', 'enunciado': None, 'solucion': None})
        ej[m.group(2)] = art.group(2).strip()
        if m.group(2) == 'enunciado':
            ej.update(dict(re.findall(r'data-(\w+)="([^"]*)"', art.group(1))))
    for n, ej in sorted(ejercicios.items()):
        if ej['enunciado'] is None:
            print('  AVISO: el ejercicio %d tiene solucionario pero no enunciado' % n)
    return [e for _, e in sorted(ejercicios.items()) if e['enunciado'] is not None]


def construir_ejercicios(ejercicios):
    """Devuelve (tarjetas de la lista, paneles). Cada ejercicio tiene un panel de enunciado (#ejercicio-N) y,
    si existe su solucionario, otro (#solucion-N). Un panel solo se ve cuando la dirección apunta a él."""
    tarjetas, paneles = [], []
    for e in ejercicios:
        n, titulo = e['num'], html.escape(e['titulo'])
        meta = ''.join('<span>%s</span>' % html.escape(t) for t in
                       (e['tiempo'], '%s puntos' % e['puntos'] if e['puntos'] else '') if t)
        ir_sol = '<a class="sol" href="#solucion-%d">Ir al solucionario</a>' % n if e['solucion'] else \
                 '<span class="off">Solucionario: próximamente</span>'
        tarjetas.append(
            '      <article class="ej">\n        <p class="n">EJERCICIO %d</p>\n        <h2>%s</h2>\n        <p>%s</p>\n'
            '        <div class="meta">%s</div>\n        <div class="acciones"><a class="ver" href="#ejercicio-%d">Ver el ejercicio</a> %s</div>\n'
            '      </article>' % (n, titulo, html.escape(e['resumen']), meta, n, ir_sol))
        todos = '<a href="#">← Todos los ejercicios</a>'
        paneles.append(panel('ejercicio-%d' % n, 'EJERCICIO %d · ENUNCIADO' % n, titulo, e['enunciado'],
                             todos + (' <a href="#solucion-%d">Ir al solucionario →</a>' % n if e['solucion'] else '')))
        if e['solucion']:
            paneles.append(panel('solucion-%d' % n, 'EJERCICIO %d · SOLUCIONARIO' % n, titulo, e['solucion'],
                                 '<a href="#ejercicio-%d">← Volver al enunciado</a> %s' % (n, todos)))
    return '\n'.join(tarjetas), '\n\n'.join(paneles)


def panel(id_, etiqueta, titulo, cuerpo, enlaces):
    """Un panel de la sección de ejercicios: enlaces arriba y abajo, título y contenido."""
    return ('<section class="panel" id="%s">\n  <nav class="nav">%s</nav>\n  <header><p class="n">%s</p><h2>%s</h2></header>\n'
            '%s\n  <nav class="nav pie">%s</nav>\n</section>' % (id_, enlaces, etiqueta, titulo, cuerpo, enlaces))


# ---------------------------------------------------------------- piezas comunes

def incrustar_fuentes(css):
    """En el archivo único no hay carpeta fuentes/: cada url(../fuentes/X.woff2) pasa a ir dentro del CSS."""
    def incrustar(m):
        datos = open(os.path.join(RECURSOS, 'fuentes', m.group(1)), 'rb').read()
        return 'url(data:font/woff2;base64,%s)' % base64.b64encode(datos).decode()
    return re.sub(r'url\(\.\./fuentes/([^)]+)\)', incrustar, css)


def estilos(rutas, unico):
    if unico:
        return '<style>\n%s\n</style>' % incrustar_fuentes('\n'.join(leer(RECURSOS, r) for r in rutas))
    return '\n'.join('<link rel="stylesheet" href="../recursos/%s">' % r for r in rutas)


def scripts(rutas, unico):
    if unico:
        return '<script>\n%s\n</script>' % '\n'.join(leer(RECURSOS, r) for r in rutas)
    return '\n'.join('<script src="../recursos/%s"></script>' % r for r in rutas)


def incrustar_imagenes(texto):
    def incrustar(m):
        ruta = os.path.join(RECURSOS, m.group(1))
        ext = os.path.splitext(ruta)[1][1:].replace('jpg', 'jpeg')
        tipo = 'image/svg+xml' if ext == 'svg' else 'image/' + ext
        return 'src="data:%s;base64,%s"' % (tipo, base64.b64encode(open(ruta, 'rb').read()).decode())
    return re.sub(r'src="(img/[^"]+)"', incrustar, texto)


def rellenar(texto, **valores):
    """Sustituye cada {{CLAVE}} de la plantilla por su valor (las claves se escriben en minúsculas)."""
    for clave, valor in valores.items():
        texto = texto.replace('{{%s}}' % clave.upper(), valor)
    return texto


# En el archivo único, los enlaces entre páginas empiezan por "#/". Este puente (se añade al final de cada
# página) los manda a la página contenedora con un mensaje, y recibe de ella la ancla a la que ir; el resto de
# enlaces funcionan como siempre. Ver plantillas/plantilla-todo.html.
PUENTE = """<script>
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  var destino = a.getAttribute('href');
  // "#/..." es un enlace a otra página; el resto, un enlace dentro de esta (en un marco, un "#x" normal se
  // resolvería contra la página contenedora y recargaría todo el archivo dentro del marco)
  if (destino.indexOf('#/') === 0) parent.postMessage({ ruta: destino }, '*');
  else location.hash = destino;
});
addEventListener('message', function (e) {
  if (e.source !== parent || !e.data || typeof e.data.ancla !== 'string') return;
  var ancla = e.data.ancla, destino = ancla && document.getElementById(ancla);
  location.hash = ancla;                    // necesario para que funcione :target (ejercicios)
  // salto directo, sin deslizarse desde donde estaba (la guía tiene scroll-behavior: smooth)
  if (destino) destino.scrollIntoView({ behavior: 'instant' });
  else scrollTo({ top: 0, behavior: 'instant' });
});
if (window.ANCLA_INICIAL) location.hash = window.ANCLA_INICIAL;
</script>
"""


def main():
    partes, grupos, datos_partes, todos, rangos, entradas = [], [], [], [], {}, 0
    for i, carpeta in enumerate(sorted(d for d in os.listdir(CONTENIDO)
                                       if d.startswith('parte-') and os.path.isdir(os.path.join(CONTENIDO, d))), 1):
        p, g, c, nums, datos = construir_parte(i, carpeta)
        partes.append(p); grupos.append(g); datos_partes.append(datos); todos += nums; entradas += c
        rangos[i] = '%03d–%03d' % (min(nums), max(nums)) if nums else '000'
    cartas = max(todos) if todos else 0

    css, js = archivos('css', '.css'), archivos('js', '.js')
    # Las páginas pequeñas solo necesitan las variables, la base y su CSS (la resumida, también el del código)
    base = ['css/00-fuentes.css', 'css/01-variables.css', 'css/02-base.css']
    css_selector = base + ['paginas/selector.css']
    css_resumida = base + ['css/08-codigo-y-tablas.css', 'paginas/resumen.css']
    css_ejercicios = base + ['css/07-texto-y-notas.css', 'css/08-codigo-y-tablas.css', 'paginas/resumen.css']
    js_resumida = ['js/2-codigo.js']
    js_selector = ['paginas/selector.js']
    js_entrada = ['paginas/entrada.js']

    cabecera = leer(CONTENIDO, '_cabecera.html').strip()
    # Primero se pega el contenido y después se rellenan los totales y rangos, que aparecen también dentro de él
    completa = rellenar(leer(PLANTILLAS, 'plantilla-completa.html'), cabecera=cabecera,
                        iconos=leer(CONTENIDO, '_iconos.html'), portada=leer(CONTENIDO, '_portada.html'),
                        pie=leer(CONTENIDO, '_pie.html'), indice='\n'.join(grupos), secciones='\n\n'.join(partes),
                        total_n=str(cartas), total='%03d' % cartas, **{'rango%d' % i: r for i, r in rangos.items()})
    resumida = rellenar(leer(PLANTILLAS, 'plantilla-resumida.html'), cabecera=cabecera, total=str(cartas))
    indice_res, cuerpo_res = construir_resumida(datos_partes)
    tarjetas_ej, paneles_ej = construir_ejercicios(leer_ejercicios())
    ejercicios = rellenar(leer(PLANTILLAS, 'plantilla-ejercicios.html'), cabecera=cabecera, tarjetas=tarjetas_ej, paneles=paneles_ej)

    selector = leer(PLANTILLAS, 'plantilla-selector.html')

    # Las cuatro páginas se montan dos veces: para la carpeta (enlazan css/ y js/ y entre sí por archivo)
    # y para el archivo único (con todo dentro y enlaces "#/..." que resuelve la página contenedora).
    destinos = {
        'carpeta': dict(unico=False, inicio=('guia-completa.html', 'guia-resumida.html', 'ejercicios.html'),
                        pasos='guia-completa.html#', ejercicios='ejercicios.html',
                        otra=('index.html', '← Elegir otra guía'), atras=('index.html', 'Elegir otra guía')),
        'unico': dict(unico=True, inicio=('#/completa', '#/resumida', '#/ejercicios'),
                      pasos='#/completa/', ejercicios='#/ejercicios',
                      otra=('#/', '← Elegir otra guía'), atras=('#/', 'Elegir otra guía')),
    }

    def montar(v):
        u = v['unico']
        paginas = {
            'inicio': rellenar(selector, cabecera=cabecera, total=str(cartas), css=estilos(css_selector, u), js=scripts(js_selector, u),
                               n_ejercicios=str(len(leer_ejercicios())),
                               href_completa=v['inicio'][0], href_resumida=v['inicio'][1], href_ejercicios=v['inicio'][2]),
            'completa': rellenar(completa, entrada=scripts(js_entrada, u), css=estilos(css, u), js=scripts(js, u), enlace_otra=v['otra'][0],
                                 texto_otra=v['otra'][1], enlace_ejercicios=v['ejercicios']),
            'resumida': rellenar(resumida, entrada=scripts(js_entrada, u), indice=indice_res, partes=cuerpo_res, css=estilos(css_resumida, u),
                                 js=scripts(js_resumida, u), enlace_atras=v['atras'][0], texto_atras=v['atras'][1],
                                 enlace_ejercicios=v['ejercicios']).replace('{{COMPLETA}}', v['pasos']),
            'ejercicios': rellenar(ejercicios, entrada=scripts(js_entrada, u), css=estilos(css_ejercicios, u), js=scripts(js_resumida, u),
                                   enlace_atras=v['atras'][0], texto_atras=v['atras'][1]),
        }
        if u:
            paginas['completa'] = incrustar_imagenes(paginas['completa'])
            paginas = {k: p.replace('</body>', PUENTE + '</body>') for k, p in paginas.items()}
        else:
            paginas['completa'] = paginas['completa'].replace('src="img/', 'src="../recursos/img/')
        return paginas

    carpeta = montar(destinos['carpeta'])
    os.makedirs(SALIDA, exist_ok=True)
    escribir(os.path.join(SALIDA, 'index.html'), carpeta['inicio'])
    escribir(os.path.join(SALIDA, 'guia-completa.html'), carpeta['completa'])
    escribir(os.path.join(SALIDA, 'guia-resumida.html'), carpeta['resumida'])
    escribir(os.path.join(SALIDA, 'ejercicios.html'), carpeta['ejercicios'])

    # El texto va dentro de un <script>: se protegen las secuencias que podrían cerrarlo o abrir un comentario
    paginas_json = json.dumps(montar(destinos['unico'])).replace('</', '<\\/').replace('<!--', '<\\!--')
    escribir(os.path.join(AQUI, ARCHIVO_UNICO), rellenar(leer(PLANTILLAS, 'plantilla-todo.html'), paginas=paginas_json))

    print('Guías construidas: %d cartas, %d entradas en el índice, %d CSS, %d JS.' % (cartas, entradas, len(css), len(js)))
    print('  -> guia/: index.html (selector), guia-completa.html, guia-resumida.html, ejercicios.html')
    print('  -> todo en un solo archivo: %s' % ARCHIVO_UNICO)


if __name__ == '__main__':
    main()
