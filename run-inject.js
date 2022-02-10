if (document.head) onHeadAvailable();
else {
  const observer = new MutationObserver(() => {
    if (document.head) {
      onHeadAvailable();
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true });
}

function onHeadAvailable() {
  const script = document.createElement("script");
  script.id = "devtools-extension-module";
  script.setAttribute("data-path", chrome.runtime.getURL(""));
  script.type = "module";
  script.src = chrome.runtime.getURL("inject/run-addon.js");
  document.head.appendChild(script);
  script.setAttribute("data-version", chrome.runtime.getManifest().version);
}

window.addEventListener(
  "scratchAddonsDevtoolsAddonStopped",
  () => {
    // Only run once per month
    const month = new Date().getUTCMonth() + 1;
    const year = new Date().getUTCFullYear();
    const localStorageKey = `scratchAddonsDevtoolsUninstalled-${year}-${month}`;
    if (!localStorage.getItem(localStorageKey)) {
      localStorage.setItem(localStorageKey, "1");
      chrome.runtime.sendMessage("uninstall");
    }
  },
  { once: true }
);
