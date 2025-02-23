# Full Page Screenshot Chrome Extension

A simple Chrome extension that captures a full-page screenshot by leveraging the DevTools Debugger Protocol.

## Features
- Capture full-page screenshots with a single click.
- Automatically opens a new tab with the captured image.
- Minimal permissions required (`debugger`, `tabs`).

## Installation

1. **Clone or download** this repository.
2. **Open Chrome** and navigate to `chrome://extensions`.
3. **Enable Developer Mode** (toggle in the top-right corner).
4. **Click "Load unpacked"** and select the folder containing `manifest.json` and `background.js`.

## Usage

1. Navigate to any normal webpage (e.g., `https://example.com`).
2. Click the **extension icon** in the toolbar.
3. The extension will capture a full-page screenshot and open it in a new tab.

> **Note:** The extension does not work on restricted pages like `chrome://` or `chrome-extension://`.

## Manifest
```json
{
  "name": "Full Page Screenshot",
  "version": "1.0",
  "description": "Take a full page screenshot via DevTools protocol",
  "manifest_version": 3,
  "permissions": ["debugger", "tabs"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_title": "Capture Full Page Screenshot"
  }
}

### `background.js`
This script listens for the extension button click, captures a full-page screenshot using Chrome's debugging protocol, and opens the image in a new tab.

```js
chrome.action.onClicked.addListener((tab) => {
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
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
          } else if (!response || !response.data) {
            console.error("No screenshot data received.");
          } else {
            const screenshotUrl = "data:image/png;base64," + response.data;
            chrome.tabs.create({ url: screenshotUrl });
          }
          chrome.debugger.detach({ tabId: tab.id });
        }
      );
    });
  });
});


