# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Personas que quieren aprender Spring Boot desde cero (público general, hispanohablante), desde estudiantes de Entorno Servidor hasta cualquiera que llegue a la guía. Suelen seguirla paso a paso con el editor abierto, también desde el móvil para leer.

## Product Purpose
Enseñar a construir una API REST con Spring Boot, Spring Data JPA y MySQL, de cero y paso a paso, explicando el porqué de cada decisión. Tiene éxito si quien la sigue consigue una API funcionando y entiende el código que ha escrito. Se ofrece en tres formatos: guía completa (33 cartas/pasos), guía resumida (los mismos pasos, con código) y ejercicios tipo examen con solucionario.

## Positioning
Una guía animada, en español, en la que cada paso lleva su explicación, el código para copiar y las pruebas con Postman; la resumida enlaza cada paso con su explicación completa y los ejercicios cierran el ciclo con solucionarios.

## Operating Context
Se estudia con el editor (VS Code / IntelliJ), MySQL y Postman a mano. Se distribuye como carpeta de páginas estáticas y como un único archivo HTML que se abre con doble clic. Se genera con `construir.py` a partir de `contenido/`, `plantillas/` y `recursos/`.

## Capabilities and Constraints
- Siempre HTML/CSS/JS estáticos, sin servidor ni instalación; debe funcionar desde `file://`, incluido el archivo único.
- Todo el texto en español, tono cercano para quien empieza.
- Todo el código de la guía y de los solucionarios debe compilar y funcionar (Spring Boot 4.1.3 / Java 21).
- Debe leerse bien en móvil y respetar teclado y «reducir movimiento».
- Funcionalidad que no se puede perder: botones de copiar código, índice lateral, enlaces entre guías, «Seguir donde lo dejé», selector, ejercicios con solucionario.

## Evidence on Hand
Contenido real en `contenido/` (incluidos `contenido/resumen/` y `contenido/ejercicios/`) (2 ejercicios con solucionario verificados). No hay testimonios ni datos de uso; no inventarlos.

## Product Principles
- Explicar el porqué, no solo qué pegar.
- El código mostrado es el código que funciona.
- Tres caminos (completa, resumida, ejercicios) sin perder al lector entre ellos.
- Funcionar en cualquier sitio: sin instalar nada, también en móvil.
- Español claro y cercano para quien empieza.

## Accessibility & Inclusion
Lectura cómoda en móvil, navegación con teclado y respeto a «reducir movimiento».
