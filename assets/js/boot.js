(() => {
  const BOOT_DURATION = 6200;
  const steps = [
    { at: 250,  text: "Power core handshake .................... OK", cls: "boot-ok", status: "POWER CORE" },
    { at: 760,  text: "Mounting research environment ........... ONLINE", cls: "boot-ok", status: "MOUNTING RESEARCH ENVIRONMENT" },
    { at: 1320, text: "Knowledge systems ....................... CONNECTED", cls: "boot-ok", status: "CONNECTING KNOWLEDGE SYSTEMS" },
    { at: 1880, text: "Scientific tools ......................... READY", cls: "boot-ok", status: "LOADING SCIENTIFIC TOOLS" },
    { at: 2480, text: "Project routes ........................... READY", cls: "boot-ok", status: "INDEXING PROJECT ROUTES" },
    { at: 3080, text: "Sequence analysis bay .................... STANDBY", cls: "boot-dim", status: "CALIBRATING ANALYTICAL BAY" },
    { at: 3650, text: "Containment protocols .................... PROBABLY FINE", cls: "boot-warn", status: "VERIFYING CONTAINMENT" },
    { at: 4210, text: "World domination module ................. DISABLED BY ETHICS SUBSYSTEM", cls: "boot-weird", status: "CHECKING ETHICS SUBSYSTEM" },
    { at: 4780, text: "Coffee dependency ....................... CRITICAL", cls: "boot-warn", status: "RESTORING HUMAN OPERABILITY" },
    { at: 5320, text: "Unknown signal from sector 13 ........... IGNORED", cls: "boot-weird", status: "SCANNING DEEP WORK SECTOR" },
    { at: 5740, text: "ALJOGABA OS kernel ....................... READY", cls: "boot-ok", status: "FINALIZING WORKSTATION" }
  ];

  let started = false;
  let completed = false;
  let startTime = 0;
  let raf = null;
  const timers = [];

  function $(id) { return document.getElementById(id); }

  function revealLine(step) {
    const log = $("bootLog");
    if (!log) return;
    const p = document.createElement("p");
    p.className = step.cls || "";
    p.textContent = step.text;
    log.appendChild(p);
    requestAnimationFrame(() => p.classList.add("visible"));
    if ($("bootStatus")) $("bootStatus").textContent = step.status || "INITIALIZING";
    log.scrollTop = log.scrollHeight;
  }

  function updateProgress(now) {
    if (completed) return;
    const elapsed = now - startTime;
    const raw = Math.min(1, elapsed / BOOT_DURATION);
    // Slightly non-linear: quick wake-up, small hesitation in the middle, clean finish.
    const eased = raw < .68
      ? Math.pow(raw / .68, .82) * .72
      : .72 + Math.pow((raw - .68) / .32, 1.35) * .28;
    const percent = Math.min(100, Math.floor(eased * 100));
    const fill = $("bootProgress");
    const label = $("bootPercent");
    if (fill) fill.style.width = `${percent}%`;
    if (label) label.textContent = `${String(percent).padStart(2, "0")}%`;

    if (raw < 1) {
      raf = requestAnimationFrame(updateProgress);
    } else {
      finishBoot(false);
    }
  }

  function finishBoot(skipped = false) {
    if (completed) return;
    completed = true;
    timers.forEach(clearTimeout);
    if (raf) cancelAnimationFrame(raf);

    const fill = $("bootProgress");
    const label = $("bootPercent");
    const status = $("bootStatus");
    if (fill) fill.style.width = "100%";
    if (label) label.textContent = "100%";
    if (status) status.textContent = skipped ? "MANUAL OVERRIDE ACCEPTED" : "ACCESS GRANTED";

    const log = $("bootLog");
    if (log && !skipped) {
      const p = document.createElement("p");
      p.className = "boot-ok";
      p.textContent = "> WORKSTATION ACCESS GRANTED";
      log.appendChild(p);
      requestAnimationFrame(() => p.classList.add("visible"));
    }

    setTimeout(() => {
      const boot = $("boot");
      if (boot) boot.classList.add("boot-complete", "is-hidden");
      const os = $("os");
      if (os) os.classList.remove("is-hidden");
      if (typeof window.openWelcome === "function") window.openWelcome();
    }, skipped ? 80 : 460);
  }

  function startBoot() {
    if (started) return;
    started = true;
    startTime = performance.now();

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      steps.slice(0, 4).forEach((step, i) => timers.push(setTimeout(() => revealLine(step), i * 160)));
      timers.push(setTimeout(() => finishBoot(false), 900));
      return;
    }

    steps.forEach(step => timers.push(setTimeout(() => revealLine(step), step.at)));
    raf = requestAnimationFrame(updateProgress);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const skip = $("skipBoot");
    if (skip) {
      // Registered after app.js; this second handler provides the cinematic override.
      skip.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        finishBoot(true);
      });
    }
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !completed) finishBoot(true);
    });
    startBoot();
  });
})();
