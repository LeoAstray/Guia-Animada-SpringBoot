---
version: 1
slug: "plantillas-plantilla-faq-html"
primary_target: "plantillas/plantilla-faq.html"
related_targets: ["recursos/paginas/faq.css","recursos/paginas/faq.js","contenido/faq/preguntas.html"]
---

# FAQ (plantillas/plantilla-faq.html)

Mode: Read. Cuarta sección hermana de la guía completa, la resumida y los ejercicios; hereda su mundo (fondo void, Unbounded/Atkinson/Silkscreen, barra superior común) con el rosa como color propio.

Audience and job: quien sigue la guía y se atasca con una duda concreta (propietario, LAZY, cascade, DTO, @Transactional, códigos HTTP...). Quiere escribirla y encontrar la respuesta completa en segundos, y saltar al paso de la guía si quiere más.

Content: preguntas del alumno más las que salen de la guía, agrupadas por temas; cada respuesta completa, con código cuando hace falta y enlace al paso.

Constraints: estático, funciona en file:// y en el archivo único; sin JS se lee todo (details abiertos/cerrables); teclado y reduce-motion.

## Direction contract

THESIS: la página es el buscador. Nada de portada: el campo de búsqueda ocupa el primer viewport y la lista responde mientras escribes. Rechaza la rejilla de tarjetas de FAQ y el acordeón gris genérico.

OWN-WORLD: el mundo de la guía: fondo void con brillo violeta, títulos Unbounded, lectura Atkinson, etiquetas Silkscreen; acento rosa. Preguntas como filas separadas por líneas finas, no tarjetas; coincidencias subrayadas en rosa.

STORY: llega con una duda, escribe dos palabras, ve cuántas preguntas encajan y en qué temas, abre una, lee la respuesta entera y, si quiere, va al paso de la guía.

FIRST VIEWPORT: barra común; título grande «Preguntas frecuentes» y una frase; debajo, el campo de búsqueda ancho con icono, atajo «/» y botón de borrar (solo el campo y el recuento quedan fijos al bajar); debajo, los temas como filtros con su número, que se van con el scroll. La primera pregunta asoma al final del viewport.

FORM: lista agrupada por temas con filtros y búsqueda en vivo (1 de 1); seed: none (pinned) «como la de guía completa, guía resumida y ejercicios» · «que sea FAQ y que tenga un buscador para poder buscar».

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
