// background.js
chrome.action.onClicked.addListener((tab) => {
  // Only proceed if it's a normal page
  if (!/^https?:\/\//.test(tab.url)) {
    console.error("Cannot capture screenshot on restricted URL:", tab.url);
    return;
  }

  chrome.debugger.attach({ tabId: tab.id }, "1.3", () => {
    if (chrome.runtime.lastError) {
      console.error("Error attaching debugger:", chrome.runtime.lastError.message);
      return;
    }
    chrome.debugger.sendCommand({ tabId: tab.id }, "Page.enable", {}, () => {
      if (chrome.runtime.lastError) {
        console.error("Error enabling page:", chrome.runtime.lastError.message);
        chrome.debugger.detach({ tabId: tab.id });
        return;
      }
      chrome.debugger.sendCommand(
        { tabId: tab.id },
        "Page.captureScreenshot",
        { captureBeyondViewport: true },
        (res) => {
          if (chrome.runtime.lastError) {
            console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
          } else if (!res || !res.data) {
            console.error("No screenshot data returned.");
          } else {
            const url = "data:image/png;base64," + res.data;
            chrome.tabs.create({ url });
          }
          chrome.debugger.detach({ tabId: tab.id });
        }
      );
    });
  });
});
