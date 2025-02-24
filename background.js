chrome.action.onClicked.addListener((tab) => {
  console.log("Extension button clicked on:", tab.url);

  // Avoid capturing screenshots of image-based tabs or previously opened screenshots
  if (tab.url.startsWith("data:image/png") || tab.url.includes("screenshot_viewer.html")) {
    console.error("Preventing recursive screenshot capture.");
    return;
  }

  if (!/^https?:\/\//.test(tab.url)) {
    console.error("Cannot capture screenshot on restricted URL:", tab.url);
    return;
  }

  chrome.debugger.attach({ tabId: tab.id }, "1.3", () => {
    if (chrome.runtime.lastError) {
      console.error("Error attaching debugger:", chrome.runtime.lastError.message);
      return;
    }
    console.log("Debugger attached");

    chrome.debugger.sendCommand({ tabId: tab.id }, "Page.enable", {}, () => {
      if (chrome.runtime.lastError) {
        console.error("Error enabling page:", chrome.runtime.lastError.message);
        chrome.debugger.detach({ tabId: tab.id });
        return;
      }
      console.log("Page enabled");

      chrome.debugger.sendCommand(
        { tabId: tab.id },
        "Page.captureScreenshot",
        { captureBeyondViewport: true },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
          } else if (!response || !response.data) {
            console.error("No screenshot data received.");
          } else {
            const screenshotUrl = "data:image/png;base64," + response.data;
            console.log("Screenshot captured. Opening new tab...");

            // Instead of opening the image directly, show it in a viewer
            chrome.tabs.create({ url: "screenshot_viewer.html?src=" + encodeURIComponent(screenshotUrl) });
          }
          chrome.debugger.detach({ tabId: tab.id });
        }
      );
    });
  });
});
