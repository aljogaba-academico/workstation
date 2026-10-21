# workstation

**ALJOGABA OS · Research Workstation**

Portal estático de entrada al ecosistema de trabajo. Su objetivo es responder:

1. **¿Qué sistema o herramienta debo usar?**
2. **¿Cuál es la ruta correcta para llegar desde una necesidad hasta un producto?**

## v0.1

- Arranque estilo computadora retro.
- Cuatro dominios principales: EPISUIS, Perfil profesional, DiseasesMapMx y Gestión de proyectos.
- Selector de **misiones** para rutas frecuentes.
- Mapas Mermaid `ECOSYSTEM` y `ARCHITECTURE`.
- Catálogo de herramientas.
- Fichas modales de cada sistema.
- Compatible con GitHub Pages.

## Publicar

1. Crea `aljogaba/workstation`.
2. Copia todo el contenido de esta carpeta a la raíz.
3. `commit` y `push` a `main`.
4. GitHub → `Settings → Pages`.
5. `Deploy from a branch`.
6. Branch `main`, folder `/ (root)`.

La URL normalmente será:

`https://aljogaba.github.io/workstation/`

## Fuente de datos

No edites las tarjetas directamente en `index.html`.

- `data/systems.json`
- `data/missions.json`
- `data/tools.json`

## Regla de seguridad

GitHub Pages es público. No agregues tokens, credenciales, URLs administrativas privadas, `.env` ni secretos. La workstation puede indicar que un sistema existe sin revelar su ubicación.

## Próximas mejoras

- Ventanas arrastrables.
- Sonido opcional.
- Íconos pixel-art.
- Buscador global.
- Árbol tecnológico de capacidades.
- Mission Control ampliado.
- PWA instalable.

**Versión:** 0.1
