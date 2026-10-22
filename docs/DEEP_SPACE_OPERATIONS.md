# ALJOGABA OS v0.5 — Deep Space Operations

Última revisión: 2026-10-22

## Objetivo

`Deep Space Operations` es una capa de ambientación e interacción sobre ALJOGABA OS. No reemplaza ni modifica el núcleo funcional de la workstation.

Regla de diseño:

> **Operación primero → ambientación después → Easter eggs al fondo.**

La capa v0.5 debe poder desactivarse sin afectar Systems, Modules, Mission Control, System Map, Module Infrastructure, Toolbox, Engine Room, Output Bay, Local Ops o Side Quests.

## Alcance aprobado

### 1. Display / CRT

- Scanlines y viñeta CRT sutiles.
- Flicker breve durante boot.
- Selector de fósforo:
  - `CYAN`
  - `GREEN`
  - `AMBER`
  - `RED`
- El selector modifica terminal, LEDs y acentos de interfaz; no re-renderiza ni recolorea Mermaid.
- Preferencia persistida únicamente en `localStorage`.
- CRT configurable ON/OFF.

### 2. Audio

- Audio OFF por defecto.
- Blips de hover claramente audibles pero breves.
- Click mecánico con mayor presencia que hover.
- Ráfagas breves de estática / enlace COMMS.
- Firmas acústicas ligeras por sistema.
- Ambient hum opcional y separado; OFF por defecto.
- `Master volume` interno de Deep Space disponible en FX, independiente del volumen general de Windows/navegador.
- El beep de anomalía del boot respeta la preferencia AUDIO.
- Audio sintetizado mediante Web Audio API; no requiere archivos de audio externos.

Jerarquía de mezcla:

```text
ambient hum < hover < click < COMMS/system link < radar/alert < self destruct
```

### 3. COMMS

COMMS es efímero. Puede mostrar durante pocos segundos mensajes de enlace, calibración o diagnóstico.

No es:

- ticker;
- marquee;
- historial persistente;
- bitácora;
- sistema de notificaciones externo.

### 4. Command Terminal

La terminal es una segunda interfaz de navegación del OS. No ejecuta comandos del sistema operativo ni shell real.

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

Existe un comando Easter egg de autodestrucción, pero sólo activa una simulación visual local.

### 5. System Map / zoom y calibración

El Long Range Scanner incorpora:

- zoom operativo tanto en `ECOSYSTEM RADAR` como en `ARCHITECTURE`;
- rango aproximado de 35% a 160%;
- control `FIT` para ajustar la vista completa al espacio disponible;
- `CALIBRATE` para el radar.

`FIT` y zoom actúan sobre el contenedor visual. No alteran la definición Mermaid ni la fuente de datos del mapa.

La calibración:

1. lleva el mapa a modo radar si es necesario;
2. ejecuta una pasada visual de calibración;
3. reproduce telemetría acústica sólo si AUDIO está activo;
4. termina con `SYSTEM ARRAY NOMINAL`.

No modifica el inventario de sistemas ni su estado real.

### 6. Controlled Easter Eggs

#### Diagnostic glitch

Cinco interacciones rápidas sobre un módulo o nodo Mermaid pueden disparar un glitch visual breve y un mensaje ficticio de diagnóstico.

No altera datos ni navegación.

#### Self Destruct

Disponible detrás de una tapa de seguridad dentro de Deep Space Settings y mediante terminal.

La secuencia:

- activa modo visual de alerta;
- inicia cuenta regresiva de 10 segundos;
- permite abortar;
- al concluir informa que la simulación terminó;
- reinicia la interfaz de ALJOGABA OS.

**Nunca elimina datos, repositorios, archivos, configuraciones externas ni credenciales.**

## Identidad visual / favicon

La marca de pestaña utiliza `assets/favicon.svg`:

- terminal oscura;
- borde cian;
- marca `A>`;
- diseñada para seguir siendo legible a tamaño pequeño.

## Corrección v0.5 — About Workstation

Se corrigió un bloqueo causado por una recursión de `MutationObserver` al actualizar la insignia de versión de About. El hotfix vive en `assets/js/hotfix-v05.js` y evita volver a crear el ciclo de mutaciones.

## Exclusiones explícitas

Por decisión de diseño, v0.5 NO incluye:

- Flight Log / analytics de uso;
- contador de aperturas o interacciones;
- ticker / cinta de alertas;
- Captain's Log / Bitácora del Capitán;
- telemetría externa;
- almacenamiento remoto de preferencias de interfaz.

Estas exclusiones evitan sobrecargar la workstation y crear nuevas capas de información que compitan con sus sistemas canónicos.

## Persistencia local

Preferencias generales:

```text
localStorage key: aljogaba-os-deep-space-v05
```

Contenido esperado:

- phosphor;
- audio;
- ambience;
- crt;
- fx.

Volumen maestro de la mezcla v0.5:

```text
localStorage key: aljogaba-os-master-volume-v05
```

No se almacenan métricas de uso ni datos del ecosistema.

## Archivos

```text
assets/css/deep-space.css
assets/css/v05-tuning.css
assets/js/deep-space.js
assets/js/audio-tuning.js
assets/js/map-tuning.js
assets/js/hotfix-v05.js
assets/js/boot.js
assets/favicon.svg
index.html
```

## Separación arquitectónica

```text
FUNCTIONAL CORE
Systems · Missions · Tools · Infrastructure · Docs
                    │
                    ▼
IMMERSION LAYER
CRT · Phosphor · Audio · COMMS · Terminal · Radar FX
                    │
                    ▼
EASTER-EGG LAYER
Controlled glitch · Red Alert · Self Destruct
```

La capa inferior nunca debe modificar la fuente de verdad de la capa superior.

## Regla de mantenimiento

Todo cambio futuro en esta capa debe:

1. conservar la operación normal con AUDIO/CRT/FX desactivados;
2. respetar `prefers-reduced-motion`;
3. no introducir telemetría de uso;
4. no duplicar datos canónicos de sistemas o infraestructura;
5. mantener Mermaid como componente funcional independiente de las paletas de fósforo;
6. documentarse en este archivo y, si cambia la arquitectura general, también en `README.md`.
