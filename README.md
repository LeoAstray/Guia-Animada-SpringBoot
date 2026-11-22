# Guía animada: Spring Boot de cero a REST

Guía en español para aprender a construir una API REST con **Spring Boot, Spring Data JPA y MySQL**, paso a paso y explicando el porqué de cada decisión. Es HTML, CSS y JS estáticos: no necesita servidor ni instalar nada, y funciona abriéndola con doble clic.

## Qué incluye

| Formato | Contenido |
|---|---|
| **Guía completa** | 33 pasos (cartas) en cuatro partes: Data JPA, el puente a REST, la API REST y los ejercicios. Cada paso lleva explicación, código para copiar y pruebas con Postman. |
| **Guía resumida** | Los mismos pasos muy resumidos, con el código, y un enlace a la explicación completa de cada uno. |
| **Ejercicios** | Ejercicios tipo examen con enunciado y solucionario (Academia de idiomas, Hospital San Gabriel). |

Un **selector** inicial permite elegir entre los tres.

## Cómo leerla

- **Para compartir o leer:** abre `Guia_Animada_SpringBoot_DataJPA_y_REST.html`. Es un único archivo con todo dentro.
- **Para trabajar en carpeta:** abre `guia/index.html`.

## Cómo construirla

Necesitas Python 3. Los archivos de `guia/` y el archivo único se generan a partir de `contenido/`; no se editan a mano.

```powershell
python construir.py
```

También vale hacer doble clic en `Construir guia.bat`.

## Estructura

```
├── contenido/        textos de la guía (HTML por pasos, agrupados por partes)
│   ├── parte-1-… a parte-4-…
│   ├── ejercicios/   enunciados y solucionarios
│   └── resumen/      resúmenes de cada paso para la guía resumida
├── plantillas/       esqueletos de página
├── recursos/         css/, js/, fuentes/, img/ y paginas/ (selector, resumida y ejercicios)
├── guia/             GENERADO: las cuatro páginas para trabajar en carpeta
├── docs/editar.md    cómo añadir, quitar y reordenar pasos y ejercicios
├── construir.py      script que lo junta todo
├── Construir guia.bat
├── PRODUCT.md        propósito, público y principios del proyecto
└── Guia_Animada_SpringBoot_DataJPA_y_REST.html   GENERADO: todo en un solo archivo
```

Para editar contenido, estilos o ejercicios, mira [docs/editar.md](docs/editar.md).

## Requisitos del código de la guía

Spring Boot 4.1.3, Java 21 y MySQL.
