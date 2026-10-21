# workstation

**ALJOGABA OS · Research Workstation**

Estación de mando y navegación para el ecosistema científico y profesional de Alberto Jorge Galindo Barboza.

**Live:** https://aljogaba-academico.github.io/workstation/

## Propósito

ALJOGABA OS existe para responder con rapidez:

1. **¿Qué puedo hacer dentro de mi ecosistema?**
2. **¿Qué sistema, módulo o herramienta debo usar?**
3. **¿Dónde vive cada componente técnico?**
4. **¿Con qué identidad administrativa entro a cada proveedor?**
5. **¿Qué piezas dependen de una infraestructura crítica antes de tocarla?**

La workstation no sustituye a EPISUIS, DiseasesMapMx, el Perfil profesional ni la Gestión de proyectos científicos. Funciona como **capa de orientación, navegación y memoria operativa**.

## v0.4 — Command Deck / Infrastructure Map

Esta versión consolida la taxonomía real del ecosistema y añade la capa de infraestructura e identidades.

### Inventario canónico actual

- **4 Systems**
- **14 Modules**
- **3 Tools**
- **29 Mission Routes**

Los contadores se derivan de los archivos de datos; no se mantienen manualmente en la interfaz.

### Systems

1. **Perfil profesional** — 4 módulos: Web profesional, Herramientas, CV canónico y Notas técnicas.
2. **EPISUIS** — 3 módulos: Web EPISUIS, Vigilancia EPISUIS y EPISUIS Producción.
3. **DiseasesMapMx** — 5 módulos: Portal público, Dashboard, Sequence Analysis, Catálogo molecular y curación, Portal de colaboradores.
4. **Gestión de proyectos científicos** — 2 módulos: Proyectos territoriales e Investigación académica.

El marco metodológico EPISUIS se mantiene como capa metodológica transversal y no se cuenta como módulo operativo.

### Tools

Solo se cuentan aplicaciones propias que se abren para ejecutar una tarea:

- **SIPRO-Porcino — Simulador Integral de Producción Porcina**
- **Epi 2×2 — Calculadora epidemiológica para tablas de contingencia**
- **DIMUPorcino — Diseño Integral de Muestreo Porcino**

GitHub, Mermaid, QGIS, Python, Quarto, Supabase y tecnologías equivalentes pertenecen a infraestructura o al **Engine Room**, no al contador de Tools.

## Componentes del escritorio

- **Mission Control** — 29 rutas agrupadas por Identidad científica, Epidemiología y vigilancia, Producción, Inteligencia molecular, Desarrollo de proyectos y Comunicación/visualización.
- **System Map / Long Range Scanner** — radar interactivo para los cuatro sistemas y mapa de arquitectura con zoom/scroll.
- **Toolbox** — las tres Tools científicas; GitHub se conserva únicamente como shortcut de infraestructura.
- **Identity Matrix** — registro público-safe de identidades, proveedores, repositorios, despliegues y dependencias.
- **Engine Room / Tech Core** — tecnologías incrustadas en el ecosistema, sin tratarlas como accesos directos.
- **Output Bay** — salidas derivadas que puede producir el ecosistema.
- **Local Ops** — comandos locales seguros y reutilizables; no almacena secretos ni direcciones internas.
- **Side Quests** — acceso separado a Smoke Lab y Entre libros y letras sin convertirlos en Core Systems.

## Identity Matrix

La matriz distingue explícitamente:

- **Identity** — identidad administrativa utilizada para entrar.
- **Provider / platform** — GitHub, Cloudflare, Supabase, Hostinger, Resend, etc.
- **Account / workspace / organization** — cuenta concreta dentro del proveedor.
- **Resource** — repositorio, proyecto, deployment, dominio o backend.
- **System** — ecosistema al que sirve el recurso.

También diferencia relaciones como:

- `AUTHENTICATED VIA`
- `SOURCE`
- `DEPLOYMENT`
- `BACKEND / DATA`
- `DOMAIN / DNS`
- `TRANSACTIONAL EMAIL`

### Infraestructura crítica documentada

**DiseasesMapMx**

- Código canónico: organización GitHub `DiseasesMapMx` (`web`, `analysis-engine`).
- Web de producción: Cloudflare Worker `diseasesmapmx-web`.
- Backend y catálogo molecular canónico: Supabase `DiseasesMapMx Production`.
- La capa de Administración/Curación depende de ese backend.
- `aljogaba/DiseasesMapMx` se considera **LEGACY** y no forma parte de la infraestructura activa.

**EPISUIS**

- Organización GitHub `episuis`: `web`, `vigilancia-episuis`, `produccion`.
- Web principal: GitHub Pages + dominio `episuis.com.mx`.
- Dominio/DNS: Hostinger.
- Vigilancia: Cloudflare Pages + Supabase `vigilancia-episuis`.
- Producción: Cloudflare Worker `episuis-produccion` + Supabase `produccion`.
- Correo transaccional de Vigilancia: Resend, workspace `aljogaba`, dominio `episuis.com.mx`.

## Boot / reboot

La secuencia de arranque se extiende a aproximadamente 20 segundos para funcionar como experiencia demostrativa. Incluye:

- mensajes escalonados y legibles;
- pausas dramáticas;
- mensajes de humor ficticio del sistema;
- `Jorge... tenemos un problema.` como anomalía aislada;
- `SKIP BOOT [ESC]`;
- cierre con `ACCESS GRANTED`;
- soporte de `prefers-reduced-motion`.

`START → Restart ALJOGABA OS` restablece ventanas y reproduce la secuencia completa sin requerir `Ctrl+F5`.

## Ventanas

Las ventanas se limitan dinámicamente al área disponible entre menubar y taskbar. El contenido excedente hace scroll **dentro de la ventana**. Esto evita que Mission Control, System Map, Toolbox o Identity Matrix queden fuera del navegador.

## Flujo conceptual

`CAPTURAR → ORGANIZAR → ANALIZAR → INTERPRETAR → GESTIONAR → COMUNICAR`

Se presenta como telemetría/proceso, no como botones.

## Fuente de datos

```text
data/
├── systems.json       # systems y modules
├── missions.json      # mission routes
├── tools.json         # Tools propias
└── workstation.json   # tecnologías, outputs, Local Ops, Side Quests e infraestructura
```

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
│   └── js/
│       ├── app.js
│       └── boot.js
├── data/
│   ├── systems.json
│   ├── missions.json
│   ├── tools.json
│   └── workstation.json
└── docs/
    └── github-pages.md
```

## Regla de seguridad

GitHub Pages es público. ALJOGABA OS puede registrar **nombres operativos y relaciones administrativas**, pero nunca debe almacenar:

- contraseñas;
- tokens;
- API keys;
- MFA / recovery codes;
- archivos `.env`;
- secretos de backend;
- rutas administrativas sensibles.

Los repositorios privados pueden representarse por nombre cuando es útil para orientación, sin convertir la workstation en un almacén de credenciales.

## Principio rector

> **ALJOGABA OS no es la fuente de verdad de los proyectos. Es el mapa de mando para encontrar las fuentes de verdad, entender sus dependencias y elegir la ruta correcta.**

---

**ALJOGABA OS · Research Workstation · v0.4**
