# ALJOGABA OS — Identity, authentication and ownership model

Última revisión: 2026-10-26

## Propósito

Este documento evita una confusión operativa recurrente: **cuenta personal, organización, proveedor externo e instalación de una aplicación no son la misma cosa**.

La regla principal es:

> **Una organización de GitHub no inicia sesión. Las personas/cuentas se autentican; la organización posee repositorios y concede acceso a integraciones.**

Por tanto, antes de crear una cuenta nueva en cualquier proveedor debe identificarse primero qué identidad humana/técnica entrará, qué organización o sistema será propietario funcional del recurso y qué mecanismo de autenticación utilizará el proveedor.

---

## 1. Tipos de identidad que deben distinguirse

### Cuenta GitHub personal o técnica

Ejemplos activos:

- `aljogaba` — cuenta personal/profesional de Alberto Jorge Galindo Barboza.
- `aljogaba-academico` — cuenta académica/de desarrollo científico.
- `episuis-admin` — cuenta técnica/administrativa de respaldo para EPISUIS.

Estas cuentas **sí se autentican** en GitHub. Por eso tienen sus propios métodos de acceso, 2FA, passkeys, sesiones y códigos de recuperación.

Los códigos de recuperación pertenecen a la **cuenta GitHub individual**, nunca a una organización.

### Organización GitHub

Ejemplos:

- `episuis`
- `DiseasesMapMx`

Una organización:

- no tiene contraseña propia;
- no tiene passkey propia;
- no tiene códigos de recuperación propios;
- no "inicia sesión" en GitHub.

La organización contiene repositorios, miembros, Owners, permisos e instalaciones de GitHub Apps. Sus acciones administrativas se realizan mediante cuentas personales/técnicas autorizadas.

### Proveedor externo

Ejemplos: Cloudflare, Supabase, Resend, Render y Hostinger.

Cada proveedor puede usar una ruta de autenticación distinta:

- correo + autenticación propia;
- OAuth con GitHub;
- GitHub App instalada sobre una organización;
- acceso directo mediante una cuenta independiente.

Nunca debe inferirse la identidad de acceso solo porque un repositorio pertenezca a una organización determinada.

---

## 2. Modelo confirmado para EPISUIS

### Gobierno de la organización GitHub

Organización: `episuis`.

Owners confirmados:

- `episuis-admin` — cuenta técnica/administrativa de respaldo;
- `aljogaba` — cuenta personal/profesional de Alberto Jorge Galindo Barboza.

Ambas cuentas tienen 2FA y la organización exige 2FA con métodos seguros.

### `episuis-admin`

`episuis-admin` **sí autentica en GitHub**, porque es una cuenta GitHub real y Owner de la organización.

Sin embargo, después de la auditoría del 26 de octubre de 2026, `episuis-admin` **no se utiliza como identidad de acceso activa para Cloudflare, Supabase ni Resend**.

Se revocaron las autorizaciones OAuth personales residuales de:

- Cloudflare;
- Supabase;
- Resend.

Estas autorizaciones estaban marcadas como `Never used` y solo solicitaban lectura del correo electrónico.

La cuenta conserva:

- passkey;
- app autenticadora;
- códigos de recuperación propios;
- rol Owner en `episuis`.

Los códigos de recuperación recuperados/revisados durante la auditoría corresponden exclusivamente a **`episuis-admin`**, no a la organización `episuis`.

### Organización `episuis` e integraciones GitHub

La organización tiene instaladas GitHub Apps. Estas instalaciones pertenecen al contexto de la **organización**, aunque su instalación/configuración sea aprobada por una cuenta Owner.

Integraciones confirmadas:

#### Cloudflare Workers and Pages

Instalada en la organización `episuis` con acceso selectivo únicamente a:

- `episuis/vigilancia-episuis`;
- `episuis/produccion`.

No tiene acceso al repo `episuis/web`.

Esta instalación debe conservarse porque sostiene la integración GitHub → Cloudflare de los módulos que realmente usan Cloudflare.

#### ChatGPT Codex Connector

Instalada en la organización para permitir trabajo autorizado sobre los repositorios de EPISUIS desde ChatGPT/Codex según los permisos concedidos.

### Proveedores externos de EPISUIS

La identidad operativa confirmada es:

- **Cloudflare** → acceso directo con `aljogaba@gmail.com`.
- **Supabase EPISUIS** → `aljogaba@gmail.com → GitHub aljogaba → Supabase`.
- **Resend** → `aljogaba@gmail.com → GitHub aljogaba → Resend`.
- **Hostinger / dominio `episuis.com.mx`** → `episuis@gmail.com`.

Por tanto:

> La organización GitHub `episuis` posee los repositorios y concede acceso a GitHub Apps; `episuis-admin` es una cuenta Owner de gobierno y respaldo; las cuentas activas de los proveedores externos pueden ser distintas.

---

## 3. Relación correcta por módulo EPISUIS

### Web EPISUIS

`episuis/web → GitHub Pages → episuis.com.mx`

- propietario del repo: organización `episuis`;
- administración GitHub: Owners `episuis-admin` y `aljogaba`;
- publicación: GitHub Pages;
- dominio: Hostinger / `episuis@gmail.com`.

### Vigilancia EPISUIS

`episuis/vigilancia-episuis → Cloudflare Pages`

más:

`Vigilancia EPISUIS → Supabase vigilancia-episuis`

más:

`Vigilancia EPISUIS → Resend → episuis.com.mx`

- repo: organización `episuis`;
- GitHub App Cloudflare: instalada en organización `episuis`;
- cuenta Cloudflare: `aljogaba@gmail.com`;
- cuenta Supabase: `aljogaba@gmail.com → GitHub aljogaba`;
- cuenta Resend: `aljogaba@gmail.com → GitHub aljogaba`.

### EPISUIS Producción

`episuis/produccion → Cloudflare Worker episuis-produccion`

más:

`EPISUIS Producción → Supabase produccion`

- repo: organización `episuis`;
- GitHub App Cloudflare: instalada en organización `episuis`;
- cuenta Cloudflare: `aljogaba@gmail.com`;
- cuenta Supabase: `aljogaba@gmail.com → GitHub aljogaba`;
- Resend: no forma parte actualmente de este módulo.

---

## 4. Regla para crear nuevas cuentas o integraciones

Antes de registrarse en un proveedor nuevo o pulsar "Continue with GitHub", responder primero estas preguntas:

1. **¿Qué sistema necesita el recurso?**
2. **¿Quién es el propietario funcional: perfil personal, EPISUIS, DiseasesMapMx u otro sistema?**
3. **¿El recurso debe pertenecer a una organización o a una cuenta individual?**
4. **¿Con qué identidad se administrará el proveedor?**
5. **¿La autenticación será directa por correo, OAuth GitHub o GitHub App?**
6. **¿Ya existe una cuenta válida para ese proveedor?** Si sí, no crear otra sin una razón documentada.
7. **¿La integración necesita todos los repositorios o solo algunos?** Aplicar mínimo privilegio.
8. **¿Dónde se documentará la ruta de acceso?** Actualizar primero `data/infrastructure.json` y, cuando corresponda, este documento.

Regla operativa:

> **No crear una cuenta nueva por conveniencia momentánea. Primero identificar la identidad, el propietario y la ruta de autenticación canónica.**

---

## 5. Qué NO debe almacenarse en Workstation

Workstation puede documentar identidades, correos de referencia, organizaciones, proveedores, repositorios, relaciones y mecanismos de autenticación a nivel conceptual.

Nunca debe almacenar:

- contraseñas;
- passkeys;
- códigos de recuperación;
- códigos MFA;
- tokens OAuth;
- API keys;
- service-role keys;
- secretos `.env`;
- enlaces administrativos que concedan acceso.

La documentación debe permitir responder **"con qué cuenta y por qué ruta entro"**, pero nunca contener el secreto necesario para entrar.
