# ALJOGABA OS — Professional Ecosystem

Última revisión: 2026-10-28

## Propósito

Esta vista complementa **Module Infrastructure**. No describe únicamente dependencias técnicas: documenta el ecosistema profesional desde la perspectiva de **identidad → método de acceso → cuenta/proveedor → perfil/recurso/presencia**.

La fuente visual es `data/professional-ecosystem.json` y se presenta en Workstation mediante **Professional Ecosystem**.

## Alcance

Solo se incluyen tres raíces profesionales:

- **ALJOGABA** — identidad profesional y académica principal.
- **ALJOGABA ACADEMIC** — identidad académica de desarrollo científico e infraestructura.
- **EPISUIS** — identidad institucional y presencia profesional.

Se excluyen deliberadamente cuentas y servicios de uso personal, entretenimiento, Club Entre Libros y Letras, Smoke Lab y servicios de consulta personal. Esos elementos pueden tener un inventario separado en el futuro, pero no deben mezclarse con esta vista.

## Principios de modelado

1. Un correo asociado no implica necesariamente OAuth ni login social.
2. Una organización GitHub es un contenedor de recursos, no una identidad que inicia sesión.
3. Un perfil público y una cuenta de acceso pueden ser entidades diferentes.
4. Las relaciones transversales se documentan cuando son reales; por ejemplo, el perfil académico de LinkedIn de ALJOGABA administra la página institucional de EPISUIS.
5. Los servicios reservados para identidad de marca se distinguen de los activos operativos.
6. No se almacenan contraseñas, passkeys, códigos MFA, recovery codes, API keys, tokens ni valores de secretos.

## Relaciones confirmadas destacadas

### ALJOGABA

- GitHub `aljogaba`: `aljogaba@gmail.com`.
- ORCID `0000-0003-4223-6161`: cuenta propia, 2FA activo y sin alternate sign-in accounts.
- Google Scholar: acceso con `aljogaba@gmail.com`; afiliación INIFAP verificada.
- ResearchGate: principal `aljogaba@gmail.com`; correo adicional `galindo.alberto@inifap.gob.mx`.
- Elsevier: acceso con `aljogaba@gmail.com`; Scopus author profile conectado; Mendeley usa la misma cuenta.
- Scopus Author ID `36666208000`: enlazado con ORCID.
- Semantic Scholar: acceso con `aljogaba@gmail.com`; ORCID visible en perfil.
- SciProfiles: cuenta principal verificada `aljogaba@gmail.com`.
- NCBI/My NCBI: correo confirmado `aljogaba@gmail.com`; login/linked account ORCID; GenBank se accede mediante esta ruta.
- Web of Science Researcher Profiles: conexión autorizada desde ORCID; acceso operativo directo no confirmado.
- X `@aljogaba`: asociado a `jorge.inifap@gmail.com` y usado como perfil académico/profesional.
- LinkedIn: perfil académico/profesional; administra la LinkedIn Company Page de EPISUIS.

### ALJOGABA ACADEMIC

- correo raíz: `aljogaba.academico@gmail.com`.
- GitHub `aljogaba-academico`: administra la organización `DiseasesMapMx`.
- Cloudflare DiseasesMapMx: acceso directo por correo académico; 2FA TOTP + email; un Super Administrator confirmado.
- Supabase DiseasesMapMx: correo académico → GitHub `aljogaba-academico` → Supabase.
- Render: correo académico → GitHub `aljogaba-academico` → Workspace `DiseasesMapMx`.
- `diseasesmapmx-analysis-engine`: Docker, `main`, Auto-Deploy, Virginia (US East), Free, sin disco persistente.
- Workstation: pertenece a esta rama de desarrollo científico.

### EPISUIS

- correo institucional: `episuis@gmail.com`.
- Facebook: `episuis@gmail.com` → perfil administrativo George Galindo → Página EPISUIS. El perfil administrador no se usa como presencia pública.
- Instagram `@episuis`: acceso con `episuis@gmail.com`.
- X `@episuis`: identidad institucional reservada / baja actividad.
- LinkedIn Company Page EPISUIS: reserva de nombre / presencia institucional sin actividad; administrada desde el LinkedIn académico de ALJOGABA.
- Hostinger: dominio `episuis.com.mx` bajo identidad EPISUIS.
- GitHub Organization `episuis`: recurso organizacional; Owners `aljogaba` + `episuis-admin`.
- Cloudflare EPISUIS: acceso directo con `aljogaba@gmail.com`.
- Supabase EPISUIS: `aljogaba@gmail.com` → GitHub `aljogaba` → Supabase.
- Resend: Team `EPISUIS`; login por Google o GitHub `aljogaba`; MFA activo; dominio de envío `episuis.com.mx`.

## ORCID — Trusted organizations

La auditoría mostró conexiones autorizadas con, entre otros, Crossref, Elsevier Editorial, GitHub, NCBI, Scopus–Elsevier, Springer Nature, Web of Science Researcher Profiles y otras plataformas. La vista profesional solo eleva a primer plano las relaciones con valor operativo actual; no convierte automáticamente cada Trusted organization en un servicio de uso activo.

## Regla para futuras incorporaciones

Antes de agregar un servicio al mapa debe confirmarse al menos uno de estos puntos:

- es un método real de acceso;
- es un perfil profesional/académico usado o mantenido;
- administra un activo profesional;
- sostiene infraestructura activa;
- funciona como identidad institucional reservada de forma deliberada.

Si es exclusivamente personal o de consulta personal, queda fuera de Professional Ecosystem.
