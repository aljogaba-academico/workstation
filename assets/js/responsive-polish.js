(() => {
  const coarse = () => window.matchMedia?.('(pointer: coarse)').matches;

  // On touch devices, windows behave like panels rather than draggable desktop windows.
  // Capture phase prevents the core drag handler from starting while preserving controls.
  document.addEventListener('pointerdown', event => {
    if (!coarse()) return;
    const titlebar = event.target.closest('.window-titlebar');
    if (!titlebar || event.target.closest('.window-control')) return;
    event.stopImmediatePropagation();
  }, true);

  document.addEventListener('pointermove', event => {
    if (!coarse()) return;
    if (event.target.closest('.window-titlebar')) event.stopImmediatePropagation();
  }, true);

  // Keep open windows inside the current visual viewport after orientation/viewport changes.
  function normalizeMobileWindows() {
    if (window.innerWidth > 820) return;
    document.querySelectorAll('.os-window').forEach(win => {
      if (win.classList.contains('maximized')) return;
      win.style.left = '8px';
      win.style.top = '8px';
    });
  }

  let resizeTimer = null;
  function queueNormalize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(normalizeMobileWindows, 80);
  }

  window.addEventListener('resize', queueNormalize, { passive: true });
  window.addEventListener('orientationchange', queueNormalize, { passive: true });
  window.visualViewport?.addEventListener('resize', queueNormalize, { passive: true });
  document.addEventListener('DOMContentLoaded', normalizeMobileWindows);
})();
