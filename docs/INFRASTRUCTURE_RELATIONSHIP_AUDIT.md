# ALJOGABA OS — Infrastructure Relationship Audit

Última revisión: 2026-10-21

## Regla de modelado

ALJOGABA OS representa infraestructura **por módulo**. Una identidad de acceso no se interpreta como propietaria del sistema ni como nodo padre funcional.

Cada esquema debe responder solamente:

1. ¿A qué sistema pertenece el módulo?
2. ¿Dónde vive su código o fuente canónica?
3. ¿Dónde se despliega o ejecuta?
4. ¿Qué backend o servicio externo utiliza?
5. ¿Qué identidad/cuenta confirmada administra cada recurso?

Si una identidad de acceso no está confirmada de forma directa, se omite en lugar de inferirse.

## Identidades conceptuales

- **ALJOGABA** → identidad personal/profesional; handle GitHub `aljogaba`.
- **ALJOGABA ACADEMIC** → identidad académica/investigación; handle GitHub `aljogaba-academico`.
- **EPISUIS** → identidad operativa de EPISUIS; handle GitHub `episuis-admin` y organización `episuis`.

Mayúsculas identifican la identidad conceptual. Handles, repositorios y nombres técnicos conservan su escritura real.

## Perfil profesional

### Web profesional

- Código/sitio: `aljogaba/aljogaba.github.io`.
- Publicación: GitHub Pages.
- Cuenta: **ALJOGABA** / GitHub `aljogaba`.

### Herramientas

- `aljogaba/sipro-porcino` — GitHub Pages habilitado.
- `aljogaba/epi-2x2` — GitHub Pages habilitado.
- `aljogaba/dimu-porcino` — GitHub Pages habilitado.
- Cuenta: **ALJOGABA** / GitHub `aljogaba`.

### CV canónico

- Fuente privada: `aljogaba/perfil-profesional-source`.
- Cuenta: **ALJOGABA** / GitHub `aljogaba`.

### Notas técnicas

- Repositorio: `aljogaba/notas-tecnicas`.
- Cuenta: **ALJOGABA** / GitHub `aljogaba`.

El repositorio público histórico `aljogaba/DiseasesMapMx` es legacy y no forma parte de la infraestructura activa.

## EPISUIS

### Capa GitHub común

- Cuenta operativa GitHub: **EPISUIS** / `episuis-admin`.
- Organización: `episuis`.
- Repositorios confirmados: `web`, `vigilancia-episuis`, `produccion`.

### Web EPISUIS

- Fuente: `episuis/web`.
- Publicación: GitHub Pages desde `main` / raíz.
- Dominio público: `episuis.com.mx` mediante `CNAME`.
- Registro/DNS del dominio: Hostinger bajo la identidad **EPISUIS**.

### Vigilancia EPISUIS

- Fuente: `episuis/vigilancia-episuis`.
- Deploy: Cloudflare Pages, proyecto `vigilancia-episuis`.
- Cuenta Cloudflare confirmada: **ALJOGABA**.
- Backend: Supabase, workspace EPISUIS, proyecto `vigilancia-episuis`.
- Correo transaccional: Resend.
- Resend: **ALJOGABA** vía GitHub `aljogaba`, workspace `aljogaba`.
- Sending domain de Resend: `episuis.com.mx`.
- Uso confirmado de correo: invitaciones y activación de médicos veterinarios participantes.

**Pendiente deliberado:** la identidad exacta usada para acceder al workspace EPISUIS de Supabase no se atribuye en ALJOGABA OS hasta contar con evidencia directa inequívoca.

### EPISUIS Producción

- Fuente: `episuis/produccion`.
- Deploy: Cloudflare Worker `episuis-produccion`.
- Cuenta Cloudflare confirmada: **ALJOGABA**.
- Backend: Supabase, workspace EPISUIS, proyecto `produccion`.

**Pendiente deliberado:** igual que en Vigilancia, no se atribuye una identidad concreta de login al workspace EPISUIS de Supabase sin confirmación directa.

## DiseasesMapMx

### Capa GitHub

- Identidad: **ALJOGABA ACADEMIC** / GitHub `aljogaba-academico`.
- Organización: `DiseasesMapMx`.
- Repositorios activos: `DiseasesMapMx/web` y `DiseasesMapMx/analysis-engine`.

### Portal público / aplicación web

- Frontend canónico: `DiseasesMapMx/web`.
- Deploy de producción: Cloudflare Worker `diseasesmapmx-web`.
- Cuenta Cloudflare: **ALJOGABA ACADEMIC**, workspace/account `DiseasesMapMx`.

### Dashboard

- Frontend: `DiseasesMapMx/web` (`dashboard.html`).
- Deploy: mismo Worker `diseasesmapmx-web`.
- Datos: Supabase `DiseasesMapMx Production`, únicamente desde datos curados/publicables.
- El dashboard no consume directamente cargas del portal de colaboradores.

### Sequence Analysis

- Frontend: `DiseasesMapMx/web`.
- Motor científico privado: `DiseasesMapMx/analysis-engine`.
- Flujo documentado: usuario → frontend → analysis-engine → resultado estructurado → informe HTML.

### Catálogo molecular y curación

- Interfaz administrativa: `DiseasesMapMx/web/admin/`.
- Backend crítico: Supabase `DiseasesMapMx Production`.
- Cuenta de acceso confirmada: **ALJOGABA ACADEMIC** vía GitHub `aljogaba-academico`.
- Esquemas canónicos: `molecular`, `staging`, `public`, `private`.

### Portal de colaboradores

- Frontend: `DiseasesMapMx/web/partner/`.
- Deploy: `diseasesmapmx-web` en Cloudflare.
- Backend: `DiseasesMapMx Production`.
- Funciones controladas: Edge Functions `partner-*` para intake, QC, reportes y resultados.
- La curación posterior es un proceso independiente.

## Gestión de proyectos científicos

### Proyectos territoriales

- Repositorio privado: `aljogaba-academico/sanidad-porcina-investigacion`.
- Cuenta: **ALJOGABA ACADEMIC** / GitHub `aljogaba-academico`.

### Investigación académica

- Repositorio privado: `aljogaba-academico/investigacion-academica`.
- Cuenta: **ALJOGABA ACADEMIC** / GitHub `aljogaba-academico`.

## Servicios transversales: lectura correcta

- GitHub, Cloudflare, Supabase, Hostinger y Resend son proveedores/infraestructura.
- No se representan como sistemas del ecosistema.
- Una misma identidad puede administrar recursos de sistemas distintos.
- Una misma plataforma puede contener recursos administrados por identidades distintas.
- El diagrama debe mostrar esa relación **en el recurso concreto**, no convertir la identidad en padre del sistema.

## Seguridad

Este registro es public-safe. No incluye ni debe incluir contraseñas, tokens, API keys, secretos, códigos MFA, service-role keys ni rutas administrativas sensibles.
