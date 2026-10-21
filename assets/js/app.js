const state = {
  systems: [],
  missions: [],
  tools: [],
  meta: {},
  windows: new Map(),
  z: 200,
  cascade: 0,
  selectedIcon: null,
  mapZoom: 1
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

function safeUrl(url) {
  return url && /^https:\/\//i.test(url) ? url : null;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusLabel(status) {
  return ({
    public: "PUBLIC",
    private: "PRIVATE",
    internal: "INTERNAL",
    hybrid: "PUBLIC / PRIVATE",
    development: "DEV",
    planned: "PLANNED"
  })[status] || "SYSTEM";
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
    { id: "identity", label: "Identity Matrix", icon: "⌘", type: "identity" },
    { id: "engine", label: "Engine Room", icon: "⚙", type: "engine" },
    { id: "outputs", label: "Output Bay", icon: "▤", type: "outputs" },
    { id: "sidequests", label: "Side Quests", icon: "✦", type: "sidequests" },
    { id: "about", label: "About", icon: "ⓘ", type: "about" }
  ];
}

function renderDesktopIcons() {
  const container = $("#desktopIcons");
  if (!container) return;
  container.innerHTML = desktopItems().map(item => `
    <button class="desktop-icon" data-icon-id="${item.id}" data-launch="${item.type}" ${item.payload ? `data-payload="${item.payload}"` : ""} aria-label="Abrir ${escapeHtml(item.label)}">
      <span class="pixel-icon">${item.icon}</span>
      <span class="desktop-icon-label">${escapeHtml(item.label)}</span>
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
  const target = $("#startSystems");
  if (!target) return;
  target.innerHTML = state.systems.map(system => `
    <button data-launch="system" data-payload="${system.id}">${systemIcon(system.id)} ${escapeHtml(system.name)}</button>
  `).join("");
}

function layerSize() {
  const layer = $("#windowLayer");
  return {
    width: layer?.clientWidth || window.innerWidth,
    height: layer?.clientHeight || Math.max(400, window.innerHeight - 90)
  };
}

function windowPosition() {
  const { width, height } = layerSize();
  const step = state.cascade++ % 7;
  return {
    left: Math.min(Math.max(18, 132 + step * 24), Math.max(18, width - 440)),
    top: Math.min(Math.max(22, 38 + step * 18), Math.max(22, height - 300))
  };
}

function fitWindow(win, requestedWidth, requestedHeight) {
  const { width: layerWidth, height: layerHeight } = layerSize();
  const margin = window.innerWidth <= 820 ? 12 : 28;
  const width = Math.min(requestedWidth, Math.max(300, layerWidth - margin * 2));
  const height = Math.min(requestedHeight, Math.max(250, layerHeight - margin * 2));
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;

  const left = Math.min(parseFloat(win.style.left) || margin, Math.max(margin, layerWidth - width - margin));
  const top = Math.min(parseFloat(win.style.top) || margin, Math.max(margin, layerHeight - height - margin));
  win.style.left = `${Math.max(margin, left)}px`;
  win.style.top = `${Math.max(margin, top)}px`;
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
    const maxTop = Math.max(0, layer.height - Math.min(42, rect.height));
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
  btn.innerHTML = `${icon} ${escapeHtml(title)}`;
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
  $("#taskButtons")?.appendChild(btn);
}

function closeWindow(id) {
  const win = state.windows.get(id);
  if (!win) return;
  win.remove();
  state.windows.delete(id);
  $(`.task-button[data-window-id="${id}"]`)?.remove();
  const remaining = [...state.windows.values()].filter(x => !x.classList.contains("minimized"));
  if (remaining.length) bringToFront(remaining[remaining.length - 1]);
}

function closeAllWindows() {
  [...state.windows.keys()].forEach(closeWindow);
  state.cascade = 0;
}

function createWindow({ id, title, icon = "□", html, width = 760, height = 540, onMount }) {
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
  win.dataset.requestedWidth = width;
  win.dataset.requestedHeight = height;
  win.style.left = `${pos.left}px`;
  win.style.top = `${pos.top}px`;
  win.innerHTML = `
    <header class="window-titlebar">
      <div class="window-title"><span>${icon}</span><span>${escapeHtml(title)}</span></div>
      <div class="window-controls">
        <button class="window-control" data-action="minimize" aria-label="Minimizar">_</button>
        <button class="window-control" data-action="maximize" aria-label="Maximizar">□</button>
        <button class="window-control" data-action="close" aria-label="Cerrar">×</button>
      </div>
    </header>
    <div class="window-body">${html}</div>
  `;

  $("#windowLayer").appendChild(win);
  fitWindow(win, width, height);
  state.windows.set(id, win);
  addTaskButton(id, title, icon);
  bringToFront(win);
  makeDraggable(win);

  win.addEventListener("pointerdown", () => bringToFront(win));
  $("[data-action='close']", win).addEventListener("click", () => closeWindow(id));
  $("[data-action='minimize']", win).addEventListener("click", () => {
    win.classList.add("minimized");
    $(`.task-button[data-window-id="${id}"]`)?.classList.remove("active");
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

function modulesCount() {
  return state.systems.reduce((sum, system) => sum + (system.modules?.length || 0), 0);
}

function welcomeHtml() {
  return `
    <div class="welcome-wrap command-welcome">
      <section>
        <p class="eyebrow">COMMAND DECK / HOME</p>
        <h1>¿Qué quieres hacer hoy?</h1>
        <p class="command-copy">Selecciona una misión o abre un sistema. <strong>ALJOGABA OS</strong> trazará la ruta.</p>
        <div class="quick-actions">
          <button class="retro-button primary" data-launch="mission">▶ SELECT MISSION</button>
          <button class="retro-button" data-launch="map">◇ SYSTEM MAP</button>
          <button class="retro-button" data-launch="identity">⌘ IDENTITY MATRIX</button>
        </div>
        <div class="telemetry-flow" aria-label="Flujo operativo">
          ${["CAPTURAR","ORGANIZAR","ANALIZAR","INTERPRETAR","GESTIONAR","COMUNICAR"].map((x, i) => `<span><i></i>${x}</span>${i < 5 ? `<b></b>` : ""}`).join("")}
        </div>
      </section>
      <aside class="stats-grid">
        <button class="stat-box" data-launch="map"><strong>${state.systems.length}</strong><span>SYSTEMS</span></button>
        <button class="stat-box" data-launch="map" data-payload="architecture"><strong>${modulesCount()}</strong><span>MODULES</span></button>
        <button class="stat-box" data-launch="toolbox"><strong>${state.tools.length}</strong><span>TOOLS</span></button>
        <button class="stat-box" data-launch="mission"><strong>${state.missions.length}</strong><span>MISSION ROUTES</span></button>
      </aside>
    </div>
  `;
}

function openWelcome() {
  createWindow({ id: "welcome", title: "Welcome to ALJOGABA OS", icon: "A>", html: welcomeHtml(), width: 790, height: 450 });
}
window.openWelcome = openWelcome;

function missionCategories() {
  return [...new Set(state.missions.map(m => m.category))];
}

function missionHtml() {
  const groups = missionCategories().map(category => `
    <div class="mission-group">
      <p class="mission-category">${escapeHtml(category)}</p>
      ${state.missions.filter(m => m.category === category).map(m => `<button class="mission-button" data-mission="${m.id}">${escapeHtml(m.name)}</button>`).join("")}
    </div>`).join("");
  return `
    <div class="mission-layout">
      <nav class="mission-list" aria-label="Misiones">${groups}</nav>
      <section class="mission-detail"></section>
    </div>`;
}

function renderMissionDetail(win, id) {
  const mission = state.missions.find(m => m.id === id);
  if (!mission) return;
  const system = state.systems.find(s => s.id === mission.primarySystem);
  const tool = state.tools.find(t => t.id === mission.primaryTool);
  const detail = $(".mission-detail", win);
  detail.innerHTML = `
    <p class="terminal-prompt">&gt; MISSION LOADED / ${escapeHtml(mission.category).toUpperCase()}</p>
    <h2>${escapeHtml(mission.name)}</h2>
    <p>${escapeHtml(mission.description)}</p>
    <div class="route">
      ${mission.route.map((step, idx) => `<span class="route-step">${escapeHtml(step)}</span>${idx < mission.route.length - 1 ? `<span class="route-arrow">→</span>` : ""}`).join("")}
    </div>
    <div class="mission-entry">
      <span class="eyebrow">RECOMMENDED ENTRY</span>
      <strong>${tool ? escapeHtml(tool.name) : system ? escapeHtml(system.name) : "TRANSVERSAL / DEFINE SOURCE SYSTEM"}</strong>
    </div>
    <div class="link-row">
      ${tool && safeUrl(tool.url) ? `<a class="retro-button primary" href="${tool.url}" target="_blank" rel="noopener">OPEN ${escapeHtml(tool.name).toUpperCase()} ↗</a>` : ""}
      ${system ? `<button class="retro-button ${tool ? "" : "primary"}" data-launch="system" data-payload="${system.id}">OPEN ${escapeHtml(system.name).toUpperCase()}</button>` : `<button class="retro-button primary" data-launch="map">CHOOSE SOURCE SYSTEM</button>`}
    </div>`;
}

function openMissionControl() {
  createWindow({
    id: "mission-control",
    title: "Mission Control",
    icon: "▶",
    html: missionHtml(),
    width: 900,
    height: 590,
    onMount: win => {
      const first = state.missions[0];
      const firstButton = $(".mission-button", win);
      if (first && firstButton) {
        firstButton.classList.add("active");
        renderMissionDetail(win, first.id);
      }
      $$(".mission-button", win).forEach(btn => {
        btn.addEventListener("click", () => {
          $$(".mission-button", win).forEach(x => x.classList.toggle("active", x === btn));
          renderMissionDetail(win, btn.dataset.mission);
        });
      });
    }
  });
}

function radarHtml() {
  const positions = ["north", "east", "south", "west"];
  return `
    <div class="radar-field">
      <div class="radar-sweep" aria-hidden="true"></div>
      <div class="radar-core"><small>COMMAND NODE</small><strong>ALJOGABA OS</strong><span>${state.systems.length} SYSTEMS / ${modulesCount()} MODULES</span></div>
      ${state.systems.map((system, i) => `
        <button class="radar-contact ${positions[i % positions.length]}" data-launch="system" data-payload="${system.id}">
          <span class="radar-ping"></span>
          <strong>${escapeHtml(system.name)}</strong>
          <small>${system.modules.length} MODULES</small>
        </button>`).join("")}
      <span class="radar-axis axis-x"></span><span class="radar-axis axis-y"></span>
    </div>`;
}

function mermaidEscape(text) {
  return String(text).replaceAll('"', "'");
}

function architectureMermaid() {
  const lines = ["flowchart LR", "  CORE[\"ALJOGABA OS\"]"];
  state.systems.forEach((system, sIndex) => {
    const sid = `S${sIndex}`;
    lines.push(`  ${sid}[\"${mermaidEscape(system.name)}\"]`);
    lines.push(`  CORE --> ${sid}`);
    system.modules.forEach((module, mIndex) => {
      const mid = `${sid}M${mIndex}`;
      lines.push(`  ${mid}[\"${mermaidEscape(module.name)}\"]`);
      lines.push(`  ${sid} --> ${mid}`);
    });
    lines.push(`  click ${sid} call openSystem(\"${system.id}\")`);
  });
  lines.push("  classDef core fill:#12091d,color:#ffffff,stroke:#ff3fb4,stroke-width:3px;");
  lines.push("  classDef system fill:#101b2a,color:#eefcff,stroke:#33e6ff,stroke-width:2px;");
  lines.push("  classDef module fill:#171023,color:#eee9f7,stroke:#8b5cf6,stroke-width:1.5px;");
  lines.push("  class CORE core;");
  lines.push(`  class ${state.systems.map((_, i) => `S${i}`).join(",")} system;`);
  const moduleIds = state.systems.flatMap((system, i) => system.modules.map((_, j) => `S${i}M${j}`));
  lines.push(`  class ${moduleIds.join(",")} module;`);
  return lines.join("\n");
}

async function renderArchitecture(target, attempts = 0) {
  if (!window.mermaid) {
    target.innerHTML = `<p class="map-loading">Loading diagram engine <span class="blink">█</span></p>`;
    if (attempts < 50) setTimeout(() => renderArchitecture(target, attempts + 1), 120);
    return;
  }
  target.innerHTML = `<div class="mermaid-stage"><div class="mermaid">${architectureMermaid()}</div></div>`;
  const node = $(".mermaid", target);
  await window.mermaid.run({ nodes: [node] });
  const stage = $(".mermaid-stage", target);
  if (stage) stage.style.zoom = state.mapZoom;
}

function renderSystemMap(win, mode) {
  const canvas = $(".map-canvas", win);
  if (!canvas) return;
  canvas.dataset.mode = mode;
  if (mode === "architecture") renderArchitecture(canvas);
  else canvas.innerHTML = radarHtml();
  $$("[data-map]", win).forEach(btn => btn.classList.toggle("primary", btn.dataset.map === mode));
}

function openSystemMap(initialMode = "radar") {
  const mode = initialMode === "architecture" ? "architecture" : "radar";
  createWindow({
    id: "system-map",
    title: "System Map / Long Range Scanner",
    icon: "◇",
    width: 1040,
    height: 660,
    html: `
      <div class="map-shell">
        <div class="map-toolbar">
          <button class="retro-button" data-map="radar">ECOSYSTEM RADAR</button>
          <button class="retro-button" data-map="architecture">ARCHITECTURE</button>
          <span class="map-hint">Scroll / zoom when needed. Contacts are interactive.</span>
          <div class="map-zoom"><button class="retro-button compact" data-map-zoom="out">−</button><span data-zoom-label>100%</span><button class="retro-button compact" data-map-zoom="in">+</button></div>
        </div>
        <div class="map-canvas"></div>
      </div>`,
    onMount: win => {
      renderSystemMap(win, mode);
      $$("[data-map]", win).forEach(btn => btn.addEventListener("click", () => renderSystemMap(win, btn.dataset.map)));
      $$("[data-map-zoom]", win).forEach(btn => btn.addEventListener("click", () => {
        const delta = btn.dataset.mapZoom === "in" ? .1 : -.1;
        state.mapZoom = Math.min(1.6, Math.max(.7, Math.round((state.mapZoom + delta) * 10) / 10));
        const stage = $(".mermaid-stage", win);
        if (stage) stage.style.zoom = state.mapZoom;
        const label = $("[data-zoom-label]", win);
        if (label) label.textContent = `${Math.round(state.mapZoom * 100)}%`;
      }));
    }
  });
}

function openToolbox() {
  const cards = state.tools.map(tool => {
    const url = safeUrl(tool.url);
    return `
      <article class="tool-tile">
        <div class="tool-meta">${escapeHtml(tool.category)} · ${statusLabel(tool.status)}</div>
        <h3>${escapeHtml(tool.name)}</h3>
        <small>${escapeHtml(tool.fullName || "")}</small>
        <p>${escapeHtml(tool.description)}</p>
        ${url ? `<a class="retro-button primary" href="${url}" target="_blank" rel="noopener">OPEN TOOL ↗</a>` : `<span class="chip">NO PUBLIC ENTRY</span>`}
      </article>`;
  }).join("");

  createWindow({
    id: "toolbox",
    title: "Toolbox",
    icon: "◆",
    width: 820,
    height: 550,
    html: `
      <div class="toolbox-wrap">
        <p class="eyebrow">SCIENTIFIC TOOLS / COUNTED: ${state.tools.length}</p>
        <div class="toolbox-grid">${cards}</div>
        <section class="infra-shortcuts">
          <p class="eyebrow">INFRA SHORTCUTS / NOT COUNTED AS TOOLS</p>
          <a class="retro-button" href="https://github.com/aljogaba" target="_blank" rel="noopener">GITHUB / ALJOGABA ↗</a>
          <a class="retro-button" href="https://github.com/aljogaba-academico" target="_blank" rel="noopener">GITHUB / ACADEMIC ↗</a>
        </section>
      </div>`
  });
}

function openSystem(id) {
  const system = state.systems.find(s => s.id === id);
  if (!system) return;
  const links = (system.links || []).map(link => {
    const url = safeUrl(link.url);
    return url ? `<a class="retro-button primary" href="${url}" target="_blank" rel="noopener">${escapeHtml(link.label)} ↗</a>` : "";
  }).join("");

  const extra = system.id === "proyectos"
    ? `<button class="retro-button" data-launch="ops">LOCAL OPS</button>`
    : `<button class="retro-button" data-launch="identity" data-payload="${system.id}">INFRASTRUCTURE MAP</button>`;

  const html = `
    <div class="system-detail">
      <div class="system-detail-head">
        <span class="system-code">${statusLabel(system.status)} / ${escapeHtml(system.code)}</span>
        ${system.critical ? `<span class="critical-badge">CRITICAL SYSTEM</span>` : ""}
      </div>
      <h2>${escapeHtml(system.name)}</h2>
      <p>${escapeHtml(system.description)}</p>
      <div class="module-grid">
        ${(system.modules || []).map(module => `<article class="module-card"><strong>${escapeHtml(module.name)}</strong><small>${escapeHtml(module.description || "")}</small></article>`).join("")}
      </div>
      <div class="link-row">${links}${extra}</div>
    </div>`;

  createWindow({ id: `system-${system.id}`, title: system.name, icon: systemIcon(system.id), width: 720, height: 500, html });
}
window.openSystem = openSystem;

function openEngineRoom() {
  const groups = (state.meta.technologies || []).map(group => `
    <section class="engine-sector">
      <span class="engine-sector-label">${escapeHtml(group.group)}</span>
      <div class="tech-cloud">${group.items.map(item => `<span class="tech-node">${escapeHtml(item)}</span>`).join("")}</div>
    </section>`).join("");
  createWindow({
    id: "engine-room",
    title: "Engine Room / Tech Core",
    icon: "⚙",
    width: 900,
    height: 570,
    html: `<div class="engine-room"><div class="reactor-core"><span>TECH CORE</span><strong>ONLINE</strong></div>${groups}<p class="engine-note">Estas tecnologías sostienen los sistemas; no son accesos directos ni se contabilizan como Tools.</p></div>`
  });
}

function openOutputBay() {
  const groups = (state.meta.outputs || []).map(group => `
    <article class="output-sector"><h3>${escapeHtml(group.group)}</h3><div>${group.items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></article>`).join("");
  createWindow({
    id: "output-bay",
    title: "Output Bay",
    icon: "▤",
    width: 820,
    height: 540,
    html: `<div class="output-bay"><p class="eyebrow">DERIVED PRODUCTS / CANONICAL SOURCES REMAIN IN THEIR SYSTEMS</p><div class="output-grid">${groups}</div></div>`
  });
}

function identityChain(chain) {
  return `<div class="identity-chain">${chain.map((node, idx) => `<span class="identity-node">${escapeHtml(node)}</span>${idx < chain.length - 1 ? `<b>→</b>` : ""}`).join("")}</div>`;
}

function identityHtml(filter = null) {
  const infra = state.meta.infrastructure || {};
  const maps = (infra.maps || []).filter(map => !filter || map.system === filter);
  const identities = (infra.identities || []).map(item => `<span class="identity-chip"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.detail)}</small></span>`).join("");
  const registry = (infra.accessRegistry || []).map(item => `<article class="registry-card"><strong>${escapeHtml(item.provider)}</strong><span>${item.accounts.map(escapeHtml).join(" · ")}</span><small>${escapeHtml(item.note)}</small></article>`).join("");
  return `
    <div class="identity-matrix">
      <section class="identity-header">
        <div><p class="eyebrow">IDENTITY MATRIX / PUBLIC-SAFE REGISTRY</p><h2>¿Dónde vive cada cosa y con qué identidad entro?</h2></div>
        <p>No almacena contraseñas, tokens, API keys ni códigos MFA.</p>
      </section>
      <div class="identity-chips">${identities}</div>
      <div class="registry-grid">${registry}</div>
      <div class="infra-map-stack">
        ${maps.map(map => `<article class="infra-map ${map.critical ? "critical" : ""}"><header><strong>${escapeHtml(map.title)}</strong>${map.critical ? `<span>CRITICAL</span>` : ""}</header>${map.chains.map(identityChain).join("")}<p>${escapeHtml(map.note || "")}</p></article>`).join("")}
      </div>
    </div>`;
}

function openIdentityMatrix(filter = null) {
  const system = state.systems.find(s => s.id === filter);
  createWindow({
    id: filter ? `identity-${filter}` : "identity-matrix",
    title: system ? `Identity Matrix / ${system.name}` : "Identity Matrix",
    icon: "⌘",
    width: 1040,
    height: 650,
    html: identityHtml(filter)
  });
}

function openLocalOps() {
  const cards = (state.meta.operations || []).map((op, idx) => `
    <article class="ops-card">
      <span class="tool-meta">${escapeHtml(op.system)}</span>
      <h3>${escapeHtml(op.label)}</h3>
      <div class="command-line"><code>${escapeHtml(op.command)}</code><button class="retro-button compact" data-copy="${idx}">COPY</button></div>
      <p>${escapeHtml(op.note)}</p>
    </article>`).join("");
  createWindow({
    id: "local-ops",
    title: "Local Ops / Restricted Operations",
    icon: ">_",
    width: 780,
    height: 520,
    html: `<div class="local-ops"><p class="ops-warning">LOCAL TERMINAL // SAFE COMMANDS ONLY // NO CREDENTIALS STORED</p><div class="ops-grid">${cards}</div><p class="ops-footnote">Direcciones internas, secretos y credenciales permanecen fuera de ALJOGABA OS.</p></div>`
  });
}

function openSideQuests() {
  const quests = (state.meta.sidequests || []).map(item => `
    <article class="quest-card ${item.id}">
      <span class="quest-status">${escapeHtml(item.status)}</span>
      <h2>${escapeHtml(item.name)}</h2>
      <p>${escapeHtml(item.subtitle)}</p>
      <div class="link-row">
        ${safeUrl(item.url) ? `<a class="retro-button primary" href="${item.url}" target="_blank" rel="noopener">OPEN QUEST ↗</a>` : ""}
        ${safeUrl(item.repo) ? `<a class="retro-button" href="${item.repo}" target="_blank" rel="noopener">REPOSITORY ↗</a>` : ""}
      </div>
    </article>`).join("");
  createWindow({
    id: "side-quests",
    title: "Auxiliary Sector / Side Quests",
    icon: "✦",
    width: 760,
    height: 500,
    html: `<div class="side-quests"><p class="quest-alert">NON-SCIENTIFIC ACTIVITY DETECTED ... PROBABLY HEALTHY.</p><p class="quest-sub">Crew morale protocols activated.</p><div class="quest-grid">${quests}</div></div>`
  });
}

function openAbout() {
  createWindow({
    id: "about",
    title: "About ALJOGABA OS",
    icon: "ⓘ",
    width: 640,
    height: 440,
    html: `
      <div class="about-wrap">
        <span class="about-badge">ALJOGABA OS · v0.4</span>
        <h2>Research Workstation</h2>
        <p>Estación de mando para ubicar sistemas, misiones, herramientas, infraestructura, tecnologías y salidas dentro del ecosistema científico.</p>
        <p><strong>Principio:</strong> la workstation no reemplaza las fuentes canónicas. Indica dónde están, cómo se relacionan y por dónde entrar.</p>
        <div class="telemetry-flow compact-flow">${["SYSTEMS","MISSIONS","TOOLS","INFRA","OUTPUTS"].map((x, i) => `<span><i></i>${x}</span>${i < 4 ? `<b></b>` : ""}`).join("")}</div>
        <p><small>GitHub Pages es público. No se almacenan credenciales, tokens, API keys, contraseñas, MFA ni rutas administrativas sensibles.</small></p>
      </div>`
  });
}

function requestReboot() {
  createWindow({
    id: "reboot-confirm",
    title: "System Control",
    icon: "↻",
    width: 470,
    height: 280,
    html: `<div class="reboot-dialog"><p class="eyebrow">SYSTEM COMMAND</p><h2>Restart ALJOGABA OS?</h2><p>Open windows will be terminated and the full boot sequence will run again.</p><div class="link-row"><button class="retro-button primary" data-action="confirm-reboot">REBOOT SYSTEM</button><button class="retro-button" data-action="cancel-reboot">CANCEL</button></div></div>`
  });
}

function launch(type, payload = null) {
  closeStartMenu();
  if (type === "mission") return openMissionControl();
  if (type === "map") return openSystemMap(payload || "radar");
  if (type === "toolbox") return openToolbox();
  if (type === "engine") return openEngineRoom();
  if (type === "outputs") return openOutputBay();
  if (type === "identity") return openIdentityMatrix(payload);
  if (type === "ops") return openLocalOps();
  if (type === "sidequests") return openSideQuests();
  if (type === "about") return openAbout();
  if (type === "welcome") return openWelcome();
  if (type === "reboot") return requestReboot();
  if (type === "system" && payload) return openSystem(payload);
}

function toggleStartMenu() {
  const menu = $("#startMenu");
  const button = $("#startButton");
  const hidden = menu.classList.toggle("is-hidden");
  button.classList.toggle("active", !hidden);
  button.setAttribute("aria-expanded", String(!hidden));
}

function closeStartMenu() {
  $("#startMenu")?.classList.add("is-hidden");
  $("#startButton")?.classList.remove("active");
  $("#startButton")?.setAttribute("aria-expanded", "false");
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = now.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }).toUpperCase();
  if ($("#topClock")) $("#topClock").textContent = time;
  if ($("#trayClock")) $("#trayClock").textContent = time;
  if ($("#trayDate")) $("#trayDate").textContent = date;
}

function handleGlobalClick(event) {
  const launchEl = event.target.closest("[data-launch]");
  if (launchEl && !launchEl.closest(".desktop-icon")) {
    event.preventDefault();
    launch(launchEl.dataset.launch, launchEl.dataset.payload || null);
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "confirm-reboot") {
    closeAllWindows();
    window.rebootALJOGABAOS?.();
  } else if (action === "cancel-reboot") {
    closeWindow("reboot-confirm");
  }

  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    const op = state.meta.operations?.[Number(copyButton.dataset.copy)];
    if (!op) return;
    navigator.clipboard?.writeText(op.command).then(() => {
      const old = copyButton.textContent;
      copyButton.textContent = "COPIED";
      setTimeout(() => { copyButton.textContent = old; }, 1200);
    }).catch(() => {});
  }
}

function fitAllWindows() {
  state.windows.forEach(win => {
    if (win.classList.contains("maximized")) return;
    fitWindow(win, Number(win.dataset.requestedWidth) || 760, Number(win.dataset.requestedHeight) || 540);
  });
}

async function init() {
  try {
    [state.systems, state.missions, state.tools, state.meta] = await Promise.all([
      loadJSON("data/systems.json"),
      loadJSON("data/missions.json"),
      loadJSON("data/tools.json"),
      loadJSON("data/workstation.json")
    ]);
  } catch (error) {
    console.error(error);
    state.systems = [];
    state.missions = [];
    state.tools = [];
    state.meta = {};
  }

  renderDesktopIcons();
  renderStartSystems();
  updateClock();
  setInterval(updateClock, 15000);

  $("#startButton")?.addEventListener("click", event => {
    event.stopPropagation();
    toggleStartMenu();
  });

  $("#desktop")?.addEventListener("click", event => {
    if (!event.target.closest(".desktop-icon") && !event.target.closest(".os-window")) {
      $$(".desktop-icon").forEach(x => x.classList.remove("selected"));
      state.selectedIcon = null;
    }
    if (!event.target.closest("#startMenu") && !event.target.closest("#startButton")) closeStartMenu();
  });

  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("resize", fitAllWindows);

  if (!$("#os")?.classList.contains("is-hidden") && !state.windows.size) openWelcome();
}

window.closeAllWorkstationWindows = closeAllWindows;
window.addEventListener("DOMContentLoaded", init);
