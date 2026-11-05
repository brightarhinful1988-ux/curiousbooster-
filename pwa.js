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
const installReportNote = document.querySelector(".install-app-report-note");
const isPublicDemo = document.documentElement.dataset.publicDemo === "true";
const installationReportUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfNk6Mc9DG4WV4Y8wLnEANXO6Ny8EBt9bycGQk_Jo_BgVz9EQ/viewform?usp=header";
const standaloneDisplay = window.matchMedia("(display-mode: standalone)");
const isInstalled = () => standaloneDisplay.matches || navigator.standalone === true;
let installPrompt;
let installationHandled = false;

if (installReportNote) {
  installReportNote.hidden = !isPublicDemo;
}

function handleAppInstalled() {
  installPrompt = null;
  if (installButton) {
    installButton.hidden = true;
  }
  if (installHelp) {
    installHelp.hidden = true;
  }
  if (isPublicDemo && !installationHandled) {
    installationHandled = true;
    window.location.href = installationReportUrl;
  }
}

if (installButton) {
  installButton.hidden = isInstalled();

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
        handleAppInstalled();
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

  window.addEventListener("appinstalled", handleAppInstalled);
}
