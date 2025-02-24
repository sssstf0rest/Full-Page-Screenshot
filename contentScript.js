(async function() {
    // Scroll to the very top first
    window.scrollTo(0, 0);
  
    // Allow the page a moment to render at the top
    await new Promise(resolve => setTimeout(resolve, 300));
  
    let docWidth = document.documentElement.scrollWidth;
    let docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
  
    // Array to store each partial screenshot plus its scroll offset
    const screenshots = [];
  
    let currentScroll = 0;
    while (true) {
      // Scroll to the current position
      window.scrollTo(0, currentScroll);
  
      // Wait briefly for the scroll to finish rendering
      await new Promise(resolve => setTimeout(resolve, 300));
  
      // Capture the visible portion
      const dataUrl = await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'CAPTURE_VIEWPORT' }, (response) => {
          resolve(response.screenshot);
        });
      });
  
      screenshots.push({ dataUrl, y: currentScroll });
  
      // Update the scrollable height in case the page grows
      docHeight = document.documentElement.scrollHeight;
  
      // Move to the next "slice"
      currentScroll += viewportHeight;
  
      // If we've scrolled beyond the bottom, break out
      if (currentScroll >= docHeight) {
        break;
      }
    }
  
    // Create a canvas big enough for the full page
    const canvas = document.createElement('canvas');
    canvas.width = docWidth;
    canvas.height = docHeight;
    const ctx = canvas.getContext('2d');
  
    // Draw each captured slice onto the canvas at the correct vertical offset
    for (const shot of screenshots) {
      const img = document.createElement('img');
      img.src = shot.dataUrl;
  
      // Wait for the image to load before drawing
      await new Promise(resolve => {
        img.onload = resolve;
      });
  
      ctx.drawImage(img, 0, shot.y);
    }
  
    // Convert the entire canvas to a base64-encoded PNG
    const finalScreenshot = canvas.toDataURL('image/png');
  
    // Automatically trigger a download of the screenshot
    const link = document.createElement('a');
    link.download = 'full-page-screenshot.png';
    link.href = finalScreenshot;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    // Scroll back to the top (optional)
    window.scrollTo(0, 0);
  })();
  