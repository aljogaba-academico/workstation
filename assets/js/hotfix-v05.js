(() => {
  // v0.5 hotfix: opening About previously triggered a recursive MutationObserver loop.
  // The Deep Space observer watches childList changes and rewrites `.about-badge`.
  // Rendering the version badge with an existing safe class avoids that mutation target.
  window.openAbout = function() {
    createWindow({
      id: "about",
      title: "About ALJOGABA OS",
      icon: "ⓘ",
      width: 640,
      height: 440,
      html: `
        <div class="about-wrap">
          <span class="system-code">ALJOGABA OS · v0.5</span>
          <h2>Research Workstation</h2>
          <p>Estación de mando para ubicar sistemas, misiones, herramientas, infraestructura, tecnologías y salidas dentro del ecosistema científico.</p>
          <p><strong>Principio:</strong> la workstation no reemplaza las fuentes canónicas. Indica dónde están, cómo se relacionan y por dónde entrar.</p>
          <div class="telemetry-flow compact-flow">${["SYSTEMS","MISSIONS","TOOLS","INFRA","OUTPUTS"].map((x, i) => `<span><i></i>${x}</span>${i < 4 ? `<b></b>` : ""}`).join("")}</div>
          <p><small>GitHub Pages es público. No se almacenan credenciales, tokens, API keys, contraseñas, MFA ni rutas administrativas sensibles.</small></p>
        </div>`
    });
  };
})();
