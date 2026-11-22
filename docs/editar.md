# Cómo editar la guía

La guía está partida en archivos pequeños. **Editas el contenido y luego construyes.**

## 1. Editar

```
├── contenido/                  ← AQUÍ están los textos
│   ├── _portada.html           portada: título, frase de entrada y los 3 sobres
│   ├── _cabecera.html          metas y tipografías del <head>, compartidas por las tres páginas
│   ├── _pie.html               pie de página
│   ├── _iconos.html            iconos de los diagramas (no hace falta tocarlo)
│   ├── parte-1-data-jpa/
│   │   ├── 00-sobre.html       cabecera de la Parte 1 (título, subtítulo, nombre en el índice)
│   │   ├── 01-crear-el-proyecto-en-spring-initializr.html
│   │   └── 02-... a 17-...
│   ├── parte-2-el-puente/      pasos 18 y 19
│   ├── parte-3-api-rest/       pasos 20 a 32
│   ├── parte-4-ejercicios/     el paso 33: solo un enlace a la sección de ejercicios
│   ├── ejercicios/             los ejercicios: un enunciado y su solucionario por ejercicio (ver más abajo)
│   └── resumen/                los resúmenes de cada paso para la guía resumida (ver más abajo)
├── recursos/                   ← estilos, scripts e imágenes
│   ├── css/                    estilos de la guía completa (cada archivo comentado)
│   │   ├── 00-fuentes.css      las tipografías (Silkscreen, Unbounded, Atkinson), guardadas en fuentes/: la guía no necesita internet
│   │   ├── 01-variables.css    colores y tipografías: cambia un color aquí y cambia en toda la guía
│   │   └── 02-base.css ... 12-impresion.css
│   ├── js/                     animaciones y botones (se cargan en orden por el número)
│   ├── paginas/                CSS y JS del selector, la guía resumida y los ejercicios
│   ├── fuentes/                archivos de las tipografías (.woff2, solo el juego latino, que cubre el español)
│   └── img/                    imágenes (spring-initializr.png)
├── plantillas/                 esqueletos de página (cargador, índice, barra inferior, selector…)
├── guia/                       ← GENERADO: las cuatro páginas para trabajar en carpeta
├── docs/                       documentación (este archivo)
├── construir.py                junta todo
└── Construir guia.bat          doble clic para construir
```

### Cada sección es un archivo así

```html
<section id="paso-7">
<h2>7 Crear PerfilEstadistico: la relación uno a uno</h2>
<p>Texto normal…</p>
<h3>Un subtítulo</h3>
<pre data-f="entity/PerfilEstadistico.java">código aquí</pre>
<div class="warn">Una nota de "Ojo".</div>
</section>
```

- **El número del `<h2>`** (el `7`) es el número de la carta (007/030). El texto que sigue es el título de la carta y del índice.
- **El índice se genera solo** con los `<h2>`. Si un `<h3>` lleva `id="algo"`, también sale en el índice (con `data-indice="Texto"` eliges cómo se llama allí).
- **Notas:** `<div class="kid">` (para un niño de 5 años), `<div class="why">` (por qué), `<div class="warn">` (ojo), `<div class="ok">` (comprobación).
- **Código:** `<pre data-f="ruta/Archivo.java">`. El resaltado y el botón Copiar se ponen solos. Dentro del código escribe `&lt;` en vez de `<` y `&gt;` en vez de `>`.
- **Pasos numerados:** `<p class="paso">1. Haz esto…</p>`.

### Añadir, quitar o reordenar secciones

- **Añadir:** crea un archivo nuevo en la carpeta de su parte. El orden lo marca el nombre del archivo (`07-…` va antes que `08-…`).
- **Quitar:** borra el archivo.
- **Mover:** cambia el número del principio del nombre.

### Añadir un ejercicio o un solucionario

Los ejercicios **no son pasos de la guía**: tienen su propia página (`ejercicios.html`), a la que se llega desde el selector y desde el paso 33. La página muestra una tarjeta por ejercicio, con los botones «Ver el ejercicio» y «Ir al solucionario».

Cada ejercicio son dos archivos en `contenido/ejercicios/`, con el **mismo número y nombre**:

- `02-tienda-online-enunciado.html`
- `02-tienda-online-solucion.html` (puede no existir todavía: la tarjeta muestra «Solucionario: próximamente» y el botón se activa solo cuando creas el archivo)

Cada archivo va dentro de un `<article>`. En el del enunciado, los atributos `data-...` son los datos de la tarjeta:

```html
<article data-titulo="La tienda online" data-resumen="Una frase que cuente de qué va."
         data-tiempo="2 horas" data-puntos="10">
<p>Aquí el enunciado… (texto, tablas, listas y notas como en el resto de la guía)</p>
</article>
```

El solucionario es un `<article>` sin atributos; en él puedes usar `<pre data-f="...">` para el código. No hay que tocar nada más: el orden de los ejercicios lo marca el número del nombre del archivo.

### La guía resumida

Sus resúmenes viven en `contenido/resumen/` y sus plantillas en `plantillas/`:

```
contenido/resumen/
├── pasos-parte-1.html     resumen de los pasos 1 a 17
├── pasos-parte-2.html     pasos 18 y 19
├── pasos-parte-3.html     pasos 20 a 32
└── pasos-parte-4.html     paso 33

plantillas/
├── plantilla-completa.html   esqueleto de la guía completa
├── plantilla-resumida.html   esqueleto de la guía resumida
├── plantilla-ejercicios.html esqueleto de la página de ejercicios
├── plantilla-selector.html   la página que elige entre la completa, la resumida y los ejercicios
└── plantilla-todo.html       la página contenedora del archivo único (enlaza las cuatro páginas)

recursos/paginas/
├── selector.css / selector.js   el selector animado: un gesto de scroll = una opción, tarjetas que giran y cortina de color
├── entrada.js                   la cortina que se recoge al llegar a la guía elegida (va en el <head> de las tres páginas)
└── resumen.css                  estilos de la resumida y de los ejercicios
```

Cada paso es un bloque así. **El título del paso y el enlace a la guía completa se ponen solos**, a partir del `<h2>` del paso:

```html
<article data-paso="11">
<ol>
<li>Primer paso, muy corto.</li>
<li>Segundo paso.</li>
</ol>
</article>
```

- `data-paso` es el **número del paso** (el mismo que el `<h2>` de la guía completa).
- **Para mostrar código** escribe, en el punto donde va, una marca así: `[[codigo:11:public class PerfilEstadistico]]`. El primer número es el paso, y lo que sigue es **un trozo del texto que aparece dentro del bloque** que quieres (se toma el primer bloque de ese paso que lo contenga). El código **no se copia** a mano: `construir.py` lo toma de la guía completa, así que si lo corriges allí, cambia también en la resumida. Los bloques de más de 60 líneas salen plegados en un desplegable. Si una marca no encuentra su bloque, `construir.py` lo avisa.
- Si añades un paso nuevo a la guía completa, añade también su `<article>` aquí; `construir.py` avisa si falta alguno o si sobra.
- Dentro del texto escribe `&lt;` en vez de `<` y `&gt;` en vez de `>`.

## 2. Construir

Doble clic en **`Construir guia.bat`** (necesita Python). Crea:

| Archivo | Para qué |
|---|---|
| `guia/index.html` | El **selector**: elige entre la guía completa, la resumida y los ejercicios. Empieza por aquí. |
| `guia/guia-completa.html` | La guía principal, usando las carpetas de `recursos/`. |
| `guia/guia-resumida.html` | La guía resumida. Cada paso enlaza al mismo paso de la completa. |
| `guia/ejercicios.html` | La sección de ejercicios: la lista y, al abrir uno, su enunciado o su solucionario. |
| `Guia_Animada_SpringBoot_DataJPA_y_REST.html` (en la raíz del proyecto) | **Todo en un solo archivo**, para compartir: el selector y las tres secciones (completa, resumida y ejercicios), con sus estilos, su código y sus imágenes dentro. Funciona igual que la carpeta. |

> **El archivo único** se abre con doble clic y no necesita nada más. Por dentro lleva las cuatro páginas, cada una en su propio marco, y cambia de una a otra con la dirección: `#/` (selector), `#/completa`, `#/completa/paso-11`, `#/resumida`, `#/ejercicios` y `#/ejercicios/solucion-1`. Se pueden copiar esas direcciones para volver a un punto concreto, y el botón Atrás del navegador funciona.
> Por ser marcos, **Ctrl+P no imprime la guía entera** desde el archivo único; para imprimir o sacar un PDF, abre `guia/guia-completa.html`.
>
> No edites los `.html` generados (lo de `guia/` ni el archivo único): se sobrescriben cada vez que construyes.
