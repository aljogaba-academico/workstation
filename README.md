# workstation

**ALJOGABA OS · Research Workstation**

Research workstation and navigation hub for the scientific ecosystem: projects, platforms, tools, workflows, and knowledge resources.

**Live:** https://aljogaba-academico.github.io/workstation/

## Propósito

La workstation responde dos preguntas operativas:

1. **¿Qué sistema o herramienta debo usar?**
2. **¿Cuál es la ruta correcta para llegar desde una necesidad hasta un producto?**

No sustituye a EPISUIS, DiseasesMapMx, el Perfil profesional ni al sistema de gestión de proyectos. Funciona como **capa de navegación** entre ellos.

## v0.3 — Research Vessel / Neon Arcade

La identidad visual se separa deliberadamente de las plataformas científicas del ecosistema. `workstation` adopta una estética propia de **estación de investigación retrofuturista**, con referencias a terminales, arcade oscuro y ciencia ficción.

Cambios principales:

- paleta oscura independiente de las plataformas existentes;
- cian, magenta, violeta y ámbar como acentos de sistema;
- escritorio y ventanas con tratamiento retro-sci-fi;
- mapas Mermaid adaptados a la nueva estética;
- arranque cinematográfico de aproximadamente seis segundos;
- barra de progreso animada con porcentaje;
- mensajes de inicialización escalonados;
- mensajes humorísticos ficticios del sistema;
- opción `SKIP BOOT [ESC]`;
- respeto a `prefers-reduced-motion`.

La capa visual adicional vive en:

```text
assets/css/neon.css
```

y la experiencia de arranque en:

```text
assets/js/boot.js
```

Esto permite modificar la estética sin alterar la arquitectura funcional principal.

## Funciones del escritorio

- Escritorio con iconos para los sistemas principales.
- Ventanas flotantes, arrastrables, minimizables y maximizables.
- Barra de tareas y menú `START`.
- **Mission Control** para seleccionar una tarea y obtener una ruta sugerida.
- **System Map** con mapas Mermaid interactivos `ECOSYSTEM` y `ARCHITECTURE`.
- **Toolbox** para accesos especializados.
- Fichas independientes para EPISUIS, Perfil profesional, DiseasesMapMx y Sistema de gestión de proyectos.

## Fuente de datos

El contenido de catálogo no se mantiene directamente en `index.html`.

```text
data/
├── systems.json
├── missions.json
└── tools.json
```

- `systems.json`: sistemas, módulos, estados y enlaces.
- `missions.json`: rutas guiadas según la tarea.
- `tools.json`: herramientas especializadas.

## Arquitectura

```text
workstation/
├── index.html
├── .nojekyll
├── README.md
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── neon.css
│   ├── js/
│   │   ├── app.js
│   │   └── boot.js
│   └── reference/
├── data/
│   ├── systems.json
│   ├── missions.json
│   └── tools.json
└── docs/
    └── github-pages.md
```

## GitHub Pages

- Repository: `aljogaba-academico/workstation`
- Branch: `main`
- Folder: `/ (root)`
- URL: `https://aljogaba-academico.github.io/workstation/`

## Regla de seguridad

GitHub Pages es público. No deben incorporarse tokens, claves, credenciales, archivos `.env`, URLs administrativas sensibles, datos reservados ni documentación privada.

Un sistema privado puede aparecer en el mapa como parte del ecosistema sin exponer su ubicación ni credenciales.

## Principio rector

> La workstation no es la fuente de verdad de los proyectos. Es la puerta de entrada al ecosistema.

Las fuentes canónicas permanecen en los sistemas y repositorios correspondientes; `workstation` mantiene solamente la información necesaria para **encontrarlos, entenderlos y elegir una ruta de trabajo**.

## Próximas mejoras

- iconografía pixel-art propia;
- pequeños eventos/easter eggs de sistema;
- buscador global;
- árbol tecnológico de capacidades;
- rutas más detalladas por misión;
- changelog visible desde el escritorio;
- PWA instalable;
- panel de estado para servicios públicos.

---

**ALJOGABA OS · Research Workstation · v0.3**
