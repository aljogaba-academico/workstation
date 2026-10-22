# workstation

**ALJOGABA OS · Research Workstation**

Estación de mando y navegación para el ecosistema científico y profesional de Alberto Jorge Galindo Barboza.

**Live:** https://aljogaba-academico.github.io/workstation/

## Propósito

ALJOGABA OS existe para responder con rapidez:

1. **¿Qué puedo hacer dentro de mi ecosistema?**
2. **¿Qué sistema, módulo o herramienta debo usar?**
3. **¿Dónde vive cada componente técnico?**
4. **¿Con qué identidad/cuenta entro a cada proveedor?**
5. **¿Qué piezas dependen de una infraestructura crítica antes de tocarla?**

La workstation no sustituye a EPISUIS, DiseasesMapMx, el Perfil profesional ni la Gestión de proyectos científicos. Funciona como **capa de orientación, navegación y memoria operativa**.

## v0.5 — Deep Space Operations

v0.5 conserva intacto el núcleo funcional de v0.4 y añade una capa opcional de ambientación e interacción.

Regla de diseño:

> **Operación primero → ambientación después → Easter eggs al fondo.**

### Display / CRT

- scanlines y viñeta CRT sutiles;
- flicker breve durante boot;
- selector de fósforo `CYAN`, `GREEN`, `AMBER` y `RED`;
- el fósforo modifica terminal, LEDs y acentos, pero no re-renderiza ni recolorea Mermaid;
- CRT configurable ON/OFF;
- preferencias guardadas únicamente en `localStorage`.

### Audio / COMMS

- AUDIO OFF por defecto;
- blips de hover y clicks reforzados;
- ráfagas breves de estática / enlace COMMS;
- firmas acústicas ligeras por sistema;
- ambient hum opcional y OFF por defecto;
- `Master volume` interno configurable desde FX;
- beep de anomalía del boot sincronizado con la preferencia AUDIO;
- audio sintetizado con Web Audio API, sin archivos externos.

COMMS es efímero: no es ticker, historial ni bitácora.

### Command Terminal

La terminal funciona como segunda interfaz de navegación del OS. No ejecuta shell real ni comandos del sistema operativo.

Comandos iniciales:

```text
help
status
systems
modules
open <system/tool/module>
infrastructure <system>
missions
radar
theme <cyan|green|amber|red>
audio <on|off>
fx
clear
reboot
```

### System Map / Long Range Scanner

El mapa incorpora:

- zoom tanto para `ECOSYSTEM RADAR` como para `ARCHITECTURE`;
- rango aproximado de 35% a 160%;
- botón `FIT` para encajar la figura completa en la ventana;
- `CALIBRATE` para el radar, con pasada visual y telemetría acústica opcional.

El zoom actúa sobre los contenedores visuales y no modifica Mermaid ni sus datos.

### Controlled Easter Eggs

- glitch de diagnóstico tras interacciones repetidas sobre módulos/nodos;
- `Self Destruct` accesible desde `START → SYSTEM → Emergency Protocol`, detrás de una tapa de seguridad, y también desde terminal;
- cuenta regresiva de 10 segundos con opción de abortar;
- en cero: flash rojo, blackout, línea CRT y tono sostenido si AUDIO está activo;
- después de ~4 segundos la línea desaparece, el tono se corta y el OS intenta cerrar la pestaña;
- si el navegador bloquea `window.close()` —lo habitual en pestañas abiertas manualmente— la pantalla queda negra y silenciosa como estado terminal final;
- no hay reboot automático ni mensajes de recuperación.

**Ningún Easter egg puede borrar datos ni modificar sistemas externos.**

### Correcciones y polish v0.5

- corregido bloqueo de `About Workstation` causado por recursión de `MutationObserver`;
- corregido error de sintaxis Mermaid en etiquetas técnicas con símbolos como `sync_public_site()`;
- mejorado el contraste de `Deep Space Settings` bajo las distintas paletas de fósforo;
- separado `Emergency Protocol` de los controles de configuración y movido a START;
- favicon `A>` en terminal oscura con borde cian;
- controles compactos para móvil sin alterar la composición de escritorio.

### Exclusiones deliberadas

v0.5 **NO** incluye:

- Flight Log / analytics de uso;
- ticker / cinta de alertas;
- Captain's Log / Bitácora del Capitán;
- telemetría externa;
- métricas persistentes de navegación.

La especificación completa vive en `docs/DEEP_SPACE_OPERATIONS.md`.

## v0.4 — Command Deck / Infrastructure Map

Esta versión consolidó la taxonomía real del ecosistema y añadió la capa auditada de infraestructura por módulo.

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

- **Mission Control** — 29 rutas agrupadas por Identidad científica, Epidemiología y vigilancia, Producción, Inteligencia molecular, Desarrollo de proyectos y Comunicación/visualización. Las rutas se muestran con Mermaid.
- **System Map / Long Range Scanner** — radar interactivo para los cuatro sistemas y mapa de arquitectura con zoom/scroll, `FIT` y calibración visual opcional.
- **Toolbox** — las tres Tools científicas; GitHub se conserva únicamente como shortcut de infraestructura.
- **Module Infrastructure** — diagramas Mermaid por módulo con fuente, deploy, backend/servicios y cuenta de acceso confirmada.
- **Command Terminal** — navegación alternativa mediante comandos simulados/operativos del OS, sin shell real.
- **Engine Room / Tech Core** — tecnologías incrustadas en el ecosistema, sin tratarlas como accesos directos.
- **Output Bay** — salidas derivadas que puede producir el ecosistema.
- **Local Ops** — comandos locales seguros y reutilizables; no almacena secretos ni direcciones internas.
- **Side Quests** — acceso separado a Smoke Lab y Entre libros y letras sin convertirlos en Core Systems.
- **Emergency Protocol** — simulación teatral protegida desde START; separada de los controles FX.

## Module Infrastructure

La vista distingue explícitamente:

- **System / module** — componente funcional que se está documentando.
- **Source** — repositorio o fuente canónica.
- **Deployment** — GitHub Pages, Cloudflare o Render cuando aplica.
- **Backend / data** — Supabase y recursos persistentes cuando aplica.
- **Service** — Resend, motor analítico u otros servicios auxiliares confirmados.
- **Account** — identidad, correo/handle y método de acceso cuando han sido verificados.
- **PLANNED** — relaciones futuras, dibujadas con línea discontinua y nunca mezcladas con infraestructura activa.

Los correos se muestran únicamente como **identificadores de cuenta**. Nunca se almacenan credenciales.

### Infraestructura crítica documentada

**DiseasesMapMx**

- Código canónico: organización GitHub `DiseasesMapMx` (`web`, `analysis-engine`).
- Web de producción: Cloudflare Worker `diseasesmapmx-web`.
- Backend científico de Sequence Analysis: Render, servicio `diseasesmapmx-analysis-engine`.
- Backend y catálogo molecular canónico: Supabase `DiseasesMapMx Production`.
- Dashboard actual: archivos aislados del repo `web`; migración a datasets generados desde Production marcada como `PLANNED`.
- Portal de colaboradores: Supabase Auth + Edge Functions + analysis-engine + staging/curación.
- `aljogaba/DiseasesMapMx` se considera **LEGACY** y no forma parte de la infraestructura activa.

**EPISUIS**

- Organización GitHub `episuis`: `web`, `vigilancia-episuis`, `produccion`.
- Web principal: GitHub Pages + dominio `episuis.com.mx`.
- Dominio/DNS: Hostinger.
- Vigilancia: Cloudflare Pages + Supabase `vigilancia-episuis` + Resend.
- Producción: Cloudflare Worker `episuis-produccion` + Supabase `produccion`.
- Cloudflare EPISUIS se accede directamente con la cuenta ALJOGABA; Supabase EPISUIS se accede mediante GitHub `aljogaba`.

## Boot / reboot

La secuencia de arranque se extiende a aproximadamente 20 segundos para funcionar como experiencia demostrativa. Incluye:

- mensajes escalonados y legibles;
- pausa de progreso durante la anomalía;
- mensajes de humor ficticio del sistema;
- `Jorge... tenemos un problema.` integrado en la misma gramática tipográfica;
- señal electrónica breve sólo cuando AUDIO está activo y el navegador permite reproducción;
- `SKIP BOOT [ESC]`;
- cierre con `ACCESS GRANTED`;
- soporte de `prefers-reduced-motion`.

`START → Restart ALJOGABA OS` restablece ventanas y reproduce la secuencia completa sin requerir `Ctrl+F5`.

## Ventanas

Las ventanas se limitan dinámicamente al área disponible entre menubar y taskbar. El contenido excedente hace scroll **dentro de la ventana**. Esto evita que Mission Control, System Map, Toolbox o Module Infrastructure queden fuera del navegador.

## Flujo conceptual

`CAPTURAR → ORGANIZAR → ANALIZAR → INTERPRETAR → GESTIONAR → COMUNICAR`

Se presenta como telemetría/proceso, no como botones.

## Fuentes de datos

```text
data/
├── systems.json          # Systems y Modules
├── missions.json         # Mission Routes
├── tools.json            # Tools propias
├── workstation.json      # tecnologías, outputs, Local Ops, Side Quests y fallback histórico
└── infrastructure.json   # relaciones auditadas por módulo y directorio de accesos
```

**Regla:** `data/infrastructure.json` es la fuente canónica de **Module Infrastructure**.

La auditoría humana que explica y justifica esas relaciones vive en:

`docs/INFRASTRUCTURE_RELATIONSHIP_AUDIT.md`

## Arquitectura

```text
workstation/
├── index.html
├── .nojekyll
├── README.md
├── assets/
│   ├── favicon.svg
│   ├── css/
│   │   ├── styles.css
│   │   ├── neon.css
│   │   ├── refinement.css
│   │   ├── deep-space.css
│   │   ├── v05-tuning.css
│   │   └── self-destruct-v2.css
│   └── js/
│       ├── app.js
│       ├── refinement.js
│       ├── boot.js
│       ├── deep-space.js
│       ├── hotfix-v05.js
│       ├── map-tuning.js
│       ├── audio-tuning.js
│       ├── ux-fixes.js
│       └── self-destruct-v2.js
├── data/
│   ├── systems.json
│   ├── missions.json
│   ├── tools.json
│   ├── workstation.json
│   └── infrastructure.json
└── docs/
    ├── github-pages.md
    ├── INFRASTRUCTURE_RELATIONSHIP_AUDIT.md
    └── DEEP_SPACE_OPERATIONS.md
```

## Regla operativa de documentación

Toda modificación estructural, funcional o de infraestructura debe dejar actualizada su documentación canónica en el mismo cambio.

El `README.md` es la puerta de entrada operativa del repositorio. Los flujos que requieren mayor detalle viven en `docs/` y se enlazan desde el README.

## Regla de seguridad

GitHub Pages es público. ALJOGABA OS puede registrar **nombres operativos, correos usados como identificadores de cuenta y relaciones administrativas**, pero nunca debe almacenar:

- contraseñas;
- tokens;
- API keys;
- MFA / recovery codes;
- archivos `.env`;
- secretos de backend;
- claves service-role/secret de Supabase;
- enlaces administrativos sensibles que concedan acceso.

Los repositorios privados pueden representarse por nombre cuando es útil para orientación, sin convertir la workstation en un almacén de credenciales.

## Principio rector

> **ALJOGABA OS no es la fuente de verdad de los proyectos. Es el mapa de mando para encontrar las fuentes de verdad, entender sus dependencias y elegir la ruta correcta.**

---

**ALJOGABA OS · Research Workstation · v0.5**
