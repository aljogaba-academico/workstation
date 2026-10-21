(() => {
  function missionMermaid(mission) {
    const lines = ["flowchart TD"];
    mission.route.forEach((step, index) => {
      lines.push(`  R${index}[\"${mermaidEscape(step)}\"]`);
      if (index > 0) lines.push(`  R${index - 1} --> R${index}`);
    });
    lines.push("  classDef start fill:#24102e,color:#ffffff,stroke:#ff3fb4,stroke-width:3px;");
    lines.push("  classDef step fill:#111827,color:#eefcff,stroke:#33e6ff,stroke-width:2px;");
    lines.push("  classDef finish fill:#2a1c09,color:#fff3cf,stroke:#ffbd3f,stroke-width:2px;");
    if (mission.route.length) {
      lines.push("  class R0 start;");
      if (mission.route.length > 2) lines.push(`  class ${mission.route.slice(1, -1).map((_, i) => `R${i + 1}`).join(",")} step;`);
      if (mission.route.length > 1) lines.push(`  class R${mission.route.length - 1} finish;`);
    }
    return lines.join("\n");
  }

  async function renderMissionMermaid(target, mission, attempts = 0) {
    if (!window.mermaid) {
      target.innerHTML = `<p class="map-loading">Loading route map <span class="blink">█</span></p>`;
      if (attempts < 50) setTimeout(() => renderMissionMermaid(target, mission, attempts + 1), 120);
      return;
    }
    target.innerHTML = `<div class="mission-mermaid-stage"><div class="mermaid">${missionMermaid(mission)}</div></div>`;
    await window.mermaid.run({ nodes: [$(".mermaid", target)] });
  }

  renderMissionDetail = function(win, id) {
    const mission = state.missions.find(m => m.id === id);
    if (!mission) return;
    const system = state.systems.find(s => s.id === mission.primarySystem);
    const tool = state.tools.find(t => t.id === mission.primaryTool);
    const detail = $(".mission-detail", win);
    detail.innerHTML = `
      <p class="terminal-prompt">&gt; MISSION LOADED / ${escapeHtml(mission.category).toUpperCase()}</p>
      <h2>${escapeHtml(mission.name)}</h2>
      <p>${escapeHtml(mission.description)}</p>
      <div class="mission-route-map" aria-label="Ruta de misión"></div>
      <div class="mission-entry">
        <span class="eyebrow">RECOMMENDED ENTRY</span>
        <strong>${tool ? escapeHtml(tool.name) : system ? escapeHtml(system.name) : "TRANSVERSAL / DEFINE SOURCE SYSTEM"}</strong>
      </div>
      <div class="link-row">
        ${tool && safeUrl(tool.url) ? `<a class="retro-button primary" href="${tool.url}" target="_blank" rel="noopener">OPEN ${escapeHtml(tool.name).toUpperCase()} ↗</a>` : ""}
        ${system ? `<button class="retro-button ${tool ? "" : "primary"}" data-launch="system" data-payload="${system.id}">OPEN ${escapeHtml(system.name).toUpperCase()}</button>` : `<button class="retro-button primary" data-launch="map">CHOOSE SOURCE SYSTEM</button>`}
      </div>`;
    renderMissionMermaid($(".mission-route-map", detail), mission);
  };

  function moduleItems(filter = null) {
    const items = state.meta.infrastructure?.moduleInfrastructure || [];
    return items.filter(item => !filter || item.system === filter);
  }

  function accountLabel(account = "") {
    if (!account) return "";
    const [identity, ...rest] = account.split(" · ");
    const access = rest.join(" · ");
    return `<br/><span class='node-account'>ACCOUNT: ${mermaidEscape(identity)}</span>${access ? `<br/><span class='node-access'>${mermaidEscape(access)}</span>` : ""}`;
  }

  function moduleMermaid(item) {
    const lines = ["flowchart TD"];
    (item.nodes || []).forEach(node => {
      lines.push(`  ${node.id}[\"${mermaidEscape(node.label)}${accountLabel(node.account)}\"]`);
    });
    (item.edges || []).forEach(([from, to, label]) => {
      lines.push(`  ${from} -->|${mermaidEscape(label || "")} | ${to}`);
    });
    lines.push("  classDef module fill:#24102e,color:#ffffff,stroke:#ff3fb4,stroke-width:3px;");
    lines.push("  classDef source fill:#161020,color:#eee9f7,stroke:#8b5cf6,stroke-width:2px;");
    lines.push("  classDef deploy fill:#08202a,color:#eefcff,stroke:#33e6ff,stroke-width:2px;");
    lines.push("  classDef backend fill:#2a1c09,color:#fff3cf,stroke:#ffbd3f,stroke-width:2px;");
    lines.push("  classDef domain fill:#0b241e,color:#e8fff7,stroke:#65f5a3,stroke-width:2px;");
    lines.push("  classDef service fill:#2a1024,color:#ffe5f5,stroke:#ff79c9,stroke-width:2px;");
    lines.push("  classDef data fill:#171b28,color:#eefcff,stroke:#91a7ff,stroke-width:2px;");
    const groups = {};
    (item.nodes || []).forEach(node => (groups[node.type || "source"] ||= []).push(node.id));
    Object.entries(groups).forEach(([type, ids]) => lines.push(`  class ${ids.join(",")} ${type};`));
    return lines.join("\n");
  }

  async function renderModuleMermaid(target, item, attempts = 0) {
    if (!window.mermaid) {
      target.innerHTML = `<p class="map-loading">Loading infrastructure map <span class="blink">█</span></p>`;
      if (attempts < 50) setTimeout(() => renderModuleMermaid(target, item, attempts + 1), 120);
      return;
    }
    target.innerHTML = `<div class="module-mermaid-stage"><div class="mermaid">${moduleMermaid(item)}</div></div>`;
    await window.mermaid.run({ nodes: [$(".mermaid", target)] });
  }

  function accessDirectoryHtml() {
    const registry = state.meta.infrastructure?.accessRegistry || [];
    return registry.map(provider => `
      <section class="access-provider">
        <h3>${escapeHtml(provider.provider)}</h3>
        ${(provider.entries || []).map(entry => `
          <article class="access-entry">
            <strong>${escapeHtml(entry.identity)}</strong>
            <code>${escapeHtml(entry.handle)}</code>
            <small>${escapeHtml(entry.resources || "")}</small>
          </article>`).join("")}
      </section>`).join("");
  }

  function moduleInfrastructureHtml(filter = null) {
    const items = moduleItems(filter);
    const groups = [...new Set(items.map(item => item.system))];
    const navigation = groups.map(systemId => {
      const system = state.systems.find(s => s.id === systemId);
      return `
        <section class="module-nav-group">
          <p>${escapeHtml(system?.name || systemId)}</p>
          ${items.filter(item => item.system === systemId).map(item => `<button class="module-nav-button" data-module-index="${items.indexOf(item)}">${escapeHtml(item.module)}</button>`).join("")}
        </section>`;
    }).join("");
    return `
      <div class="module-infrastructure-shell">
        <aside class="module-infrastructure-nav">
          <p class="eyebrow">MODULES</p>
          ${navigation}
          <details class="access-directory">
            <summary>ACCESS DIRECTORY</summary>
            <p class="access-directory-note">Identidad conceptual en mayúsculas; handle técnico en minúsculas.</p>
            ${accessDirectoryHtml()}
          </details>
        </aside>
        <section class="module-infrastructure-detail"></section>
      </div>`;
  }

  function renderModuleDetail(win, index) {
    const filter = win.dataset.infrastructureFilter || null;
    const items = moduleItems(filter);
    const item = items[index] || items[0];
    if (!item) return;
    const system = state.systems.find(s => s.id === item.system);
    const detail = $(".module-infrastructure-detail", win);
    $$(".module-nav-button", win).forEach((button, i) => button.classList.toggle("active", i === index));
    detail.innerHTML = `
      <div class="module-detail-head">
        <p class="eyebrow">${escapeHtml(system?.name || item.system)} / MODULE INFRASTRUCTURE</p>
        <h2>${escapeHtml(item.module)}</h2>
        <p>${escapeHtml(item.summary || "")}</p>
      </div>
      <div class="module-infrastructure-map"></div>
      ${item.note ? `<p class="module-infrastructure-note">${escapeHtml(item.note)}</p>` : ""}`;
    renderModuleMermaid($(".module-infrastructure-map", detail), item);
  }

  openIdentityMatrix = function(filter = null) {
    const system = state.systems.find(s => s.id === filter);
    createWindow({
      id: filter ? `identity-${filter}` : "identity-matrix",
      title: system ? `Module Infrastructure / ${system.name}` : "Module Infrastructure",
      icon: "⌘",
      width: 1040,
      height: 650,
      html: moduleInfrastructureHtml(filter),
      onMount: win => {
        win.dataset.infrastructureFilter = filter || "";
        renderModuleDetail(win, 0);
        $$(".module-nav-button", win).forEach(button => button.addEventListener("click", () => {
          renderModuleDetail(win, Number(button.dataset.moduleIndex));
        }));
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const startIdentity = document.querySelector('#startMenu [data-launch="identity"]');
    if (startIdentity) startIdentity.innerHTML = "⌘ Module Infrastructure";
    const desktopIdentity = document.querySelector('[data-icon-id="identity"] .desktop-icon-label');
    if (desktopIdentity) desktopIdentity.textContent = "Module Infrastructure";
  });
})();
