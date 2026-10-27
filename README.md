# ALJOGABA OS · Research Workstation

Estación de mando y navegación del ecosistema científico y profesional de **Alberto Jorge Galindo Barboza**.

**Live:** https://aljogaba-academico.github.io/workstation/

## Propósito

ALJOGABA OS responde cuatro preguntas operativas:

1. ¿Qué sistema, módulo o herramienta debo usar?
2. ¿Dónde vive cada componente técnico?
3. ¿Cómo se relacionan los sistemas y su infraestructura?
4. ¿Con qué identidad/cuenta se accede a cada proveedor?

La workstation **no sustituye las fuentes canónicas** de EPISUIS, DiseasesMapMx, Perfil profesional o Gestión de proyectos científicos. Es una capa pública de orientación, navegación y memoria operativa.

## Inventario canónico

- **4 Systems**
- **14 Modules**
- **3 Tools**
- **29 Mission Routes**

Los contadores se derivan de los archivos de datos; no se mantienen manualmente en la interfaz.

### Systems

1. **Perfil profesional** — Web profesional, Herramientas, CV canónico, Notas técnicas.
2. **EPISUIS** — Web EPISUIS, Vigilancia EPISUIS, EPISUIS Producción.
3. **DiseasesMapMx** — Portal público, Dashboard, Sequence Analysis, Catálogo molecular y curación, Portal de colaboradores.
4. **Gestión de proyectos científicos** — Proyectos territoriales, Investigación académica.

### Tools

- SIPRO-Porcino
- Epi 2×2
- DIMUPorcino

GitHub, Mermaid, Python, Quarto, QGIS, Supabase y tecnologías equivalentes pertenecen a infraestructura/Engine Room, no al contador de Tools.

## Componentes principales

- **Mission Control** — rutas de trabajo.
- **System Map / Long Range Scanner** — radar y arquitectura.
- **Toolbox** — herramientas científicas propias.
- **Module Infrastructure** — relaciones auditadas por módulo.
- **Command Terminal** — navegación alternativa sin shell real.
- **Engine Room / Tech Core** — tecnologías del ecosistema.
- **Output Bay** — salidas derivadas.
- **Local Ops** — comandos locales seguros.
- **Side Quests** — proyectos no-core.
- **Emergency Protocol** — Easter egg teatral protegido, sin operaciones de datos.

## v0.5 — Deep Space Operations

v0.5 añade una capa opcional de ambientación e interacción sin modificar el núcleo funcional:

- CRT y selector de fósforo;
- audio UI, COMMS, ambient hum y volumen maestro;
- Command Terminal;
- zoom/FIT y calibración del radar;
- glitches controlados;
- Emergency Protocol / Self Destruct;
- favicon `A>`;
- tuning responsivo para touch/móvil.

Regla de diseño:

> **Operación primero → ambientación después → Easter eggs al fondo.**

La especificación y comportamiento detallado de esta capa viven únicamente en:

`docs/DEEP_SPACE_OPERATIONS.md`

## Responsive baseline

La composición principal sigue siendo escritorio. En móvil/tablet se aplica una capa de adaptación, no un producto paralelo.

Criterios actuales:

- ventanas contenidas dentro del viewport;
- `100dvh` y soporte de safe areas;
- controles táctiles ampliados;
- arrastre de ventanas deshabilitado en dispositivos de puntero grueso para evitar desplazamientos accidentales;
- cuadrícula compacta de accesos en teléfonos;
- START, taskbar, terminal, settings y COMMS adaptados a pantallas estrechas;
- START dispone de un área vertical scrollable independiente en móvil y landscape para que todas las opciones permanezcan accesibles;
- Mermaid conserva scroll horizontal cuando el diagrama requiere más espacio, en lugar de deformar el contenido;
- soporte de orientación vertical/horizontal y `prefers-reduced-motion`.

Archivos de esta capa:

- `assets/css/responsive-polish.css`
- `assets/js/responsive-polish.js`

## SEO / identidad pública

La URL canónica es:

`https://aljogaba-academico.github.io/workstation/`

La página identifica explícitamente a **Alberto Jorge Galindo Barboza** como autor/creador mediante:

- `<meta name="author">`;
- título y descripción SEO;
- canonical URL;
- Open Graph;
- Twitter Card;
- datos estructurados `schema.org` (`Person`, `WebSite`, `WebPage`);
- vínculo visible desde `About ALJOGABA OS` hacia el perfil profesional público;
- `robots.txt`;
- `sitemap.xml`.

No se utilizan `meta keywords` ni telemetría/analytics externos.

## Fuentes de datos

```text
data/
├── systems.json          # Systems y Modules
├── missions.json         # Mission Routes
├── tools.json            # Tools propias
├── workstation.json      # tecnologías, outputs, Local Ops y Side Quests
└── infrastructure.json   # única fuente canónica de relaciones por módulo y directorio de accesos
```

**Regla:** `data/infrastructure.json` es la **única fuente de verdad** de **Module Infrastructure**. `workstation.json` no mantiene una copia paralela de estas relaciones.

## Documentación canónica

El README funciona como **índice operativo**, no como duplicado de toda la documentación.

- `docs/INFRASTRUCTURE_RELATIONSHIP_AUDIT.md` — auditoría y justificación de relaciones de infraestructura.
- `docs/IDENTITY_AUTHENTICATION_MODEL.md` — diferencia entre cuentas, organizaciones, GitHub Apps, OAuth y rutas canónicas de autenticación; incluye la regla para no crear cuentas nuevas sin definir antes identidad y propietario.
- `docs/DEEP_SPACE_OPERATIONS.md` — especificación de la capa v0.5, audio, FX, terminal, radar y Easter eggs.
- `docs/github-pages.md` — publicación en GitHub Pages.

Cuando un detalle ya vive en uno de esos documentos, el README solo lo referencia.

## Arquitectura

```text
workstation/
├── index.html
├── robots.txt
├── sitemap.xml
├── .nojekyll
├── README.md
├── LICENSE
├── assets/
│   ├── favicon.svg
│   ├── css/
│   │   ├── styles.css
│   │   ├── neon.css
│   │   ├── refinement.css
│   │   ├── deep-space.css
│   │   ├── v05-tuning.css
│   │   ├── self-destruct-v2.css
│   │   └── responsive-polish.css
│   └── js/
│       ├── app.js
│       ├── refinement.js
│       ├── boot.js
│       ├── deep-space.js
│       ├── hotfix-v05.js
│       ├── map-tuning.js
│       ├── audio-tuning.js
│       ├── ux-fixes.js
│       ├── self-destruct-v2.js
│       └── responsive-polish.js
├── data/
│   ├── systems.json
│   ├── missions.json
│   ├── tools.json
│   ├── workstation.json
│   └── infrastructure.json
└── docs/
    ├── github-pages.md
    ├── INFRASTRUCTURE_RELATIONSHIP_AUDIT.md
    ├── IDENTITY_AUTHENTICATION_MODEL.md
    └── DEEP_SPACE_OPERATIONS.md
```

## Regla operativa de documentación

> **Toda modificación estructural, funcional o de infraestructura debe actualizar su documentación canónica en el mismo cambio.**

Para evitar entropía documental:

1. `README.md` = índice operativo y estado general.
2. Un flujo detallado vive en **un solo documento canónico** dentro de `docs/`.
3. No se crean documentos nuevos si un documento existente puede absorber correctamente el cambio.
4. No se copian bloques completos entre README y `docs/`; se enlazan.
5. Código, datos y documentación deben describir el mismo estado operativo.

## Seguridad

GitHub Pages es público. ALJOGABA OS puede mostrar nombres operativos, repositorios privados por nombre, correos usados como identificadores de cuenta y relaciones administrativas confirmadas, pero nunca almacena:

- contraseñas;
- tokens;
- API keys;
- MFA / recovery codes;
- `.env`;
- secretos de backend;
- service-role/secret keys;
- enlaces administrativos sensibles que concedan acceso.

## Licencia y derechos de uso

El **código fuente** de este repositorio se distribuye bajo la **MIT License**; consultar `LICENSE`.

La licencia MIT **no cubre automáticamente** la documentación, los textos editoriales, los archivos de datos y configuración que describen el ecosistema personal/profesional, la identidad visual, el nombre **ALJOGABA OS**, logotipos, marcas ni otros contenidos creativos o de identidad propios. Salvo indicación expresa en contrario, esos materiales permanecen bajo copyright de **Alberto Jorge Galindo Barboza** y no se autoriza su reutilización, redistribución o adaptación por el solo hecho de estar visibles en este repositorio público.

## Principio rector

> **ALJOGABA OS no es la fuente de verdad de los proyectos. Es el mapa de mando para encontrar las fuentes de verdad, entender sus dependencias y elegir la ruta correcta.**

---

**ALJOGABA OS · Research Workstation · v0.5**  
**Alberto Jorge Galindo Barboza**
