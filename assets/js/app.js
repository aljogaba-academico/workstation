const state = {
  systems: [],
  missions: [],
  tools: [],
  windows: new Map(),
  z: 200,
  cascade: 0,
  selectedIcon: null
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

function safeUrl(url) {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

function statusLabel(status) {
  return ({ public: "PUBLIC", private: "PRIVATE", internal: "INTERNAL", development: "DEV", planned: "PLANNED" })[status] || "SYSTEM";
}

function systemIcon(id) {
  return ({
    episuis: "▥",
    perfil: "◉",
    diseasesmapmx: "⌬",
    proyectos: "▣"
  })[id] || "□";
}

function desktopItems() {
  const systems = state.systems.map(system => ({
    id: `system-${system.id}`,
    label: system.name,
    icon: systemIcon(system.id),
    type: "system",
    payload: system.id
  }));

  return [
    ...systems,
    { id: "mission", label: "Mission Control", icon: "▶", type: "mission" },
    { id: "map", label: "System Map", icon: "◇", type: "map" },
    { id: "toolbox", label: "Toolbox", icon: "◆", type: "toolbox" },
    { id: "about", label: "About", icon: "ⓘ", type: "about" }
  ];
}

function renderDesktopIcons() {
  const container = $("#desktopIcons");
  container.innerHTML = desktopItems().map(item => `
    <button class="desktop-icon" data-icon-id="${item.id}" data-launch="${item.type}" ${item.payload ? `data-payload="${item.payload}"` : ""} aria-label="Abrir ${item.label}">
      <span class="pixel-icon">${item.icon}</span>
      <span class="desktop-icon-label">${item.label}</span>
    </button>
  `).join("");

  $$(".desktop-icon", container).forEach(icon => {
    icon.addEventListener("click", event => {
      event.stopPropagation();
      $$(".desktop-icon", container).forEach(x => x.classList.remove("selected"));
      icon.classList.add("selected");
      state.selectedIcon = icon.dataset.iconId;
      if (window.matchMedia("(pointer: coarse)").matches) {
        launch(icon.dataset.launch, icon.dataset.payload || null);
      }
    });
    icon.addEventListener("dblclick", event => {
      event.stopPropagation();
      launch(icon.dataset.launch, icon.dataset.payload || null);
    });
    icon.addEventListener("keydown", event => {
      if (event.key === "Enter") launch(icon.dataset.launch, icon.dataset.payload || null);
    });
  });
}

function renderStartSystems() {
  $("#startSystems").innerHTML = state.systems.map(system => `
    <button data-launch="system" data-payload="${system.id}">${systemIcon(system.id)} ${system.name}</button>
  `).join("");
}

function windowPosition() {
  const step = state.cascade++ % 8;
  return { left: 150 + step * 26, top: 24 + step * 22 };
}

function bringToFront(win) {
  state.z += 1;
  win.style.zIndex = state.z;
  $$(".os-window").forEach(w => w.classList.toggle("active", w === win));
  $$(".task-button").forEach(btn => btn.classList.toggle("active", btn.dataset.windowId === win.dataset.windowId));
}

function makeDraggable(win) {
  const bar = $(".window-titlebar", win);
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  bar.addEventListener("pointerdown", event => {
    if (event.target.closest(".window-control") || win.classList.contains("maximized")) return;
    dragging = true;
    bringToFront(win);
    startX = event.clientX;
    startY = event.clientY;
    startLeft = parseFloat(win.style.left) || 0;
    startTop = parseFloat(win.style.top) || 0;
    bar.setPointerCapture(event.pointerId);
  });

  bar.addEventListener("pointermove", event => {
    if (!dragging) return;
    const layer = $("#windowLayer").getBoundingClientRect();
    const rect = win.getBoundingClientRect();
    const maxLeft = Math.max(0, layer.width - Math.min(rect.width, layer.width));
    const maxTop = Math.max(0, layer.height - 40);
    const nextLeft = Math.min(maxLeft, Math.max(0, startLeft + event.clientX - startX));
    const nextTop = Math.min(maxTop, Math.max(0, startTop + event.clientY - startY));
    win.style.left = `${nextLeft}px`;
    win.style.top = `${nextTop}px`;
  });

  const stop = event => {
    if (!dragging) return;
    dragging = false;
    try { bar.releasePointerCapture(event.pointerId); } catch (_) {}
  };
  bar.addEventListener("pointerup", stop);
  bar.addEventListener("pointercancel", stop);
}

function addTaskButton(id, title, icon) {
  const btn = document.createElement("button");
  btn.className = "task-button";
  btn.dataset.windowId = id;
  btn.innerHTML = `${icon} ${title}`;
  btn.addEventListener("click", () => {
    const win = state.windows.get(id);
    if (!win) return;
    if (win.classList.contains("minimized")) {
      win.classList.remove("minimized");
      bringToFront(win);
    } else if (win.classList.contains("active")) {
      win.classList.add("minimized");
      btn.classList.remove("active");
    } else {
      bringToFront(win);
    }
  });
  $("#taskButtons").appendChild(btn);
}

function closeWindow(id) {
  const win = state.windows.get(id);
  if (!win) return;
  win.remove();
  state.windows.delete(id);
  const task = $(`.task-button[data-window-id="${id}"]`);
  if (task) task.remove();
  const remaining = [...state.windows.values()];
  if (remaining.length) bringToFront(remaining[remaining.length - 1]);
}

function createWindow({ id, title, icon = "□", html, width = 760, height = 560, onMount }) {
  if (state.windows.has(id)) {
    const existing = state.windows.get(id);
    existing.classList.remove("minimized");
    bringToFront(existing);
    return existing;
  }

  const pos = windowPosition();
  const win = document.createElement("article");
  win.className = "os-window active";
  win.dataset.windowId = id;
  win.style.left = `${pos.left}px`;
  win.style.top = `${pos.top}px`;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.innerHTML = `
    <header class="window-titlebar">
      <div class="window-title"><span>${icon}</span><span>${title}</span></div>
      <div class="window-controls">
        <button class="window-control" data-action="minimize" aria-label="Minimizar">_</button>
        <button class="window-control" data-action="maximize" aria-label="Maximizar">□</button>
        <button class="window-control" data-action="close" aria-label="Cerrar">×</button>
      </div>
    </header>
    <div class="window-body">${html}</div>
  `;

  $("#windowLayer").appendChild(win);
  state.windows.set(id, win);
  addTaskButton(id, title, icon);
  bringToFront(win);
  makeDraggable(win);

  win.addEventListener("pointerdown", () => bringToFront(win));
  $("[data-action='close']", win).addEventListener("click", () => closeWindow(id));
  $("[data-action='minimize']", win).addEventListener("click", () => {
    win.classList.add("minimized");
    const task = $(`.task-button[data-window-id="${id}"]`);
    if (task) task.classList.remove("active");
  });
  $("[data-action='maximize']", win).addEventListener("click", () => {
    win.classList.toggle("maximized");
    bringToFront(win);
  });
  $(".window-titlebar", win).addEventListener("dblclick", event => {
    if (event.target.closest(".window-control")) return;
    win.classList.toggle("maximized");
    bringToFront(win);
  });

  if (onMount) onMount(win);
  return win;
}

function welcomeHtml() {
  const modules = state.systems.reduce((sum, system) => sum + (system.modules?.length || 0), 0);
  return `
    <div class="welcome-wrap">
      <section>
        <p class="eyebrow">SYSTEM MESSAGE / HOME</p>
        <h1>¿Qué quieres hacer hoy?</h1>
        <p>Esta workstation es la puerta de entrada a tu ecosistema científico. Abre un sistema directamente o usa <strong>Mission Control</strong> cuando quieras que la ruta te lleve desde una necesidad hasta la herramienta adecuada.</p>
        <div class="quick-actions">
          <button class="retro-button primary" data-launch="mission">▶ SELECT MISSION</button>
          <button class="retro-button" data-launch="map">◇ SYSTEM MAP</button>
          <button class="retro-button" data-launch="toolbox">◆ TOOLBOX</button>
        </div>
        <div class="flow-strip">
          <span>CAPTURAR</span><b>→</b><span>ORGANIZAR</span><b>→</b><span>ANALIZAR</span><b>→</b><span>INTERPRETAR</span><b>→</b><span>GESTIONAR</span><b>→</b><span>COMUNICAR</span>
        </div>
      </section>
      <aside class="stats-grid">
        <div class="stat-box"><strong>${state.systems.length}</strong><span>SYSTEMS</span></div>
        <div class="stat-box"><strong>${modules}</strong><span>MODULES</span></div>
        <div class="stat-box"><strong>${state.tools.length}</strong><span>TOOLS</span></div>
        <div class="stat-box"><strong>${state.missions.length}</strong><span>MISSIONS</span></div>
      </aside>
    </div>
  `;
}

function openWelcome() {
  createWindow({ id: "welcome", title: "Welcome to ALJOGABA OS", icon: "A>", html: welcomeHtml(), width: 820, height: 500 });
}

function missionHtml() {
  return `
    <div class="mission-layout">
      <nav class="mission-list" aria-label="Misiones">
        ${state.missions.map((m, i) => `<button class="mission-button ${i === 0 ? "active" : ""}" data-mission="${m.id}">${m.name}</button>`).join("")}
      </nav>
      <section class="mission-detail"></section>
    </div>
  `;
}

function renderMissionDetail(win, id) {
  const mission = state.missions.find(m => m.id === id);
  if (!mission) return;
  const primarySystem = state.systems.find(s => s.id === mission.primarySystem);
  const detail = $(".mission-detail", win);
  detail.innerHTML = `
    <p class="terminal-prompt">&gt; MISSION LOADED</p>
    <h2>${mission.name}</h2>
    <p>${mission.description}</p>
    <div class="route">
      ${mission.route.map((step, idx) => `<span class="route-step">${step}</span>${idx < mission.route.length - 1 ? `<span class="route-arrow">→</span>` : ""}`).join("")}
    </div>
    <p><strong>Entrada recomendada:</strong> ${primarySystem ? primarySystem.name : "Revisar ruta"}</p>
    ${primarySystem ? `<button class="retro-button primary" data-launch="system" data-payload="${primarySystem.id}">OPEN ${primarySystem.name.toUpperCase()}</button>` : ""}
  `;
}

function openMissionControl() {
  createWindow({
    id: "mission-control",
    title: "Mission Control",
    icon: "▶",
    html: missionHtml(),
    width: 850,
    height: 570,
    onMount: win => {
      const first = state.missions[0];
      if (first) renderMissionDetail(win, first.id);
      $$(".mission-button", win).forEach(btn => {
        btn.addEventListener("click", () => {
          $$(".mission-button", win).forEach(x => x.classList.toggle("active", x === btn));
          renderMissionDetail(win, btn.dataset.mission);
        });
      });
    }
  });
}

function ecosystemMermaid() {
  return `
flowchart TD
  HOME["🖥️ ALJOGABA OS<br/>Research Workstation"]
  EPISUIS["EPISUIS"]
  PROFILE["PERFIL PROFESIONAL"]
  DMX["DiseasesMapMx"]
  PROJECTS["GESTIÓN DE PROYECTOS"]
  HOME --> EPISUIS
  HOME --> PROFILE
  HOME --> DMX
  HOME --> PROJECTS
  EPISUIS --> EWEB["Web"]
  EPISUIS --> EVIG["Vigilancia"]
  EPISUIS --> EPROD["Producción"]
  EPISUIS --> EMARCO["Marco metodológico"]
  PROFILE --> PWEB["Web"]
  PROFILE --> PTOOLS["Tools"]
  PROFILE --> PCV["Gestión curricular"]
  DMX --> DPUBLIC["Portal público"]
  DMX --> DDASH["Dashboard"]
  DMX --> DSEQ["Análisis de secuencias"]
  DMX --> DADMIN["Admin / catálogo"]
  PROJECTS --> PTERR["Territorial"]
  PROJECTS --> PINV["Investigación"]
  PROJECTS --> PSTRAT["Ejes estratégicos"]
  PROJECTS --> PBUILD["Propuestas / entregables"]
  click EPISUIS call openSystem("episuis")
  click PROFILE call openSystem("perfil")
  click DMX call openSystem("diseasesmapmx")
  click PROJECTS call openSystem("proyectos")
  classDef core fill:#10140f,color:#e8f2e1,stroke:#10140f,stroke-width:2px;
  classDef system fill:#d9e6ce,color:#10140f,stroke:#10140f,stroke-width:2px;
  classDef module fill:#f7faf4,color:#10140f,stroke:#5f7656,stroke-width:1.5px;
  class HOME core;
  class EPISUIS,PROFILE,DMX,PROJECTS system;
  class EWEB,EVIG,EPROD,EMARCO,PWEB,PTOOLS,PCV,DPUBLIC,DDASH,DSEQ,DADMIN,PTERR,PINV,PSTRAT,PBUILD module;`;
}

function architectureMermaid() {
  return `
flowchart LR
  subgraph SYS["SYSTEMS"]
    S1["EPISUIS"]
    S2["Perfil"]
    S3["DiseasesMapMx"]
    S4["Proyectos"]
  end
  subgraph ENGINE["ENGINE"]
    E1["Datos / Supabase"]
    E2["Git / GitHub"]
    E3["Fuentes canónicas"]
    E4["IA / automatización"]
    E5["Mermaid / QGIS / Python"]
  end
  subgraph FLOW["WORKFLOW"]
    F1["Capturar"] --> F2["Organizar"] --> F3["Analizar"] --> F4["Interpretar"] --> F5["Gestionar"] --> F6["Comunicar"]
  end
  subgraph OUT["OUTPUTS"]
    O1["Webs"]
    O2["Dashboards"]
    O3["Informes"]
    O4["Presentaciones"]
    O5["Publicaciones"]
    O6["Propuestas"]
  end
  SYS --> ENGINE --> FLOW --> OUT
  click S1 call openSystem("episuis")
  click S2 call openSystem("perfil")
  click S3 call openSystem("diseasesmapmx")
  click S4 call openSystem("proyectos")
  classDef block fill:#d9e6ce,color:#10140f,stroke:#10140f,stroke-width:2px;
  classDef flow fill:#f7faf4,color:#10140f,stroke:#5f7656,stroke-width:1.5px;
  class S1,S2,S3,S4,E1,E2,E3,E4,E5,O1,O2,O3,O4,O5,O6 block;
  class F1,F2,F3,F4,F5,F6 flow;`;
}

async function renderMermaidMap(target, type = "ecosystem", attempts = 0) {
  if (!window.mermaid) {
    target.innerHTML = `<p>Loading diagram engine <span class="blink">█</span></p>`;
    if (attempts < 40) setTimeout(() => renderMermaidMap(target, type, attempts + 1), 150);
    return;
  }
  target.innerHTML = `<div class="mermaid">${type === "architecture" ? architectureMermaid() : ecosystemMermaid()}</div>`;
  await window.mermaid.run({ nodes: [$(".mermaid", target)] });
}

function openSystemMap() {
  createWindow({
    id: "system-map",
    title: "System Map",
    icon: "◇",
    width: 920,
    height: 640,
    html: `
      <div class="map-shell">
        <div class="map-toolbar">
          <button class="retro-button primary" data-map="ecosystem">ECOSYSTEM</button>
          <button class="retro-button" data-map="architecture">ARCHITECTURE</button>
          <span>Click a system node to open it.</span>
        </div>
        <div class="map-canvas"></div>
      </div>`,
    onMount: win => {
      const canvas = $(".map-canvas", win);
      renderMermaidMap(canvas, "ecosystem");
      $$("[data-map]", win).forEach(btn => {
        btn.addEventListener("click", () => {
          $$("[data-map]", win).forEach(x => x.classList.toggle("primary", x === btn));
          renderMermaidMap(canvas, btn.dataset.map);
        });
      });
    }
  });
}

function openToolbox() {
  const cards = state.tools.map(tool => {
    const url = safeUrl(tool.url);
    return `
      <article class="tool-tile">
        <div class="tool-meta">${tool.category} · ${statusLabel(tool.status)}</div>
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
        ${url ? `<a class="retro-button" href="${url}" target="_blank" rel="noopener">OPEN ↗</a>` : `<span class="chip">POR CONECTAR</span>`}
      </article>`;
  }).join("");

  createWindow({ id: "toolbox", title: "Toolbox", icon: "◆", width: 780, height: 560, html: `<div class="toolbox-grid">${cards}</div>` });
}

function openSystem(id) {
  const system = state.systems.find(s => s.id === id);
  if (!system) return;
  const links = (system.links || []).map(link => {
    const url = safeUrl(link.url);
    return url ? `<a class="retro-button primary" href="${url}" target="_blank" rel="noopener">${link.label} ↗</a>` : `<span class="chip">${link.label}: POR CONECTAR</span>`;
  }).join("");

  const html = `
    <div class="system-detail">
      <span class="system-code">${statusLabel(system.status)} / ${system.code}</span>
      <h2>${system.name}</h2>
      <p>${system.description}</p>
      <div class="module-grid">
        ${(system.modules || []).map(module => `<article class="module-card"><strong>${module.name}</strong><small>${module.description || ""}</small></article>`).join("")}
      </div>
      <div class="link-row">${links || `<span class="chip">SIN ENLACES PÚBLICOS</span>`}</div>
    </div>`;

  createWindow({ id: `system-${system.id}`, title: system.name, icon: systemIcon(system.id), width: 720, height: 520, html });
}
window.openSystem = openSystem;

function openAbout() {
  createWindow({
    id: "about",
    title: "About ALJOGABA OS",
    icon: "ⓘ",
    width: 610,
    height: 440,
    html: `
      <div class="about-wrap">
        <span class="about-badge">ALJOGABA OS · v0.2</span>
        <h2>Research Workstation</h2>
        <p>Un portal de navegación para ubicar proyectos, plataformas, herramientas, flujos de trabajo y recursos de conocimiento dentro de un mismo ecosistema científico.</p>
        <p><strong>Principio:</strong> la workstation no sustituye a los sistemas. Los conecta y ayuda a decidir por dónde entrar.</p>
        <div class="flow-strip"><span>SISTEMAS</span><b>→</b><span>RUTAS</span><b>→</b><span>HERRAMIENTAS</span><b>→</b><span>PRODUCTOS</span></div>
        <p><small>Este sitio es público. Los accesos privados pueden representarse sin exponer credenciales, tokens ni rutas sensibles.</small></p>
      </div>`
  });
}

function launch(type, payload = null) {
  closeStartMenu();
  if (type === "mission") return openMissionControl();
  if (type === "map") return openSystemMap();
  if (type === "toolbox") return openToolbox();
  if (type === "about") return openAbout();
  if (type === "welcome") return openWelcome();
  if (type === "system" && payload) return openSystem(payload);
}

function toggleStartMenu() {
  const menu = $("#startMenu");
  const button = $("#startButton");
  const opening = menu.classList.contains("is-hidden");
  menu.classList.toggle("is-hidden", !opening);
  button.classList.toggle("active", opening);
  button.setAttribute("aria-expanded", opening ? "true" : "false");
}

function closeStartMenu() {
  $("#startMenu").classList.add("is-hidden");
  $("#startButton").classList.remove("active");
  $("#startButton").setAttribute("aria-expanded", "false");
}

function setupClock() {
  const update = () => {
    const now = new Date();
    const time = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(now);
    const date = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(now).toUpperCase();
    $("#topClock").textContent = time;
    $("#trayClock").textContent = time;
    $("#trayDate").textContent = date;
  };
  update();
  setInterval(update, 1000);
}

function enterWorkstation() {
  $("#boot").classList.add("is-hidden");
  $("#os").classList.remove("is-hidden");
  if (!state.windows.size) openWelcome();
}

function setupInteractions() {
  $("#startButton").addEventListener("click", event => {
    event.stopPropagation();
    toggleStartMenu();
  });

  document.addEventListener("click", event => {
    const launcher = event.target.closest("[data-launch]");
    if (launcher && !launcher.classList.contains("desktop-icon")) {
      launch(launcher.dataset.launch, launcher.dataset.payload || null);
      return;
    }
    if (!event.target.closest("#startMenu") && !event.target.closest("#startButton")) closeStartMenu();
    if (event.target.id === "desktop" || event.target.classList.contains("desktop-grid")) {
      $$(".desktop-icon").forEach(x => x.classList.remove("selected"));
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeStartMenu();
  });
}

async function init() {
  try {
    [state.systems, state.missions, state.tools] = await Promise.all([
      loadJSON("data/systems.json"),
      loadJSON("data/missions.json"),
      loadJSON("data/tools.json")
    ]);

    renderDesktopIcons();
    renderStartSystems();
    setupInteractions();
    setupClock();

    $("#skipBoot").addEventListener("click", enterWorkstation);
    setTimeout(enterWorkstation, 1700);
  } catch (error) {
    console.error(error);
    $("#boot .boot-terminal").innerHTML += `<p style="color:#ffb3b3">ERROR: ${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
