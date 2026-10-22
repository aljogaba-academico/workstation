(() => {
  const PREFS_KEY = "aljogaba-os-deep-space-v05";
  const VOLUME_KEY = "aljogaba-os-master-volume-v05";
  let ctx = null;
  let terminalOsc = null;
  let terminalGain = null;
  let countdownTimer = null;
  let alarmTimer = null;
  let active = false;

  function prefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function masterGain() {
    const stored = Number(localStorage.getItem(VOLUME_KEY));
    const percent = Number.isFinite(stored) ? Math.min(100, Math.max(0, stored)) : 72;
    return percent / 100;
  }

  function audioEnabled() {
    return prefs().audio === true && masterGain() > 0;
  }

  function ensureAudio() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function pulse(freq = 260, duration = .14, delay = 0) {
    if (!audioEnabled()) return;
    const audio = ensureAudio();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + delay;
    const level = Math.max(.0002, .045 * masterGain());
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration + .02);
  }

  function startTerminalTone() {
    if (!audioEnabled() || terminalOsc) return;
    const audio = ensureAudio();
    if (!audio) return;
    terminalOsc = audio.createOscillator();
    terminalGain = audio.createGain();
    terminalOsc.type = "square";
    terminalOsc.frequency.value = 880;
    terminalGain.gain.setValueAtTime(.0001, audio.currentTime);
    terminalGain.gain.exponentialRampToValueAtTime(Math.max(.0002, .055 * masterGain()), audio.currentTime + .04);
    terminalOsc.connect(terminalGain).connect(audio.destination);
    terminalOsc.start();
  }

  function stopTransientAudio() {
    clearInterval(alarmTimer);
    alarmTimer = null;
  }

  function enterTerminalState() {
    stopTransientAudio();
    document.body.classList.remove("red-alert");
    document.querySelector(".self-destruct-overlay")?.remove();

    const dead = document.createElement("div");
    dead.className = "terminal-dead-screen";
    dead.setAttribute("aria-hidden", "true");
    dead.innerHTML = `<div class="terminal-death-flash"></div><div class="terminal-death-line"></div>`;
    document.body.appendChild(dead);
    document.documentElement.classList.add("terminal-state-dead");
    startTerminalTone();
  }

  function beginSelfDestructV2() {
    if (active || document.querySelector(".terminal-dead-screen")) return;
    active = true;

    const overlay = document.createElement("div");
    overlay.className = "self-destruct-overlay self-destruct-v2";
    overlay.innerHTML = `
      <div class="self-destruct-panel">
        <p class="eyebrow">EMERGENCY PROTOCOL // SIMULATION</p>
        <h2>SELF DESTRUCT SEQUENCE</h2>
        <p>No external systems or data can be affected.</p>
        <div class="self-destruct-count">10</div>
        <div class="self-destruct-actions"><button data-abort-destruct-v2>ABORT MISSION</button></div>
      </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("red-alert");

    let count = 10;
    const countEl = overlay.querySelector(".self-destruct-count");

    if (audioEnabled()) {
      pulse(220, .18);
      alarmTimer = setInterval(() => {
        pulse(260, .13);
        pulse(390, .13, .14);
      }, 700);
    }

    const abort = () => {
      clearInterval(countdownTimer);
      countdownTimer = null;
      stopTransientAudio();
      overlay.remove();
      document.body.classList.remove("red-alert");
      active = false;
    };

    overlay.querySelector("[data-abort-destruct-v2]")?.addEventListener("click", abort);

    countdownTimer = setInterval(() => {
      count -= 1;
      countEl.textContent = String(count);
      if (count <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        countEl.textContent = "0";
        overlay.classList.add("terminal-impact");
        setTimeout(enterTerminalState, 180);
      }
    }, 1000);
  }

  window.beginALJOGABASelfDestruct = beginSelfDestructV2;

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-self-destruct]");
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    beginSelfDestructV2();
  }, true);

  document.addEventListener("submit", event => {
    const form = event.target.closest(".command-terminal-form");
    if (!form) return;
    const raw = form.querySelector(".command-terminal-input")?.value || "";
    const normalized = raw.toLowerCase().trim().replace(/\s+/g, " ");
    if (!["self destruct", "self-destruct", "selfdestruct"].includes(normalized)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    beginSelfDestructV2();
  }, true);
})();
