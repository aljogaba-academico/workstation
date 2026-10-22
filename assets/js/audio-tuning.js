(() => {
  const PREFS_KEY = "aljogaba-os-deep-space-v05";
  const VOLUME_KEY = "aljogaba-os-master-volume-v05";
  const DEFAULT_MASTER = 72;
  let ctx = null;
  let humOsc = null;
  let humGain = null;
  let lastHover = 0;

  function deepPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; }
    catch (_) { return {}; }
  }

  function audioEnabled() {
    return Boolean(deepPrefs().audio);
  }

  function ambienceEnabled() {
    return Boolean(deepPrefs().ambience);
  }

  function masterPercent() {
    const stored = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(stored) ? Math.min(100, Math.max(0, stored)) : DEFAULT_MASTER;
  }

  function masterGain() {
    return masterPercent() / 100;
  }

  function ensureContext() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, duration, gainValue, type = "sine", delay = 0) {
    if (!audioEnabled() || masterGain() <= 0) return;
    const audio = ensureContext();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + delay;
    const level = Math.max(.0002, gainValue * masterGain());
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration + .02);
  }

  function noise(duration = .1, gainValue = .03, delay = 0) {
    if (!audioEnabled() || masterGain() <= 0) return;
    const audio = ensureContext();
    if (!audio) return;
    const buffer = audio.createBuffer(1, Math.max(1, Math.floor(audio.sampleRate * duration)), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    const start = audio.currentTime + delay;
    source.buffer = buffer;
    gain.gain.setValueAtTime(Math.max(.0002, gainValue * masterGain()), start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(gain).connect(audio.destination);
    source.start(start);
  }

  function hoverSound() {
    const now = performance.now();
    if (now - lastHover < 75) return;
    lastHover = now;
    tone(920, .028, .045, "sine");
  }

  function clickSound() {
    tone(430, .045, .060, "square");
    tone(760, .038, .040, "square", .025);
  }

  function commsSound(kind = "core") {
    const bases = { diseasesmapmx: 700, episuis: 540, perfil: 610, proyectos: 470, core: 630 };
    const base = bases[kind] || bases.core;
    noise(.11, .035);
    tone(base, .07, .055, "sine", .08);
    tone(base * 1.48, .055, .036, "square", .16);
    noise(.08, .024, .24);
  }

  function stopHum() {
    try { humOsc?.stop(); } catch (_) {}
    try { humOsc?.disconnect(); humGain?.disconnect(); } catch (_) {}
    humOsc = null;
    humGain = null;
  }

  function syncHum() {
    if (!audioEnabled() || !ambienceEnabled() || masterGain() <= 0) {
      stopHum();
      return;
    }
    if (humOsc) {
      humGain.gain.setTargetAtTime(.014 * masterGain(), ctx.currentTime, .05);
      return;
    }
    const audio = ensureContext();
    if (!audio) return;
    humOsc = audio.createOscillator();
    humGain = audio.createGain();
    humOsc.type = "sine";
    humOsc.frequency.value = 52;
    humGain.gain.value = .014 * masterGain();
    humOsc.connect(humGain).connect(audio.destination);
    humOsc.start();
  }

  function volumeControlHtml() {
    const value = masterPercent();
    return `
      <section class="deep-setting master-volume-setting" data-master-volume-setting>
        <h3>Master volume</h3>
        <p>Internal Deep Space mix. Windows/system volume remains in control.</p>
        <div class="master-volume-row">
          <input type="range" min="0" max="100" step="5" value="${value}" data-master-volume aria-label="Deep Space master volume" />
          <strong data-master-volume-label>${value}%</strong>
        </div>
      </section>`;
  }

  function injectMasterVolume() {
    document.querySelectorAll(".deep-settings-grid").forEach(grid => {
      if (grid.querySelector("[data-master-volume-setting]")) return;
      grid.insertAdjacentHTML("beforeend", volumeControlHtml());
    });
  }

  document.addEventListener("input", event => {
    const slider = event.target.closest("[data-master-volume]");
    if (!slider) return;
    const value = Math.min(100, Math.max(0, Number(slider.value) || 0));
    localStorage.setItem(VOLUME_KEY, String(value));
    const label = slider.parentElement?.querySelector("[data-master-volume-label]");
    if (label) label.textContent = `${value}%`;
    syncHum();
  });

  document.addEventListener("change", event => {
    if (!event.target.closest("[data-master-volume]")) return;
    tone(560, .08, .06, "sine");
    tone(820, .06, .04, "sine", .07);
  });

  document.addEventListener("pointerover", event => {
    if (!audioEnabled()) return;
    const target = event.target.closest("button,a,.desktop-icon,.module-card");
    if (!target || target.contains(event.relatedTarget)) return;
    hoverSound();
  });

  document.addEventListener("pointerdown", event => {
    if (!event.target.closest("button,a,.desktop-icon")) return;
    clickSound();
  });

  document.addEventListener("click", event => {
    const launch = event.target.closest('[data-launch="system"]');
    if (launch) setTimeout(() => commsSound(launch.dataset.payload || "core"), 45);
    if (event.target.closest(".radar-calibrate")) setTimeout(() => commsSound("core"), 60);
  });

  const observer = new MutationObserver(() => injectMasterVolume());

  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    injectMasterVolume();
    setInterval(syncHum, 400);
    document.addEventListener("pointerdown", ensureContext, { once: true, capture: true });
    document.addEventListener("keydown", ensureContext, { once: true, capture: true });
  });
})();
