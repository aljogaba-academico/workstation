(() => {
  function closeStartMenuLocal() {
    const menu = document.querySelector("#startMenu");
    const button = document.querySelector("#startButton");
    menu?.classList.add("is-hidden");
    button?.classList.remove("active");
    button?.setAttribute("aria-expanded", "false");
  }

  function emergencyHtml() {
    return `
      <div class="emergency-protocol-panel">
        <p class="eyebrow">SYSTEM / EMERGENCY PROTOCOL</p>
        <h2>Self Destruct Simulation</h2>
        <p>Controlled Easter egg. This sequence is theatrical only and cannot modify project data, repositories, external systems or credentials.</p>
        <div class="emergency-sector emergency-sector-standalone">
          <strong>Protected control</strong>
          <p>Lift the safety cover to expose the initiation control.</p>
          <button class="emergency-cover" data-emergency-cover>▰ LIFT SAFETY COVER</button>
          <span data-emergency-slot></span>
        </div>
      </div>`;
  }

  function openEmergencyProtocol() {
    closeStartMenuLocal();
    createWindow({
      id: "emergency-protocol",
      title: "Emergency Protocol / Simulation",
      icon: "☢",
      width: 590,
      height: 410,
      html: emergencyHtml()
    });
  }

  function injectEmergencyStartEntry() {
    const startBody = document.querySelector("#startMenu .start-menu-body");
    const reboot = startBody?.querySelector('[data-launch="reboot"]');
    if (!startBody || !reboot || document.querySelector("#emergencyProtocolStart")) return;
    const button = document.createElement("button");
    button.id = "emergencyProtocolStart";
    button.className = "emergency-start-button";
    button.innerHTML = "☢ Emergency Protocol";
    button.addEventListener("click", openEmergencyProtocol);
    reboot.insertAdjacentElement("beforebegin", button);
  }

  function cleanSettings() {
    document.querySelectorAll(".deep-settings .emergency-sector").forEach(el => el.remove());
  }

  const observer = new MutationObserver(() => {
    injectEmergencyStartEntry();
    cleanSettings();
  });

  document.addEventListener("DOMContentLoaded", () => {
    injectEmergencyStartEntry();
    cleanSettings();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
