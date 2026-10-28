(() => {
  const VIEWPORT_SELECTOR = [
    '.map-canvas[data-mode="architecture"]',
    '.mission-route-map',
    '.module-infrastructure-map',
    '.professional-ecosystem-map'
  ].join(',');

  const STAGE_SELECTOR = '.mermaid-stage, .mission-mermaid-stage, .module-mermaid-stage, .professional-ecosystem-stage';

  function clampZoom(value) {
    return Math.min(1.6, Math.max(.35, Math.round(value * 100) / 100));
  }

  function stageFor(viewport) {
    return viewport.querySelector(STAGE_SELECTOR);
  }

  function currentZoom(viewport) {
    const stage = stageFor(viewport);
    if (!stage) return 1;
    const inline = Number.parseFloat(stage.style.zoom || '');
    if (Number.isFinite(inline) && inline > 0) return inline;
    const stored = Number.parseFloat(viewport.dataset.mermaidZoom || '');
    return Number.isFinite(stored) && stored > 0 ? stored : 1;
  }

  function setZoom(viewport, zoom) {
    const stage = stageFor(viewport);
    if (!stage) return;
    const next = clampZoom(zoom);
    stage.style.zoom = next;
    viewport.dataset.mermaidZoom = String(next);

    if (viewport.matches('.map-canvas[data-mode="architecture"]') && typeof state !== 'undefined') {
      state.mapZoom = next;
    }

    const shell = viewport.closest('.map-shell, .mission-detail, .module-infrastructure-detail, .professional-ecosystem-shell');
    shell?.querySelectorAll('[data-mermaid-nav-label]').forEach(label => {
      label.textContent = `${Math.round(next * 100)}%`;
    });

    if (viewport.matches('.map-canvas[data-mode="architecture"]')) {
      const nativeLabel = viewport.closest('.map-shell')?.querySelector('[data-zoom-label]');
      if (nativeLabel) nativeLabel.textContent = `${Math.round(next * 100)}%`;
    }
  }

  function fit(viewport) {
    const stage = stageFor(viewport);
    const svg = stage?.querySelector('svg');
    if (!stage || !svg) return;

    stage.style.zoom = 1;
    const naturalWidth = Math.max(svg.getBoundingClientRect().width, 1);
    const availableWidth = Math.max(viewport.clientWidth - 32, 1);
    const zoom = Math.min(1, availableWidth / naturalWidth);
    setZoom(viewport, zoom);
    viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }

  function reset(viewport) {
    setZoom(viewport, 1);
    viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }

  function makeToolbar(viewport) {
    if (viewport.dataset.mermaidNavToolbar === '1') return;

    // Professional Ecosystem already has a dedicated toolbar with the same controls.
    if (viewport.matches('.professional-ecosystem-map')) {
      viewport.dataset.mermaidNavToolbar = '1';
      return;
    }

    // System Map already has +/- controls; add only the missing reset/FIT actions.
    if (viewport.matches('.map-canvas[data-mode="architecture"]')) {
      const toolbar = viewport.closest('.map-shell')?.querySelector('.map-toolbar');
      if (toolbar && !toolbar.querySelector('[data-mermaid-system-fit]')) {
        const resetButton = document.createElement('button');
        resetButton.className = 'retro-button compact';
        resetButton.dataset.mermaidSystemReset = '1';
        resetButton.textContent = '100%';
        resetButton.title = 'Restablecer escala';
        resetButton.addEventListener('click', () => reset(viewport));

        const fitButton = document.createElement('button');
        fitButton.className = 'retro-button compact';
        fitButton.dataset.mermaidSystemFit = '1';
        fitButton.textContent = 'FIT';
        fitButton.title = 'Ajustar diagrama al ancho visible';
        fitButton.addEventListener('click', () => fit(viewport));

        toolbar.append(resetButton, fitButton);
      }
      viewport.dataset.mermaidNavToolbar = '1';
      return;
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'mermaid-nav-toolbar';
    toolbar.dataset.mermaidNav = '1';
    toolbar.innerHTML = `
      <span>MAP VIEW</span>
      <button class="retro-button compact" data-mermaid-nav-action="out" aria-label="Alejar diagrama">−</button>
      <span data-mermaid-nav-label>100%</span>
      <button class="retro-button compact" data-mermaid-nav-action="in" aria-label="Acercar diagrama">+</button>
      <button class="retro-button compact" data-mermaid-nav-action="reset">100%</button>
      <button class="retro-button compact" data-mermaid-nav-action="fit">FIT</button>
      <small>Rueda: desplazamiento · Shift + rueda: horizontal</small>`;

    toolbar.addEventListener('click', event => {
      const action = event.target.closest('[data-mermaid-nav-action]')?.dataset.mermaidNavAction;
      if (!action) return;
      if (action === 'fit') return fit(viewport);
      if (action === 'reset') return reset(viewport);
      const delta = action === 'in' ? .1 : -.1;
      setZoom(viewport, currentZoom(viewport) + delta);
    });

    viewport.insertAdjacentElement('beforebegin', toolbar);
    viewport.dataset.mermaidNavToolbar = '1';
  }

  function bindWheel(viewport) {
    if (viewport.dataset.mermaidWheelBound === '1') return;
    viewport.dataset.mermaidWheelBound = '1';

    viewport.addEventListener('wheel', event => {
      const hasHorizontalOverflow = viewport.scrollWidth > viewport.clientWidth + 2;
      const hasVerticalOverflow = viewport.scrollHeight > viewport.clientHeight + 2;

      // Native vertical scrolling remains intact when the diagram is actually tall.
      // Shift + wheel always pans horizontally. For wide/short diagrams, the normal
      // wheel is translated to horizontal panning so a mouse can navigate them.
      if (event.shiftKey && hasHorizontalOverflow) {
        event.preventDefault();
        viewport.scrollLeft += event.deltaY || event.deltaX;
        return;
      }

      if (!hasVerticalOverflow && hasHorizontalOverflow && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
        event.preventDefault();
        viewport.scrollLeft += event.deltaY;
      }
    }, { passive: false });
  }

  function enhance(viewport) {
    if (!(viewport instanceof HTMLElement)) return;
    bindWheel(viewport);
    if (stageFor(viewport)?.querySelector('svg')) makeToolbar(viewport);
  }

  function scan(root = document) {
    if (root instanceof Element && root.matches(VIEWPORT_SELECTOR)) enhance(root);
    root.querySelectorAll?.(VIEWPORT_SELECTOR).forEach(enhance);
  }

  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) scan(node);
    }));
    // Mermaid replaces placeholder contents asynchronously; rescan known viewports.
    document.querySelectorAll(VIEWPORT_SELECTOR).forEach(enhance);
  });

  document.addEventListener('DOMContentLoaded', () => {
    scan();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
