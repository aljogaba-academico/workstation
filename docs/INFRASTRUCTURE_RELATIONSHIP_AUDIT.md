# ALJOGABA OS — Infrastructure Relationship Audit

Última revisión: 2026-10-27

## Fuente canónica

La fuente canónica para los diagramas **Module Infrastructure** es:

`data/infrastructure.json`

`data/workstation.json` conserva una instantánea/fallback histórico de infraestructura, pero no debe utilizarse para introducir nuevas relaciones. Toda corrección de cuentas, accesos, despliegues y dependencias por módulo debe realizarse primero en `data/infrastructure.json`.

## Regla de modelado

ALJOGABA OS representa infraestructura **por módulo**. Una identidad de acceso no se interpreta como propietaria funcional del sistema ni como nodo padre artificial.

Cada esquema debe responder:

1. ¿A qué sistema pertenece el módulo?
2. ¿Dónde vive su código o fuente canónica?
3. ¿Dónde se despliega o ejecuta?
4. ¿Qué backend o servicio externo utiliza realmente?
5. ¿Qué identidad/cuenta confirmada administra cada recurso?
6. ¿La relación está activa o solamente planeada?

Los correos se muestran únicamente como **identificadores de cuenta**. No son credenciales y nunca deben acompañarse de contraseñas, tokens, claves, secretos o códigos MFA.

## Identidades conceptuales

- **ALJOGABA** — GitHub `aljogaba`; correo de referencia `aljogaba@gmail.com`.
- **ALJOGABA ACADEMIC** — GitHub `aljogaba-academico`; correo de referencia `aljogaba.academico@gmail.com`.
- **EPISUIS ADMIN** — GitHub `episuis-admin`; cuenta técnica/administrativa con 2FA y función de Owner de la organización `episuis`.
- **EPISUIS ORGANIZATION** — organización GitHub `episuis`; contenedor de repositorios y GitHub Apps. No es una identidad de login, no tiene contraseña propia ni recovery codes.

Mayúsculas identifican la identidad conceptual. Handles, repositorios, proyectos y nombres técnicos conservan su escritura real.

---

# 1. Perfil profesional

## Web profesional

- Código/sitio: `aljogaba/aljogaba.github.io`.
- Cuenta GitHub: **ALJOGABA** / `aljogaba@gmail.com` / `aljogaba`.
- Publicación: GitHub Pages.
- Backend externo: ninguno.

## Herramientas

Repositorios:

- `aljogaba/sipro-porcino`
- `aljogaba/epi-2x2`
- `aljogaba/dimu-porcino`

Infraestructura:

- Cuenta: **ALJOGABA** / `aljogaba@gmail.com` / GitHub `aljogaba`.
- Publicación: GitHub Pages.
- Backend externo: ninguno.
- Cloudflare: no.
- Supabase: no.

## CV canónico

- Fuente privada: `aljogaba/perfil-profesional-source`.
- Cuenta: **ALJOGABA** / `aljogaba@gmail.com` / GitHub `aljogaba`.
- No se despliega como aplicación.
- `sync_public_site()` genera derivados para `aljogaba.github.io`, entre ellos `assets/js/canonical-data.js` y `assets/js/profile-data.js`.

Relación correcta:

`perfil-profesional-source [PRIVATE] → derivados públicos → aljogaba.github.io`

## Notas técnicas

- Repositorio: `aljogaba/notas-tecnicas`.
- Cuenta: **ALJOGABA** / `aljogaba@gmail.com` / GitHub `aljogaba`.
- Publicación: Jekyll + GitHub Pages.
- Sitio: `aljogaba.github.io/notas-tecnicas`.

---

# 2. EPISUIS

## Gobierno GitHub común

- Organización: `episuis`.
- Owners confirmados: `episuis-admin` y `aljogaba`.
- Ambos Owners tienen 2FA activo.
- La organización exige 2FA y métodos seguros.
- `episuis-admin` funciona como cuenta técnica/administrativa de respaldo y gobierno GitHub.
- `episuis-admin` no mantiene OAuth activo con Cloudflare, Supabase o Resend.
- GitHub Apps instaladas en la organización:
  - `Cloudflare Workers and Pages`.
  - `ChatGPT Codex Connector`.
- `Cloudflare Workers and Pages` está limitado a los repositorios `vigilancia-episuis` y `produccion`.

La organización `episuis` no se autentica como usuario: los accesos, 2FA, passkeys y recovery codes pertenecen a las cuentas Owner individuales.

## Web EPISUIS

- Fuente: `episuis/web`.
- Publicación: GitHub Pages desde `main` / raíz.
- Dominio público: `episuis.com.mx` mediante `CNAME`.
- Dominio/Hostinger: cuenta asociada a `episuis@gmail.com`.

Relación:

`episuis/web → GitHub Pages → episuis.com.mx`

## Vigilancia EPISUIS

### Código

- Fuente: `episuis/vigilancia-episuis`.
- Propietario del repo: **EPISUIS ORGANIZATION** / `episuis`.
- Owners que pueden administrarlo: `episuis-admin` y `aljogaba`.

### Deploy

- Producto Cloudflare: **Cloudflare Pages**.
- Proyecto: `vigilancia-episuis`.
- URL operativa: `https://vigilancia-episuis.pages.dev/`.
- Cuenta Cloudflare: **ALJOGABA**.
- Acceso Cloudflare: directo por correo `aljogaba@gmail.com`, no mediante GitHub.
- El proyecto está conectado al repo `episuis/vigilancia-episuis` mediante la GitHub App `Cloudflare Workers and Pages` instalada en la organización `episuis`.

### Backend

Ruta de acceso confirmada:

`aljogaba@gmail.com → GitHub aljogaba → Supabase → Organization EPISUIS → vigilancia-episuis`

### Correo transaccional

- Resend activo para invitaciones/activación.
- Acceso: `aljogaba@gmail.com → GitHub aljogaba → Resend`.
- Workspace: `aljogaba`.
- Sending domain: `episuis.com.mx`.
- Resend utiliza el dominio para correo; no hospeda la web.

## EPISUIS Producción

### Código

- Fuente: `episuis/produccion`.
- Propietario del repo: **EPISUIS ORGANIZATION** / `episuis`.
- Owners que pueden administrarlo: `episuis-admin` y `aljogaba`.

### Deploy

- Producto Cloudflare: **Cloudflare Workers** con Static Assets.
- Worker: `episuis-produccion`.
- URL operativa: `https://episuis-produccion.aljogaba.workers.dev/`.
- Configuración versionada: `wrangler.jsonc`, con `dist/` como directorio de assets y manejo SPA.
- Cuenta Cloudflare: **ALJOGABA**.
- Acceso: directo con `aljogaba@gmail.com`.
- El Worker está conectado al repo `episuis/produccion` mediante la GitHub App `Cloudflare Workers and Pages` instalada en la organización `episuis`.

### Backend

Ruta de acceso confirmada:

`aljogaba@gmail.com → GitHub aljogaba → Supabase → Organization EPISUIS → produccion`

Supabase proporciona actualmente la capa de datos/Auth del módulo.

### Servicios no activos

- Resend: no forma parte actualmente de Producción.
- Dominio propio: no.
- Otro backend externo: no confirmado/activo.

## Por qué Vigilancia usa `pages.dev` y Producción usa `workers.dev`

No es una inconsistencia ni implica cuentas distintas.

- `vigilancia-episuis.pages.dev` corresponde a un **proyecto Cloudflare Pages**.
- `episuis-produccion.aljogaba.workers.dev` corresponde a un **Cloudflare Worker** que sirve la aplicación mediante Static Assets.

Ambos recursos viven bajo la misma identidad operativa de Cloudflare (**ALJOGABA / `aljogaba@gmail.com`**) y ambos reciben código desde repositorios propiedad de la organización GitHub `episuis` mediante la GitHub App de Cloudflare.

La diferencia del dominio técnico refleja el **producto de despliegue de Cloudflare**, no una diferencia de propiedad o autenticación.

Si en el futuro se desea uniformar la presentación pública, pueden asociarse dominios propios como `vigilancia.episuis.com.mx` y `produccion.episuis.com.mx` sin cambiar necesariamente la arquitectura subyacente.

---

# 3. DiseasesMapMx

## Capa GitHub común

- Identidad: **ALJOGABA ACADEMIC**.
- Correo: `aljogaba.academico@gmail.com`.
- GitHub: `aljogaba-academico`.
- Organización: `DiseasesMapMx`.
- Repositorios canónicos activos:
  - `DiseasesMapMx/web` — frontend web canónico.
  - `DiseasesMapMx/analysis-engine` — backend científico privado.

El repositorio público `aljogaba/DiseasesMapMx` es legacy y no forma parte de la infraestructura activa.

## Supabase DiseasesMapMx

Ruta de acceso confirmada:

`aljogaba.academico@gmail.com → GitHub aljogaba-academico → Supabase → Organization DiseasesMapMx → DiseasesMapMx Production`

## Cloudflare DiseasesMapMx

- Acceso directo por correo `aljogaba.academico@gmail.com`, no mediante GitHub.
- Account/workspace: `DiseasesMapMx`.
- Worker activo: `diseasesmapmx-web`.
- Origen conectado: `DiseasesMapMx/web`.

## Portal público

- Frontend: `DiseasesMapMx/web`.
- Deploy: Cloudflare Worker `diseasesmapmx-web`.
- Cuenta Cloudflare: **ALJOGABA ACADEMIC** / acceso directo con `aljogaba.academico@gmail.com`.

## Dashboard

### Estado actual

- Frontend: `DiseasesMapMx/web/dashboard.html` y `dashboard-es.html`.
- Deploy: `diseasesmapmx-web`.
- Datos actuales:
  - `assets/data/sequences.csv`
  - `maps/jalisco_municipios.geojson`

El Dashboard **no consulta actualmente DiseasesMapMx Production de forma directa**.

### Arquitectura planeada

`DiseasesMapMx Production → datasets curados/reproducibles → actualización del Dashboard`

Esta relación debe mostrarse como `PLANNED` / línea discontinua hasta que se implemente.

## Sequence Analysis

### Frontend

- Repo: `DiseasesMapMx/web`.
- Páginas: `phylogeny.html` y `phylogeny-es.html`.
- Hosting: Cloudflare Worker `diseasesmapmx-web`.

### Backend científico

- Repo privado: `DiseasesMapMx/analysis-engine`.
- Runtime: FastAPI + Uvicorn en Docker.
- Hosting: Render.
- Servicio: `diseasesmapmx-analysis-engine`.
- Región: Virginia.
- Acceso Render: `aljogaba.academico@gmail.com → GitHub aljogaba-academico → Render`.

Flujo activo:

`web / Sequence Analysis → Render / analysis-engine → resultado analítico`

### Persistencia

`analysis-engine / Render → DiseasesMapMx Production`

Supabase sostiene telemetría y persistencia privada autorizada del servicio analítico.

## Catálogo molecular y curación

### Admin

- Interfaz: `DiseasesMapMx/web/admin/`.
- Se sirve dentro del mismo deployment `diseasesmapmx-web`.
- Autenticación/operaciones: DiseasesMapMx Production.

### Importación administrativa directa

Flujo:

`Admin → staging → validación/revisión → curación humana → molecular canónico`

Las secuencias cargadas administrativamente **no pasan obligatoriamente por analysis-engine**.

### Motor como herramienta auxiliar

Desde Admin / motor de curación se puede utilizar `analysis-engine` como herramienta auxiliar, incluyendo consultas científicas a GenBank.

Relación correcta:

`Admin / curación → analysis-engine → GenBank`

Esto es una capacidad auxiliar y no un paso obligatorio del flujo de ingestión administrativa.

## Portal de colaboradores

### Frontend y autenticación

- Rutas: `/partner/`, `/results/` y sección **Colaboradores** en `/admin/`.
- Frontend: `DiseasesMapMx/web`.
- Deploy: `diseasesmapmx-web`.
- Organizaciones/usuarios colaboradores: Supabase Auth en DiseasesMapMx Production.

### Edge Functions

- `partner-intake`
- `partner-admin`
- `partner-qc`
- `partner-reports`
- `partner-results`

### Flujo validado

`/partner/ → Supabase Auth → partner-intake → autorización Admin → AUTO-QC → analysis-engine / Render → resultado → staging.curation_cases → Admin / Curación`

Después:

`partner-reports → reports-private → liberación caso/token → /results/`

La incorporación al catálogo `molecular`, asignación DMXSEQ, publicación y alimentación del Dashboard **no son automáticas**.

### Correo

Resend/notificaciones automáticas todavía no forman parte de la infraestructura activa de Portal de colaboradores; siguen pendientes.

---

# 4. Gestión de proyectos científicos

## Proyectos territoriales

- Repositorio privado: `aljogaba-academico/sanidad-porcina-investigacion`.
- Cuenta: **ALJOGABA ACADEMIC** / `aljogaba.academico@gmail.com` / GitHub `aljogaba-academico`.
- Servicios externos: ninguno.

## Investigación académica

- Repositorio privado: `aljogaba-academico/investigacion-academica`.
- Cuenta: **ALJOGABA ACADEMIC** / `aljogaba.academico@gmail.com` / GitHub `aljogaba-academico`.
- Servicios externos: ninguno.

---

# Servicios transversales: lectura correcta

GitHub, Cloudflare, Supabase, Render, Hostinger y Resend son infraestructura/proveedores. No son sistemas del ecosistema por sí mismos.

Una misma identidad puede administrar recursos de varios sistemas, y un mismo sistema puede apoyarse en recursos administrados con identidades distintas. Por eso la identidad/cuenta se anota **en el recurso concreto** y no como padre funcional del módulo.

Ejemplo EPISUIS Vigilancia:

- Código → organización GitHub `episuis`; Owners `episuis-admin` + `aljogaba`.
- Cloudflare → ALJOGABA / `aljogaba@gmail.com` directo.
- Supabase → ALJOGABA / `aljogaba@gmail.com` → GitHub `aljogaba`.
- Resend → ALJOGABA / `aljogaba@gmail.com` → GitHub `aljogaba`.

Eso no convierte ALJOGABA en propietario funcional de EPISUIS; solamente identifica las cuentas que sostienen recursos de infraestructura.

# Seguridad

Este registro es public-safe por decisión del propietario del repositorio. Puede incluir correos utilizados como identificadores de cuenta, pero nunca debe incluir:

- contraseñas;
- tokens;
- API keys;
- Supabase secret/service-role keys;
- secretos de Render o Cloudflare;
- códigos MFA o recuperación;
- archivos `.env`;
- enlaces administrativos sensibles que concedan acceso.
