
const state = { systems: [], missions: [], tools: [], currentMap: "ecosystem" };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}
function safeUrl(url){ return url && /^https?:\/\//i.test(url) ? url : null; }
function statusLabel(status){
  return ({public:"PUBLIC",private:"PRIVATE",internal:"INTERNAL",development:"DEV",planned:"PLANNED"})[status] || "SYSTEM";
}

function renderStats(){
  const modules = state.systems.reduce((n,s)=> n + (s.modules?.length || 0), 0);
  $("#stats").innerHTML = `
    <div class="stat"><strong>${state.systems.length}</strong><span>SYSTEMS</span></div>
    <div class="stat"><strong>${modules}</strong><span>MODULES</span></div>
    <div class="stat"><strong>${state.tools.length}</strong><span>TOOLS</span></div>
    <div class="stat"><strong>${state.missions.length}</strong><span>MISSIONS</span></div>`;
}

function renderSystems(){
  $("#systemGrid").innerHTML = state.systems.map(system => `
    <article class="system-card" tabindex="0" data-system="${system.id}">
      <span class="code">${statusLabel(system.status)} / ${system.code}</span>
      <h3>${system.name}</h3>
      <p>${system.description}</p>
      <div class="module-list">
        ${(system.modules || []).map(m => `<span class="module-chip">${m.name}</span>`).join("")}
      </div>
    </article>`).join("");

  $$(".system-card").forEach(card => {
    card.addEventListener("click", () => openSystem(card.dataset.system));
    card.addEventListener("keydown", e => {
      if(e.key === "Enter" || e.key === " ") openSystem(card.dataset.system);
    });
  });
}

function renderTools(){
  $("#toolGrid").innerHTML = state.tools.map(tool => {
    const url = safeUrl(tool.url);
    return `
      <article class="tool-card">
        <div class="tool-meta">${tool.category} · ${statusLabel(tool.status)}</div>
        <h4>${tool.name}</h4>
        <p>${tool.description}</p>
        ${url ? `<a class="primary-button" href="${url}" target="_blank" rel="noopener">OPEN ↗</a>` :
                `<span class="secondary-button">POR CONECTAR</span>`}
      </article>`;
  }).join("");
}

function renderMissions(){
  $("#missionList").innerHTML = state.missions.map((m, i) => `
    <button class="mission-button ${i===0 ? "active":""}" data-mission="${m.id}">${m.name}</button>
  `).join("");
  $$(".mission-button").forEach(btn => btn.addEventListener("click", () => selectMission(btn.dataset.mission)));
  if(state.missions[0]) selectMission(state.missions[0].id);
}

function selectMission(id){
  $$(".mission-button").forEach(b => b.classList.toggle("active", b.dataset.mission === id));
  const m = state.missions.find(x => x.id === id);
  if(!m) return;
  const primarySystem = state.systems.find(s => s.id === m.primarySystem);
  $("#missionDetail").innerHTML = `
    <p class="terminal-prompt">&gt; MISSION LOADED</p>
    <h2>${m.name}</h2>
    <p>${m.description}</p>
    <div class="route">
      ${m.route.map((step, idx) => `
        <span class="route-step">${step}</span>${idx < m.route.length-1 ? `<span class="route-arrow">→</span>` : ""}
      `).join("")}
    </div>
    <p><strong>Entrada recomendada:</strong> ${primarySystem ? primarySystem.name : "Ver ruta"}</p>
    <div class="action-row">
      ${primarySystem ? `<button class="primary-button" onclick="openSystem('${primarySystem.id}')">OPEN SYSTEM</button>` : ""}
      <button class="secondary-button" onclick="scrollToMap()">VIEW MAP</button>
    </div>`;
}

window.scrollToMap = () => $("#diagram").scrollIntoView({behavior:"smooth", block:"center"});

window.openSystem = function(id){
  const system = state.systems.find(s => s.id === id);
  if(!system) return;
  const links = (system.links || []).map(link => {
    const url = safeUrl(link.url);
    return url
      ? `<a class="primary-button" href="${url}" target="_blank" rel="noopener">${link.label} ↗</a>`
      : `<span class="secondary-button">${link.label}: POR CONECTAR</span>`;
  }).join("");

  $("#systemDialogContent").innerHTML = `
    <div class="dialog-content">
      <p class="eyebrow">${statusLabel(system.status)} / ${system.code}</p>
      <h2>${system.name}</h2>
      <p>${system.description}</p>
      <div class="dialog-modules">
        ${(system.modules || []).map(m => `
          <div class="dialog-module">
            <strong>${m.name}</strong>
            <div class="tool-meta">${m.description || ""}</div>
          </div>`).join("")}
      </div>
      <div class="link-row">${links || `<span class="secondary-button">SIN ENLACES PÚBLICOS</span>`}</div>
    </div>`;
  $("#systemDialog").showModal();
};

function ecosystemMermaid(){
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

function architectureMermaid(){
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

async function renderMap(type="ecosystem"){
  if(!window.mermaid){
    setTimeout(()=>renderMap(type),100);
    return;
  }
  state.currentMap = type;
  const diagram = $("#diagram");
  diagram.innerHTML = `<div class="mermaid">${type === "architecture" ? architectureMermaid() : ecosystemMermaid()}</div>`;
  await window.mermaid.run({nodes:[diagram.querySelector(".mermaid")]});
}

function setupMapButtons(){
  $$(".mini-button[data-map]").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".mini-button[data-map]").forEach(x => x.classList.toggle("active", x === btn));
      renderMap(btn.dataset.map);
    });
  });
}
function setupClock(){
  const update = () => {
    $("#clock").textContent = new Intl.DateTimeFormat("es-MX", {
      hour:"2-digit", minute:"2-digit", second:"2-digit"
    }).format(new Date());
  };
  update(); setInterval(update,1000);
}
function enterWorkstation(){
  $("#boot").classList.add("is-hidden");
  $("#app").classList.remove("is-hidden");
}

async function init(){
  try{
    [state.systems, state.missions, state.tools] = await Promise.all([
      loadJSON("data/systems.json"),
      loadJSON("data/missions.json"),
      loadJSON("data/tools.json")
    ]);
    renderStats();
    renderSystems();
    renderTools();
    renderMissions();
    setupMapButtons();
    setupClock();
    await renderMap("ecosystem");
    $("#skipBoot").addEventListener("click", enterWorkstation);
    setTimeout(enterWorkstation, 1900);
  }catch(error){
    console.error(error);
    $("#boot .boot-terminal").innerHTML += `<p style="color:#ffb3b3">ERROR: ${error.message}</p>`;
  }
}
document.addEventListener("DOMContentLoaded", init);
