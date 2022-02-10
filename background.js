chrome.runtime.onMessage.addListener((request) => {
  if (request === "uninstall") {
    chrome.management.uninstallSelf({ showConfirmDialog: false });
  }
});
