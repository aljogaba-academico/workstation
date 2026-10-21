# workstation

**ALJOGABA OS · Research Workstation**

Research workstation and navigation hub for the scientific ecosystem: projects, platforms, tools, workflows, and knowledge resources.

**Live:** https://aljogaba-academico.github.io/workstation/

## Propósito

La workstation responde dos preguntas operativas:

1. **¿Qué sistema o herramienta debo usar?**
2. **¿Cuál es la ruta correcta para llegar desde una necesidad hasta un producto?**

No pretende sustituir a EPISUIS, DiseasesMapMx, el Perfil profesional ni al sistema de gestión de proyectos. Funciona como **capa de navegación** entre ellos.

## v0.2 — Retro desktop

- Secuencia de arranque estilo computadora retro.
- Escritorio con iconos para los sistemas principales.
- Ventanas flotantes, arrastrables, minimizables y maximizables.
- Barra de tareas y menú `START`.
- **Mission Control** para seleccionar una tarea y obtener una ruta sugerida.
- **System Map** con dos mapas Mermaid interactivos:
  - `ECOSYSTEM`
  - `ARCHITECTURE`
- **Toolbox** para accesos especializados.
- Fichas independientes para:
  - EPISUIS
  - Perfil profesional
  - DiseasesMapMx
  - Sistema de gestión de proyectos
- Diseño responsivo para escritorio y móvil.

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

La interfaz se genera desde estos archivos.

## Arquitectura

```text
workstation/
├── index.html
├── .nojekyll
├── README.md
├── assets/
│   ├── css/styles.css
│   ├── js/app.js
│   └── reference/
├── data/
│   ├── systems.json
│   ├── missions.json
│   └── tools.json
└── docs/
    └── github-pages.md
```

## GitHub Pages

El sitio se publica desde:

- Repository: `aljogaba-academico/workstation`
- Branch: `main`
- Folder: `/ (root)`
- URL: `https://aljogaba-academico.github.io/workstation/`

## Regla de seguridad

GitHub Pages es público. No deben incorporarse:

- tokens o claves;
- credenciales;
- archivos `.env`;
- URLs administrativas sensibles;
- datos reservados;
- documentación privada.

Un sistema privado puede aparecer en el mapa como parte del ecosistema sin exponer su ubicación ni credenciales.

## Principio rector

> La workstation no es la fuente de verdad de los proyectos. Es la puerta de entrada al ecosistema.

Las fuentes canónicas permanecen en los sistemas y repositorios correspondientes; `workstation` mantiene solamente la información necesaria para **encontrarlos, entenderlos y elegir una ruta de trabajo**.

## Próximas mejoras

- Iconografía pixel-art propia.
- Buscador global.
- Árbol tecnológico de capacidades.
- Rutas más detalladas por misión.
- Changelog visible desde el escritorio.
- PWA instalable.
- Panel de estado para servicios públicos.

---

**ALJOGABA OS · Research Workstation · v0.2**
