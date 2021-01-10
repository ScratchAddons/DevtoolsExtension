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
}
