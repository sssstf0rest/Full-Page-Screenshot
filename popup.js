document.getElementById('captureBtn').addEventListener('click', async () => {
    // Find the currently active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    // Inject our content script into that tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    });
  });
  