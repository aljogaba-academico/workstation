(() => {
  const STORAGE_KEY = "aljogaba-os-deep-space-v05";
  const THEMES = ["cyan", "green", "amber", "red"];
  const defaults = { phosphor: "cyan", audio: false, ambience: false, crt: true, fx: true };
  let prefs = { ...defaults };
  let audioContext = null;
  let humOsc = null;
  let humGain = null;
  let hoverStamp = 0;
  let commsTimer = null;
  let destructTimer = null;
  let destructAlarm = null;
  const glitchClicks = new WeakMap();

  try {
    prefs = { ...defaults, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch (_) {}

  function savePrefs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (_) {}
  }

  function applyPrefs() {
    document.body.dataset.phosphor = THEMES.includes(prefs.phosphor) ? prefs.phosphor : "cyan";
    document.body.classList.toggle("fx-crt-off", !prefs.crt);
    document.body.classList.toggle("fx-boost", Boolean(prefs.fx));
    syncControls();
    syncAmbience();
  }

  function ensureAudio() {
    if (!audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioContext = new Ctx();
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  }

  function tone(freq = 660, duration = .045, type = "square", gainValue = .025, delay = 0) {
    if (!prefs.audio) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, gainValue), start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + .015);
  }

  function noise(duration = .12, gainValue = .012, delay = 0) {
    if (!prefs.audio) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    source.buffer = buffer;
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(gain).connect(ctx.destination);
    source.start(start);
  }

  function uiClick() {
    tone(410, .035, "square", .018);
    tone(730, .03, "square", .012, .025);
  }

  function uiHover() {
    const now = performance.now();
    if (now - hoverStamp < 65) return;
    hoverStamp = now;
    tone(860, .022, "sine", .008);
  }

  function radioLink(systemId = "core") {
    if (!prefs.audio) return;
    const signatures = { episuis: 520, diseasesmapmx: 680, perfil: 590, proyectos: 460, core: 620 };
    const base = signatures[systemId] || signatures.core;
    noise(.10, .012);
    tone(base, .055, "sine", .022, .08);
    tone(base * 1.5, .045, "square", .012, .15);
    noise(.07, .008, .21);
  }

  function startHum() {
    if (!prefs.audio || !prefs.ambience || humOsc) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    humOsc = ctx.createOscillator();
    humGain = ctx.createGain();
    humOsc.type = "sine";
    humOsc.frequency.value = 48;
    humGain.gain.value = .0055;
    humOsc.connect(humGain).connect(ctx.destination);
    humOsc.start();
  }

  function stopHum() {
    try { humOsc?.stop(); } catch (_) {}
    try { humOsc?.disconnect(); humGain?.disconnect(); } catch (_) {}
    humOsc = null;
    humGain = null;
  }

  function syncAmbience() {
    if (prefs.audio && prefs.ambience) startHum(); else stopHum();
  }

  function showComms(message, label = "COMMS") {
    document.querySelector(".comms-toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "comms-toast";
    toast.innerHTML = `<strong>[${label}]</strong> ${escapeHtml(message)}`;
    document.body.appendChild(toast);
    clearTimeout(commsTimer);
    commsTimer = setTimeout(() => toast.remove(), 2600);
  }

  function cycleTheme() {
    const idx = Math.max(0, THEMES.indexOf(prefs.phosphor));
    prefs.phosphor = THEMES[(idx + 1) % THEMES.length];
    savePrefs();
    applyPrefs();
    tone(540 + (idx * 80), .055, "sine", .02);
    showComms(`Display phosphor: ${prefs.phosphor.toUpperCase()}`, "DISPLAY");
  }

  function toggleAudio(force) {
    prefs.audio = typeof force === "boolean" ? force : !prefs.audio;
    savePrefs();
    applyPrefs();
    if (prefs.audio) {
      ensureAudio();
      tone(440, .06, "sine", .025);
      tone(660, .06, "sine", .018, .07);
      showComms("Audio bus online.", "AUDIO");
    } else {
      stopHum();
      showComms("Audio bus muted.", "AUDIO");
    }
  }

  function syncControls() {
    const display = document.querySelector('[data-deep-control="display"]');
    const audio = document.querySelector('[data-deep-control="audio"]');
    if (display) {
      display.classList.toggle("is-on", prefs.crt);
      display.querySelector(".control-text").textContent = prefs.phosphor.toUpperCase();
    }
    if (audio) {
      audio.classList.toggle("is-on", prefs.audio);
      audio.querySelector(".control-text").textContent = prefs.audio ? "AUDIO ON" : "AUDIO OFF";
    }
  }

  function injectControls() {
    const right = document.querySelector(".menubar-right");
    if (!right || right.querySelector(".deep-space-controls")) return;
    const controls = document.createElement("div");
    controls.className = "deep-space-controls";
    controls.innerHTML = `
      <button class="deep-space-control is-on" data-deep-control="display" title="Cycle phosphor palette"><span class="control-led"></span><span class="control-text">CYAN</span></button>
      <button class="deep-space-control" data-deep-control="audio" title="Mute / unmute UI audio"><span class="control-led"></span><span class="control-text">AUDIO OFF</span></button>
      <button class="deep-space-control" data-deep-control="fx" title="Deep Space settings"><span class="control-led"></span><span class="control-text">FX</span></button>`;
    right.prepend(controls);
    syncControls();
  }

  function injectTerminalEntry() {
    const icons = document.querySelector("#desktopIcons");
    if (icons && !icons.querySelector('[data-icon-id="terminal"]')) {
      const button = document.createElement("button");
      button.className = "desktop-icon";
      button.dataset.iconId = "terminal";
      button.setAttribute("aria-label", "Abrir Command Terminal");
      button.innerHTML = `<span class="pixel-icon">&gt;_</span><span class="desktop-icon-label">Command Terminal</span>`;
      button.addEventListener("click", event => {
        event.stopPropagation();
        document.querySelectorAll(".desktop-icon").forEach(x => x.classList.toggle("selected", x === button));
        if (window.matchMedia("(pointer: coarse)").matches) openTerminal();
      });
      button.addEventListener("dblclick", event => { event.stopPropagation(); openTerminal(); });
      button.addEventListener("keydown", event => { if (event.key === "Enter") openTerminal(); });
      icons.appendChild(button);
    }

    const ops = document.querySelector('#startMenu button[data-launch="ops"]');
    if (ops && !document.querySelector("#deepTerminalStart")) {
      const button = document.createElement("button");
      button.id = "deepTerminalStart";
      button.innerHTML = "⌨ Command Terminal";
      button.addEventListener("click", () => { closeStartMenu?.(); openTerminal(); });
      ops.insertAdjacentElement("afterend", button);
    }
  }

  function terminalHtml() {
    return `
      <div class="command-terminal">
        <div class="command-terminal-head">ALJOGABA COMMAND INTERFACE // LOCAL NAVIGATION LAYER // TYPE <b>help</b></div>
        <div class="command-terminal-output" role="log" aria-live="polite"></div>
        <form class="command-terminal-form" autocomplete="off">
          <label for="commandInput">A&gt;</label>
          <input id="commandInput" class="command-terminal-input" name="command" spellcheck="false" aria-label="Command input" />
        </form>
      </div>`;
  }

  function appendTerminalLine(win, text, cls = "system", typed = false) {
    const out = win.querySelector(".command-terminal-output");
    if (!out) return Promise.resolve();
    const line = document.createElement("div");
    line.className = `command-line-output ${cls}`;
    out.appendChild(line);
    if (!typed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      line.textContent = text;
      out.scrollTop = out.scrollHeight;
      return Promise.resolve();
    }
    return new Promise(resolve => {
      let i = 0;
      const tick = () => {
        line.textContent = text.slice(0, i += 2);
        out.scrollTop = out.scrollHeight;
        if (i < text.length) setTimeout(tick, 5);
        else resolve();
      };
      tick();
    });
  }

  function normalize(value = "") {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }

  function resolveSystem(term) {
    const q = normalize(term);
    const aliases = {
      dmx: "diseasesmapmx", diseases: "diseasesmapmx", diseasesmapmx: "diseasesmapmx",
      episuis: "episuis", vigilancia: "episuis", produccion: "episuis",
      perfil: "perfil", cv: "perfil", notas: "perfil",
      proyectos: "proyectos", investigacion: "proyectos", territoriales: "proyectos"
    };
    const id = aliases[q];
    if (id) return state.systems.find(s => s.id === id);
    return state.systems.find(s => normalize(s.name).includes(q) || q.includes(normalize(s.name)));
  }

  function resolveTool(term) {
    const q = normalize(term);
    return state.tools.find(t => normalize(t.name).includes(q) || normalize(t.fullName || "").includes(q) || q.includes(normalize(t.name)));
  }

  function moduleParent(term) {
    const q = normalize(term);
    for (const system of state.systems) {
      const module = (system.modules || []).find(m => normalize(m.name).includes(q) || q.includes(normalize(m.name)));
      if (module) return { system, module };
    }
    return null;
  }

  async function executeCommand(win, raw) {
    const command = raw.trim();
    if (!command) return;
    const [verbRaw, ...restParts] = command.split(/\s+/);
    const verb = normalize(verbRaw);
    const rest = restParts.join(" ").trim();
    appendTerminalLine(win, `A> ${command}`, "command");
    uiClick();

    if (verb === "help") {
      const text = "help · status · systems · modules · open <system/tool/module> · infrastructure <system> · missions · radar · theme <cyan|green|amber|red> · audio <on|off> · fx · clear · reboot";
      return appendTerminalLine(win, text, "success", true);
    }
    if (verb === "status") {
      return appendTerminalLine(win, `SYSTEM NOMINAL // ${state.systems.length} systems // ${state.systems.reduce((n,s)=>n+(s.modules?.length||0),0)} modules // ${state.tools.length} tools // ${state.missions.length} mission routes`, "success", true);
    }
    if (verb === "systems") {
      return appendTerminalLine(win, state.systems.map(s => `${s.id}: ${s.name}`).join("\n"), "system", true);
    }
    if (verb === "modules") {
      const lines = state.systems.flatMap(s => (s.modules || []).map(m => `${s.name} > ${m.name}`));
      return appendTerminalLine(win, lines.join("\n"), "system", true);
    }
    if (verb === "missions") {
      openMissionControl();
      return appendTerminalLine(win, "Mission Control opened.", "success", true);
    }
    if (verb === "radar") {
      openSystemMap("radar");
      return appendTerminalLine(win, "Long Range Scanner opened.", "success", true);
    }
    if (verb === "infrastructure") {
      const system = resolveSystem(rest);
      if (!system) return appendTerminalLine(win, "Unknown system. Try: infrastructure diseasesmapmx", "error", true);
      openIdentityMatrix(system.id);
      return appendTerminalLine(win, `Infrastructure map opened: ${system.name}`, "success", true);
    }
    if (verb === "open") {
      const system = resolveSystem(rest);
      if (system) {
        openSystem(system.id);
        radioLink(system.id);
        return appendTerminalLine(win, `Opening ${system.name}.`, "success", true);
      }
      const tool = resolveTool(rest);
      if (tool?.url) {
        window.open(tool.url, "_blank", "noopener");
        return appendTerminalLine(win, `External tool link opened: ${tool.name}`, "success", true);
      }
      const parent = moduleParent(rest);
      if (parent) {
        openSystem(parent.system.id);
        showComms(`${parent.module.name} located inside ${parent.system.name}.`, "NAV");
        return appendTerminalLine(win, `Module located: ${parent.system.name} > ${parent.module.name}`, "success", true);
      }
      return appendTerminalLine(win, `Target not found: ${rest}`, "error", true);
    }
    if (verb === "theme") {
      const theme = normalize(rest);
      if (!THEMES.includes(theme)) return appendTerminalLine(win, `Valid themes: ${THEMES.join(", ")}`, "error", true);
      prefs.phosphor = theme;
      savePrefs(); applyPrefs();
      return appendTerminalLine(win, `Phosphor changed to ${theme.toUpperCase()}.`, "success", true);
    }
    if (verb === "audio") {
      const choice = normalize(rest);
      if (!["on","off"].includes(choice)) return appendTerminalLine(win, "Usage: audio on | audio off", "error", true);
      toggleAudio(choice === "on");
      return appendTerminalLine(win, `Audio ${choice.toUpperCase()}.`, "success", true);
    }
    if (verb === "fx") {
      openDeepSettings();
      return appendTerminalLine(win, "Deep Space settings opened.", "success", true);
    }
    if (verb === "clear") {
      const out = win.querySelector(".command-terminal-output");
      if (out) out.innerHTML = "";
      return;
    }
    if (verb === "reboot") {
      requestReboot();
      return appendTerminalLine(win, "Reboot confirmation requested.", "success", true);
    }
    if (verb === "self" && normalize(rest) === "destruct" || verb === "self-destruct" || verb === "selfdestruct") {
      beginSelfDestruct();
      return;
    }
    return appendTerminalLine(win, `Unknown command: ${verbRaw}. Type help.`, "error", true);
  }

  function openTerminal() {
    const win = createWindow({
      id: "command-terminal",
      title: "Command Terminal / Deep Space Interface",
      icon: ">_",
      width: 760,
      height: 500,
      html: terminalHtml(),
      onMount: mounted => {
        const form = mounted.querySelector(".command-terminal-form");
        const input = mounted.querySelector(".command-terminal-input");
        appendTerminalLine(mounted, "ALJOGABA OS COMMAND BUS ONLINE. Navigation commands only; no shell execution.", "success", true);
        appendTerminalLine(mounted, "Type help for available commands.", "system", true);
        form?.addEventListener("submit", async event => {
          event.preventDefault();
          const raw = input.value;
          input.value = "";
          await executeCommand(mounted, raw);
          input.focus();
        });
        setTimeout(() => input?.focus(), 60);
      }
    });
    win?.querySelector(".command-terminal-input")?.focus();
    radioLink("core");
  }
  window.openDeepSpaceTerminal = openTerminal;

  function settingsHtml() {
    return `
      <div class="deep-settings">
        <p class="eyebrow">DEEP SPACE OPERATIONS / IMMERSION LAYER</p>
        <h2>Display · Audio · FX</h2>
        <p>All settings are local to this browser. They do not alter project data or send telemetry.</p>
        <div class="deep-settings-grid">
          <section class="deep-setting">
            <h3>Phosphor palette</h3><p>Operational accent and terminal palette.</p>
            <div class="phosphor-row">${THEMES.map(t => `<button class="phosphor-chip ${prefs.phosphor===t?"active":""}" data-deep-theme="${t}">${t.toUpperCase()}</button>`).join("")}</div>
          </section>
          <section class="deep-setting">
            <h3>CRT display</h3><p>Scanlines, vignette and boot flicker.</p>
            <button class="retro-button" data-deep-toggle="crt">CRT ${prefs.crt ? "ON" : "OFF"}</button>
          </section>
          <section class="deep-setting">
            <h3>UI audio</h3><p>Interface blips, radio links and event tones.</p>
            <button class="retro-button" data-deep-toggle="audio">AUDIO ${prefs.audio ? "ON" : "OFF"}</button>
          </section>
          <section class="deep-setting">
            <h3>Ambient hum</h3><p>Very low engine-room hum; disabled by default.</p>
            <button class="retro-button" data-deep-toggle="ambience">AMBIENCE ${prefs.ambience ? "ON" : "OFF"}</button>
          </section>
        </div>
        <section class="emergency-sector">
          <p class="eyebrow">CONTROLLED EASTER EGG / NO DATA OPERATIONS</p>
          <strong>Emergency protocol</strong>
          <p>The sequence is theatrical only. It can never delete data or modify external systems.</p>
          <button class="emergency-cover" data-emergency-cover>▰ LIFT SAFETY COVER</button><span data-emergency-slot></span>
        </section>
      </div>`;
  }

  function openDeepSettings() {
    createWindow({ id: "deep-space-settings", title: "Deep Space Operations / Settings", icon: "◈", width: 700, height: 550, html: settingsHtml() });
  }
  window.openDeepSpaceSettings = openDeepSettings;

  function refreshSettingsWindow() {
    const win = state.windows?.get("deep-space-settings");
    if (!win) return;
    const body = win.querySelector(".window-body");
    if (body) body.innerHTML = settingsHtml();
  }

  function calibrateRadar() {
    const mapWin = state.windows?.get("system-map");
    if (!mapWin) return;
    const radarButton = mapWin.querySelector('[data-map="radar"]');
    if (mapWin.querySelector(".map-canvas")?.dataset.mode !== "radar") radarButton?.click();
    setTimeout(() => {
      const radar = mapWin.querySelector(".radar-field");
      if (!radar) return;
      radar.classList.remove("calibrating");
      void radar.offsetWidth;
      radar.classList.add("calibrating");
      radioLink("core");
      tone(360, .08, "sine", .018, .25);
      tone(540, .08, "sine", .018, .55);
      tone(720, .1, "sine", .02, .9);
      showComms("Scanning four system quadrants…", "RADAR");
      setTimeout(() => {
        radar.classList.remove("calibrating");
        showComms("CALIBRATION COMPLETE // SYSTEM ARRAY NOMINAL", "RADAR");
      }, 1900);
    }, 60);
  }

  function injectRadarCalibration() {
    document.querySelectorAll(".map-toolbar").forEach(toolbar => {
      if (toolbar.querySelector(".radar-calibrate")) return;
      const button = document.createElement("button");
      button.className = "retro-button radar-calibrate";
      button.textContent = "CALIBRATE";
      button.addEventListener("click", calibrateRadar);
      toolbar.appendChild(button);
    });
  }

  function beginSelfDestruct() {
    if (document.querySelector(".self-destruct-overlay")) return;
    const overlay = document.createElement("div");
    overlay.className = "self-destruct-overlay";
    overlay.innerHTML = `<div class="self-destruct-panel"><p class="eyebrow">EMERGENCY PROTOCOL // SIMULATION</p><h2>SELF DESTRUCT SEQUENCE</h2><p>No external systems or data can be affected.</p><div class="self-destruct-count">10</div><div class="self-destruct-actions"><button data-abort-destruct>ABORT MISSION</button></div></div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("red-alert");
    const countEl = overlay.querySelector(".self-destruct-count");
    let count = 10;
    if (prefs.audio) {
      tone(220, .16, "sawtooth", .035);
      destructAlarm = setInterval(() => { tone(260, .13, "square", .027); tone(390, .13, "square", .018, .14); }, 700);
    }
    const abort = () => {
      clearInterval(destructTimer); clearInterval(destructAlarm);
      destructTimer = destructAlarm = null;
      overlay.remove(); document.body.classList.remove("red-alert");
      showComms("Emergency sequence aborted. Crew morale restored.", "CONTROL");
    };
    overlay.querySelector("[data-abort-destruct]")?.addEventListener("click", abort);
    destructTimer = setInterval(() => {
      count -= 1;
      countEl.textContent = String(count);
      if (count <= 0) {
        clearInterval(destructTimer); clearInterval(destructAlarm);
        destructTimer = destructAlarm = null;
        countEl.textContent = "0";
        overlay.querySelector("h2").textContent = "SIMULATION COMPLETE";
        overlay.querySelector("p:nth-of-type(2)").textContent = "No data was harmed. Reinitializing command deck…";
        setTimeout(() => {
          overlay.remove(); document.body.classList.remove("red-alert");
          window.closeAllWorkstationWindows?.();
          window.rebootALJOGABAOS?.();
        }, 1400);
      }
    }, 1000);
  }
  window.beginALJOGABASelfDestruct = beginSelfDestruct;

  function controlledGlitch(target) {
    if (!prefs.fx) return;
    const now = Date.now();
    const record = glitchClicks.get(target) || { count: 0, first: now };
    if (now - record.first > 1800) { record.count = 0; record.first = now; }
    record.count += 1;
    glitchClicks.set(target, record);
    if (record.count < 5) return;
    record.count = 0; record.first = now;
    target.classList.remove("fx-glitch");
    void target.getBoundingClientRect();
    target.classList.add("fx-glitch");
    noise(.12, .015); tone(120, .06, "sawtooth", .02, .04);
    showComms("WARNING: excessive caffeine flux detected in development sector.", "DIAGNOSTIC");
    setTimeout(() => target.classList.remove("fx-glitch"), 900);
  }

  function updateAboutVersion(root = document) {
    root.querySelectorAll?.(".about-badge").forEach(badge => { badge.textContent = "ALJOGABA OS · v0.5"; });
  }

  function observeWindows() {
    const observer = new MutationObserver(() => {
      injectRadarCalibration();
      updateAboutVersion();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function bindGlobalFX() {
    document.addEventListener("pointerover", event => {
      if (!prefs.audio) return;
      const control = event.target.closest("button,a,.desktop-icon");
      if (!control || control.contains(event.relatedTarget)) return;
      uiHover();
    });
    document.addEventListener("pointerdown", event => {
      if (event.target.closest("button,a,.desktop-icon")) uiClick();
    });
    document.addEventListener("click", event => {
      const control = event.target.closest("[data-deep-control]");
      if (control?.dataset.deepControl === "display") cycleTheme();
      if (control?.dataset.deepControl === "audio") toggleAudio();
      if (control?.dataset.deepControl === "fx") openDeepSettings();

      const theme = event.target.closest("[data-deep-theme]")?.dataset.deepTheme;
      if (theme && THEMES.includes(theme)) { prefs.phosphor = theme; savePrefs(); applyPrefs(); refreshSettingsWindow(); }

      const toggle = event.target.closest("[data-deep-toggle]")?.dataset.deepToggle;
      if (toggle === "crt") prefs.crt = !prefs.crt;
      if (toggle === "audio") prefs.audio = !prefs.audio;
      if (toggle === "ambience") prefs.ambience = !prefs.ambience;
      if (toggle) {
        if (toggle === "audio" && prefs.audio) ensureAudio();
        savePrefs(); applyPrefs(); refreshSettingsWindow();
        if (toggle === "audio" && prefs.audio) { tone(440,.05,"sine",.02); tone(660,.05,"sine",.015,.06); }
      }

      const cover = event.target.closest("[data-emergency-cover]");
      if (cover) {
        cover.classList.toggle("open");
        const slot = cover.parentElement.querySelector("[data-emergency-slot]");
        if (cover.classList.contains("open")) slot.innerHTML = `<button class="emergency-button" data-self-destruct>INITIATE</button>`;
        else slot.innerHTML = "";
      }
      if (event.target.closest("[data-self-destruct]")) beginSelfDestruct();

      const glitchTarget = event.target.closest(".module-card, .mermaid .node");
      if (glitchTarget) controlledGlitch(glitchTarget);

      const systemLaunch = event.target.closest('[data-launch="system"]');
      if (systemLaunch && !systemLaunch.closest(".desktop-icon")) {
        setTimeout(() => { radioLink(systemLaunch.dataset.payload || "core"); }, 45);
      }
    });
    document.addEventListener("dblclick", event => {
      const systemLaunch = event.target.closest('.desktop-icon[data-launch="system"]');
      if (systemLaunch) setTimeout(() => radioLink(systemLaunch.dataset.payload || "core"), 45);
    });
  }

  function readyWhenCoreIsLoaded(attempt = 0) {
    if (document.querySelector("#desktopIcons .desktop-icon") || attempt > 80) {
      injectControls();
      injectTerminalEntry();
      injectRadarCalibration();
      applyPrefs();
      updateAboutVersion();
      return;
    }
    setTimeout(() => readyWhenCoreIsLoaded(attempt + 1), 75);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindGlobalFX();
    observeWindows();
    applyPrefs();
    readyWhenCoreIsLoaded();
  });
})();
