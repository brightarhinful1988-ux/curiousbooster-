if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("service-worker.js", document.baseURI);
    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.error("Could not enable offline app support.", error);
    });
  });
}

const installButton = document.querySelector("#install-app-button");
const installHelp = document.querySelector("#install-app-help");
const isPublicDemo = document.documentElement.dataset.publicDemo === "true";
const standaloneDisplay = window.matchMedia("(display-mode: standalone)");
const isInstalled = () => standaloneDisplay.matches || navigator.standalone === true;
let installPrompt;

if (installButton) {
  installButton.hidden = isInstalled() ? true : !isPublicDemo;

  standaloneDisplay.addEventListener?.("change", (event) => {
    if (event.matches) {
      installButton.hidden = true;
      if (installHelp) {
        installHelp.hidden = true;
      }
    }
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = isInstalled();
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      if (installHelp) {
        installHelp.hidden = false;
      }
      return;
    }
    installButton.disabled = true;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      installPrompt = null;
      if (choice.outcome === "accepted") {
        installButton.hidden = true;
      } else if (installHelp) {
        installHelp.hidden = false;
      }
    } catch (error) {
      console.error("Could not open the app installation prompt.", error);
      installPrompt = null;
      if (installHelp) {
        installHelp.hidden = false;
      }
    } finally {
      installButton.disabled = false;
    }
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.hidden = true;
    if (installHelp) {
      installHelp.hidden = true;
    }
  });
}
