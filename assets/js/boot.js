(() => {
  const BOOT_DURATION = 19800;
  const RELEASE_DELAY = 650;
  const ANOMALY_PAUSE_START = 15900;
  const ANOMALY_PAUSE_END = 17500;
  const steps = [
    { at: 900, text: "Power core handshake .................... OK", cls: "boot-ok", status: "POWER CORE" },
    { at: 2300, text: "Mounting research environment ........... ONLINE", cls: "boot-ok", status: "MOUNTING RESEARCH ENVIRONMENT" },
    { at: 3800, text: "Knowledge systems ....................... CONNECTED", cls: "boot-ok", status: "CONNECTING KNOWLEDGE SYSTEMS" },
    { at: 5300, text: "Scientific tools ......................... READY", cls: "boot-ok", status: "LOADING SCIENTIFIC TOOLS" },
    { at: 6800, text: "Project routes ........................... READY", cls: "boot-ok", status: "INDEXING PROJECT ROUTES" },
    { at: 8350, text: "Sequence analysis bay .................... STANDBY", cls: "boot-dim", status: "CALIBRATING ANALYTICAL BAY" },
    { at: 9950, text: "Containment protocols .................... PROBABLY FINE", cls: "boot-warn", status: "VERIFYING CONTAINMENT" },
    { at: 11600, text: "World domination module ................. DISABLED BY ETHICS SUBSYSTEM", cls: "boot-weird", status: "CHECKING ETHICS SUBSYSTEM" },
    { at: 13200, text: "Coffee dependency ....................... CRITICAL", cls: "boot-warn", status: "RESTORING HUMAN OPERABILITY" },
    { at: 14600, text: "Unknown signal from sector 13 ........... IGNORED", cls: "boot-weird", status: "SCANNING DEEP WORK SECTOR" },
    { at: 15900, text: "Jorge... tenemos un problema.", cls: "boot-alert", status: "ANOMALY DETECTED", beep: true },
    { at: 18100, text: "ALJOGABA OS kernel ....................... READY", cls: "boot-ok", status: "FINALIZING WORKSTATION" },
    { at: 19050, text: "Research vessel command deck ............ ONLINE", cls: "boot-ok", status: "OPENING COMMAND DECK" }
  ];

  let started = false;
  let completed = false;
  let startTime = 0;
  let raf = null;
  let timers = [];
  let audioContext = null;

  const $ = id => document.getElementById(id);

  function armAudio() {
    try {
      if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioContext = new AudioContext();
      }
      if (audioContext?.state === "suspended") audioContext.resume().catch(() => {});
    } catch (_) {}
  }

  function anomalyBeep() {
    try {
      armAudio();
      if (!audioContext || audioContext.state !== "running") return;
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.025);
      gain.gain.setValueAtTime(0.055, now + 0.58);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.82);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.84);
    } catch (_) {}
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function initialBootLog() {
    const log = $("bootLog");
    if (!log) return;
    log.innerHTML = `
      <p class="visible boot-dim">Cold start detected. Waking research vessel...</p>
      <p class="visible">&gt; INITIALIZE ALJOGABA_OS <span class="boot-cursor blink">█</span></p>`;
  }

  function resetProgress() {
    const fill = $("bootProgress");
    const label = $("bootPercent");
    const status = $("bootStatus");
    if (fill) fill.style.width = "0%";
    if (label) label.textContent = "00%";
    if (status) status.textContent = "INITIALIZING CORE SYSTEMS";
    const track = document.querySelector(".boot-progress-track");
    if (track) track.setAttribute("aria-valuenow", "0");
  }

  function revealLine(step) {
    const log = $("bootLog");
    if (!log) return;
    const p = document.createElement("p");
    p.className = step.cls || "";
    p.textContent = step.text;
    log.appendChild(p);
    requestAnimationFrame(() => p.classList.add("visible"));
    if ($("bootStatus")) $("bootStatus").textContent = step.status || "INITIALIZING";
    if (step.beep) anomalyBeep();
    log.scrollTop = log.scrollHeight;
  }

  function stagedProgress(raw) {
    return raw < .72
      ? Math.pow(raw / .72, .88) * .75
      : .75 + Math.pow((raw - .72) / .28, 1.4) * .25;
  }

  function progressForElapsed(elapsed) {
    const pauseStartRaw = ANOMALY_PAUSE_START / BOOT_DURATION;
    const hold = stagedProgress(pauseStartRaw);
    if (elapsed < ANOMALY_PAUSE_START) return stagedProgress(elapsed / BOOT_DURATION);
    if (elapsed <= ANOMALY_PAUSE_END) return hold;
    const remaining = BOOT_DURATION - ANOMALY_PAUSE_END;
    const after = Math.min(1, (elapsed - ANOMALY_PAUSE_END) / remaining);
    return hold + (1 - hold) * Math.pow(after, 1.15);
  }

  function updateProgress(now) {
    if (completed) return;
    const elapsed = now - startTime;
    const progress = Math.min(1, progressForElapsed(elapsed));
    const percent = Math.min(100, Math.floor(progress * 100));
    const fill = $("bootProgress");
    const label = $("bootPercent");
    const track = document.querySelector(".boot-progress-track");
    if (fill) fill.style.width = `${percent}%`;
    if (label) label.textContent = `${String(percent).padStart(2, "0")}%`;
    if (track) track.setAttribute("aria-valuenow", String(percent));

    if (elapsed < BOOT_DURATION) raf = requestAnimationFrame(updateProgress);
    else finishBoot(false);
  }

  function releaseDesktop(skipped) {
    const boot = $("boot");
    const os = $("os");
    if (boot) boot.classList.add("boot-complete", "is-hidden");
    if (os) os.classList.remove("is-hidden");
    if (!skipped && typeof window.openWelcome === "function") window.openWelcome();
    if (skipped && typeof window.openWelcome === "function" && !document.querySelector(".os-window")) window.openWelcome();
  }

  function finishBoot(skipped = false) {
    if (completed) return;
    completed = true;
    clearTimers();

    const fill = $("bootProgress");
    const label = $("bootPercent");
    const status = $("bootStatus");
    const track = document.querySelector(".boot-progress-track");
    if (fill) fill.style.width = "100%";
    if (label) label.textContent = "100%";
    if (track) track.setAttribute("aria-valuenow", "100");
    if (status) status.textContent = skipped ? "MANUAL OVERRIDE ACCEPTED" : "ACCESS GRANTED";

    const log = $("bootLog");
    if (log && !skipped) {
      const p = document.createElement("p");
      p.className = "boot-ok boot-access";
      p.textContent = "> WORKSTATION ACCESS GRANTED";
      log.appendChild(p);
      requestAnimationFrame(() => p.classList.add("visible"));
      log.scrollTop = log.scrollHeight;
    }

    timers.push(setTimeout(() => releaseDesktop(skipped), skipped ? 80 : RELEASE_DELAY));
  }

  function scheduleNormalBoot() {
    steps.forEach(step => timers.push(setTimeout(() => revealLine(step), step.at)));
    raf = requestAnimationFrame(updateProgress);
  }

  function scheduleReducedBoot() {
    const compact = [steps[0], steps[2], steps[4], steps[11], steps[12]];
    compact.forEach((step, i) => timers.push(setTimeout(() => revealLine(step), 120 + i * 180)));
    timers.push(setTimeout(() => finishBoot(false), 1120));
  }

  function startBoot() {
    if (started) return;
    started = true;
    completed = false;
    startTime = performance.now();
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) scheduleReducedBoot();
    else scheduleNormalBoot();
  }

  function reboot() {
    armAudio();
    clearTimers();
    started = false;
    completed = false;
    window.closeAllWorkstationWindows?.();
    const os = $("os");
    const boot = $("boot");
    if (os) os.classList.add("is-hidden");
    if (boot) boot.classList.remove("is-hidden", "boot-complete");
    initialBootLog();
    resetProgress();
    timers.push(setTimeout(startBoot, 240));
  }

  window.rebootALJOGABAOS = reboot;

  document.addEventListener("DOMContentLoaded", () => {
    initialBootLog();
    resetProgress();
    const skip = $("skipBoot");
    if (skip) {
      skip.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        finishBoot(true);
      });
    }
    document.addEventListener("pointerdown", armAudio, { once: true, capture: true });
    document.addEventListener("keydown", armAudio, { once: true, capture: true });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !completed && !$("boot")?.classList.contains("is-hidden")) finishBoot(true);
    });
    startBoot();
  });
})();
