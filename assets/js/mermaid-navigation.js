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
      <small>Rueda: navegar · Shift + rueda: horizontal · arrastrar: mover mapa</small>`;

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
      if (!hasHorizontalOverflow && !hasVerticalOverflow) return;

      const dx = event.deltaX || 0;
      const dy = event.deltaY || 0;

      if (event.shiftKey && hasHorizontalOverflow) {
        event.preventDefault();
        viewport.scrollLeft += dy || dx;
        return;
      }

      // Trackpads often send a dominant horizontal delta; honor it directly.
      if (hasHorizontalOverflow && Math.abs(dx) > Math.abs(dy)) {
        event.preventDefault();
        viewport.scrollLeft += dx;
        return;
      }

      // Keep the wheel inside the Mermaid viewport while there is vertical room.
      if (hasVerticalOverflow && Math.abs(dy) >= Math.abs(dx)) {
        const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        const canMoveDown = dy > 0 && viewport.scrollTop < maxTop - 1;
        const canMoveUp = dy < 0 && viewport.scrollTop > 1;
        if (canMoveDown || canMoveUp) {
          event.preventDefault();
          viewport.scrollTop += dy;
          return;
        }
      }

      // Once vertical movement is exhausted, a wide diagram uses the same wheel
      // motion for horizontal panning instead of leaking immediately to the window.
      if (hasHorizontalOverflow && Math.abs(dy) >= Math.abs(dx)) {
        const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const canMoveRight = dy > 0 && viewport.scrollLeft < maxLeft - 1;
        const canMoveLeft = dy < 0 && viewport.scrollLeft > 1;
        if (canMoveRight || canMoveLeft) {
          event.preventDefault();
          viewport.scrollLeft += dy;
        }
      }
    }, { passive: false });
  }

  function bindDragPan(viewport) {
    if (viewport.dataset.mermaidDragBound === '1') return;
    viewport.dataset.mermaidDragBound = '1';

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    viewport.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button,a,input,select,textarea')) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = viewport.scrollLeft;
      startTop = viewport.scrollTop;
      moved = false;
      viewport.setPointerCapture?.(pointerId);
      viewport.classList.add('is-panning');
    });

    viewport.addEventListener('pointermove', event => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      viewport.scrollLeft = startLeft - dx;
      viewport.scrollTop = startTop - dy;
      event.preventDefault();
    });

    const endPan = event => {
      if (pointerId !== event.pointerId) return;
      viewport.releasePointerCapture?.(pointerId);
      pointerId = null;
      viewport.classList.remove('is-panning');
    };
    viewport.addEventListener('pointerup', endPan);
    viewport.addEventListener('pointercancel', endPan);

    viewport.addEventListener('click', event => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);
  }

  function enhance(viewport) {
    if (!(viewport instanceof HTMLElement)) return;
    bindWheel(viewport);
    bindDragPan(viewport);
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
    document.querySelectorAll(VIEWPORT_SELECTOR).forEach(enhance);
  });

  document.addEventListener('DOMContentLoaded', () => {
    scan();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
