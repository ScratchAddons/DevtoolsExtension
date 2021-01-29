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
  document.head.classList.add("griffpatchDevtoolsExtensionEnabled");

  // Wait until <title> element exists to make sure Scratch <style>s were injected,
  // which are necessary for addon.tab.scratchClass() calls.
  const titleObserver = new MutationObserver(() => {
    if (document.querySelector("title")) {
      const script = document.createElement("script");
      script.id = "devtools-extension-module";
      script.setAttribute("data-path", chrome.runtime.getURL(""));
      script.type = "module";
      script.src = chrome.runtime.getURL("inject/run-addon.js");
      document.head.appendChild(script);
      titleObserver.disconnect();
    }
  });
  titleObserver.observe(document.head, { childList: true });
}
