(() => {
  let professionalEcosystem = null;
  let ecosystemZoom = 1;
  const ecosystemReady = fetch("data/professional-ecosystem.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error(`Professional ecosystem registry ${response.status}`);
      return response.json();
    })
    .then(data => (professionalEcosystem = data))
    .catch(error => {
      console.warn("Professional ecosystem registry unavailable.", error);
      professionalEcosystem = { identities: [], nodes: [], edges: [], scope: "" };
      return professionalEcosystem;
    });

  const esc = value => escapeHtml(String(value ?? ""));
  const safeLink = value => /^https:\/\//i.test(value || "") ? value : "";
  const mermaidId = value => `n_${String(value || "node").replace(/[^A-Za-z0-9_]/g, "_")}`;

  function identityById(id) {
    return (professionalEcosystem?.identities || []).find(item => item.id === id);
  }

  function nodesFor(root) {
    const nodes = professionalEcosystem?.nodes || [];
    return root === "overview" ? nodes.filter(node => node.kind === "identity") : nodes.filter(node => node.root === root);
  }

  function edgesFor(root, nodes) {
    const ids = new Set(nodes.map(node => node.id));
    return (professionalEcosystem?.edges || []).filter(([from, to]) => ids.has(from) && ids.has(to));
  }

  function ecosystemMermaid(root) {
    if (root === "overview") {
      const lines = ["flowchart LR"];
      (professionalEcosystem?.identities || []).forEach(identity => {
        const emailText = (identity.emails || []).join(" · ");
        lines.push(`  ${mermaidId(identity.id)}[\"${mermaidEscape(identity.label)}<br/><span class='node-access'>${mermaidEscape(identity.subtitle)}<br/>${mermaidEscape(emailText)}</span>\"]`);
      });
      lines.push(`  ${mermaidId("aljogaba")} --- ${mermaidId("academic")}`);
      lines.push(`  ${mermaidId("aljogaba")} --- ${mermaidId("episuis")}`);
      lines.push("  classDef identity fill:#24102e,color:#ffffff,stroke:#ff3fb4,stroke-width:3px;");
      lines.push(`  class ${["aljogaba", "academic", "episuis"].map(mermaidId).join(",")} identity;`);
      return lines.join("\n");
    }

    const nodes = nodesFor(root);
    const edges = edgesFor(root, nodes);
    const lines = ["flowchart TD"];
    nodes.forEach(node => {
      lines.push(`  ${mermaidId(node.id)}[\"${mermaidEscape(node.label)}<br/><span class='node-access'>${mermaidEscape(node.detail || "")}</span>\"]`);
    });
    edges.forEach(([from, to, label]) => {
      const fromId = mermaidId(from);
      const toId = mermaidId(to);
      lines.push(label ? `  ${fromId} -->|\"${mermaidEscape(label)}\"| ${toId}` : `  ${fromId} --> ${toId}`);
    });
    lines.push("  classDef identity fill:#24102e,color:#ffffff,stroke:#ff3fb4,stroke-width:3px;");
    lines.push("  classDef account fill:#161020,color:#eee9f7,stroke:#8b5cf6,stroke-width:2px;");
    lines.push("  classDef academic fill:#08202a,color:#eefcff,stroke:#33e6ff,stroke-width:2px;");
    lines.push("  classDef social fill:#2a1024,color:#ffe5f5,stroke:#ff79c9,stroke-width:2px;");
    lines.push("  classDef infra fill:#2a1c09,color:#fff3cf,stroke:#ffbd3f,stroke-width:2px;");
    lines.push("  classDef resource fill:#0b241e,color:#e8fff7,stroke:#65f5a3,stroke-width:2px;");
    lines.push("  classDef hub fill:#171b28,color:#eefcff,stroke:#91a7ff,stroke-width:3px;");
    lines.push("  classDef service fill:#171b28,color:#eefcff,stroke:#91a7ff,stroke-width:2px;");
    const groups = {};
    nodes.forEach(node => (groups[node.kind || "service"] ||= []).push(mermaidId(node.id)));
    Object.entries(groups).forEach(([kind, ids]) => lines.push(`  class ${ids.join(",")} ${kind};`));
    return lines.join("\n");
  }

  function updateZoomUi(win) {
    const stage = $(".professional-ecosystem-stage", win);
    if (stage) stage.style.zoom = ecosystemZoom;
    const label = $("[data-ecosystem-zoom-label]", win);
    if (label) label.textContent = `${Math.round(ecosystemZoom * 100)}%`;
  }

  function fitEcosystemMap(win) {
    const map = $(".professional-ecosystem-map", win);
    const stage = $(".professional-ecosystem-stage", win);
    const svg = stage?.querySelector("svg");
    if (!map || !stage || !svg) return;
    stage.style.zoom = 1;
    const naturalWidth = Math.max(svg.getBoundingClientRect().width, 1);
    const availableWidth = Math.max(map.clientWidth - 36, 1);
    ecosystemZoom = Math.min(1, Math.max(.45, Math.floor((availableWidth / naturalWidth) * 100) / 100));
    updateZoomUi(win);
    map.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  }

  async function renderEcosystemMap(target, root, attempts = 0) {
    if (!window.mermaid) {
      target.innerHTML = `<p class="map-loading">Loading professional ecosystem <span class="blink">█</span></p>`;
      if (attempts < 50) setTimeout(() => renderEcosystemMap(target, root, attempts + 1), 120);
      return;
    }
    target.innerHTML = `<div class="professional-ecosystem-stage"><div class="mermaid">${ecosystemMermaid(root)}</div></div>`;
    await window.mermaid.run({ nodes: [$(".mermaid", target)] });
    const win = target.closest(".os-window");
    if (win) updateZoomUi(win);
  }

  function statusLabel(status = "") {
    const labels = {
      activo: "ACTIVE",
      reserva: "RESERVED",
      "conectado-no-operativo": "CONNECTED / NOT OPERATIVE"
    };
    return labels[status] || status.toUpperCase();
  }

  function quickAccessHtml(root) {
    if (root === "overview") {
      return `
        <div class="ecosystem-overview-copy">
          <p><strong>ALJOGABA</strong> concentra identidad profesional, perfiles académicos y presencia personal de trabajo.</p>
          <p><strong>ALJOGABA ACADEMIC</strong> concentra desarrollo científico, DiseasesMapMx y Workstation.</p>
          <p><strong>EPISUIS</strong> concentra identidad institucional, presencia pública y servicios técnicos de la firma.</p>
        </div>`;
    }

    const identity = identityById(root);
    const cards = nodesFor(root).filter(node => node.kind !== "identity");
    return `
      <div class="ecosystem-identity-summary">
        <p class="eyebrow">IDENTITY ROOT</p>
        <h3>${esc(identity?.label || root)}</h3>
        <p>${esc(identity?.subtitle || "")}</p>
        <code>${esc((identity?.emails || []).join(" · "))}</code>
      </div>
      <div class="ecosystem-card-grid">
        ${cards.map(node => {
          const url = safeLink(node.url);
          return `
            <article class="ecosystem-card ecosystem-kind-${esc(node.kind)}">
              <div class="ecosystem-card-head">
                <strong>${esc(node.label)}</strong>
                ${node.status ? `<span class="ecosystem-status status-${esc(node.status)}">${esc(statusLabel(node.status))}</span>` : ""}
              </div>
              <p>${esc(node.detail || "")}</p>
              ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">OPEN ↗</a>` : `<span class="ecosystem-no-link">NO DIRECT LINK STORED</span>`}
            </article>`;
        }).join("")}
      </div>`;
  }

  function shellHtml() {
    const buttons = [
      ["overview", "Overview"],
      ...(professionalEcosystem?.identities || []).map(identity => [identity.id, identity.label])
    ];
    return `
      <div class="professional-ecosystem-shell">
        <div class="professional-ecosystem-head">
          <div>
            <p class="eyebrow">PROFESSIONAL IDENTITY / ACCESS / PRESENCE</p>
            <h2>Professional Ecosystem</h2>
            <p>${esc(professionalEcosystem?.scope || "")}</p>
          </div>
          <div class="ecosystem-tabs">
            ${buttons.map(([id, label], index) => `<button class="ecosystem-tab ${index === 0 ? "active" : ""}" data-ecosystem-root="${esc(id)}">${esc(label)}</button>`).join("")}
          </div>
        </div>
        <div class="ecosystem-map-toolbar">
          <span>MAP VIEW</span>
          <button class="retro-button compact" data-ecosystem-zoom="out" aria-label="Alejar mapa">−</button>
          <span data-ecosystem-zoom-label>100%</span>
          <button class="retro-button compact" data-ecosystem-zoom="in" aria-label="Acercar mapa">+</button>
          <button class="retro-button compact" data-ecosystem-zoom="reset">100%</button>
          <button class="retro-button compact" data-ecosystem-zoom="fit">FIT</button>
          <small>La ventana también puede redimensionarse desde la esquina inferior derecha.</small>
        </div>
        <div class="professional-ecosystem-map"></div>
        <section class="professional-ecosystem-directory"></section>
        <p class="professional-ecosystem-note">El mapa documenta identidades, métodos de acceso, perfiles, recursos y presencia profesional. No almacena contraseñas, códigos MFA, recovery codes, API keys ni valores de secretos.</p>
      </div>`;
  }

  function renderRoot(win, root) {
    $$(".ecosystem-tab", win).forEach(button => button.classList.toggle("active", button.dataset.ecosystemRoot === root));
    const map = $(".professional-ecosystem-map", win);
    const directory = $(".professional-ecosystem-directory", win);
    directory.innerHTML = quickAccessHtml(root);
    renderEcosystemMap(map, root);
  }

  window.openProfessionalEcosystem = async function() {
    await ecosystemReady;
    createWindow({
      id: "professional-ecosystem",
      title: "Professional Ecosystem",
      icon: "◎",
      width: 1120,
      height: 720,
      html: shellHtml(),
      onMount: win => {
        renderRoot(win, "overview");
        $$(".ecosystem-tab", win).forEach(button => button.addEventListener("click", () => renderRoot(win, button.dataset.ecosystemRoot)));
        $$("[data-ecosystem-zoom]", win).forEach(button => button.addEventListener("click", () => {
          const action = button.dataset.ecosystemZoom;
          if (action === "fit") return fitEcosystemMap(win);
          if (action === "reset") ecosystemZoom = 1;
          else {
            const delta = action === "in" ? .1 : -.1;
            ecosystemZoom = Math.min(1.6, Math.max(.45, Math.round((ecosystemZoom + delta) * 10) / 10));
          }
          updateZoomUi(win);
        }));
      }
    });
  };

  function launchProfessionalEcosystem() {
    document.getElementById("startMenu")?.classList.add("is-hidden");
    window.openProfessionalEcosystem();
  }

  function installStartShortcut() {
    const identityButton = document.querySelector('#startMenu [data-launch="identity"]');
    if (!identityButton || document.querySelector('#startMenu [data-launch="ecosystem"]')) return;
    const button = document.createElement("button");
    button.dataset.launch = "ecosystem";
    button.innerHTML = "◎ Professional Ecosystem";
    identityButton.insertAdjacentElement("afterend", button);
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      launchProfessionalEcosystem();
    });
  }

  function installDesktopShortcut(attempts = 0) {
    const container = document.getElementById("desktopIcons");
    if (!container || !container.children.length) {
      if (attempts < 80) setTimeout(() => installDesktopShortcut(attempts + 1), 100);
      return;
    }
    if (container.querySelector('[data-icon-id="professional-ecosystem"]')) return;
    const button = document.createElement("button");
    button.className = "desktop-icon";
    button.dataset.iconId = "professional-ecosystem";
    button.setAttribute("aria-label", "Abrir Professional Ecosystem");
    button.innerHTML = `<span class="pixel-icon">◎</span><span class="desktop-icon-label">Professional Ecosystem</span>`;
    button.addEventListener("click", event => {
      event.stopPropagation();
      $$(".desktop-icon", container).forEach(x => x.classList.remove("selected"));
      button.classList.add("selected");
      if (window.matchMedia("(pointer: coarse)").matches) launchProfessionalEcosystem();
    });
    button.addEventListener("dblclick", event => {
      event.stopPropagation();
      launchProfessionalEcosystem();
    });
    button.addEventListener("keydown", event => {
      if (event.key === "Enter") launchProfessionalEcosystem();
    });
    container.appendChild(button);
  }

  document.addEventListener("DOMContentLoaded", () => {
    installStartShortcut();
    installDesktopShortcut();
  });
})();
