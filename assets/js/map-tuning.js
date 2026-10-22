(() => {
  const MIN_ZOOM = 0.35;
  const MAX_ZOOM = 1.6;
  const STEP = 0.1;

  function systemMapWindow() {
    return state?.windows?.get("system-map") || document.querySelector('.os-window[data-window-id="system-map"]');
  }

  function activeMapTarget(win) {
    const canvas = win?.querySelector(".map-canvas");
    if (!canvas) return null;
    return canvas.dataset.mode === "architecture"
      ? canvas.querySelector(".mermaid-stage")
      : canvas.querySelector(".radar-field");
  }

  function clampZoom(value) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
  }

  function updateLabel(win) {
    const label = win?.querySelector("[data-zoom-label]");
    if (label) label.textContent = `${Math.round(state.mapZoom * 100)}%`;
  }

  function applyZoom(win, value = state.mapZoom, attempts = 0) {
    if (!win) return;
    state.mapZoom = clampZoom(value);
    const target = activeMapTarget(win);
    if (!target) {
      if (attempts < 30) setTimeout(() => applyZoom(win, state.mapZoom, attempts + 1), 60);
      return;
    }
    target.style.zoom = String(state.mapZoom);
    target.style.transformOrigin = "center center";
    updateLabel(win);
  }

  function fitToView(win, attempts = 0) {
    if (!win) return;
    const canvas = win.querySelector(".map-canvas");
    const target = activeMapTarget(win);
    if (!canvas || !target) {
      if (attempts < 30) setTimeout(() => fitToView(win, attempts + 1), 60);
      return;
    }

    target.style.zoom = "1";
    requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      const naturalWidth = target.scrollWidth || target.offsetWidth || rect.width;
      const naturalHeight = target.scrollHeight || target.offsetHeight || rect.height;
      const availableWidth = Math.max(120, canvas.clientWidth - 48);
      const availableHeight = Math.max(120, canvas.clientHeight - 48);
      if (!naturalWidth || !naturalHeight) return;

      const fitted = Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight);
      state.mapZoom = clampZoom(Math.floor(fitted * 20) / 20);
      applyZoom(win, state.mapZoom);
      canvas.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });
  }

  function injectFitButton() {
    document.querySelectorAll(".map-zoom").forEach(group => {
      if (group.querySelector("[data-map-fit]")) return;
      const fit = document.createElement("button");
      fit.className = "retro-button compact map-fit-button";
      fit.dataset.mapFit = "true";
      fit.textContent = "FIT";
      fit.title = "Fit current map to view";
      group.appendChild(fit);
    });
  }

  document.addEventListener("click", event => {
    const zoom = event.target.closest("[data-map-zoom]");
    if (zoom) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const win = systemMapWindow();
      const delta = zoom.dataset.mapZoom === "in" ? STEP : -STEP;
      applyZoom(win, state.mapZoom + delta);
      return;
    }

    if (event.target.closest("[data-map-fit]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      fitToView(systemMapWindow());
      return;
    }

    if (event.target.closest("[data-map]")) {
      const win = systemMapWindow();
      setTimeout(() => applyZoom(win, state.mapZoom), 90);
      setTimeout(() => applyZoom(win, state.mapZoom), 240);
    }
  }, true);

  const observer = new MutationObserver(() => {
    injectFitButton();
    const win = systemMapWindow();
    if (win) setTimeout(() => applyZoom(win, state.mapZoom), 80);
  });

  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    injectFitButton();
  });
})();
