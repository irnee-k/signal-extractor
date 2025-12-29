// A simple "Heartbeat" mechanism.
// We only track if the window is visible (user is actually looking at it).

let lastUrl = location.href;

// Run every 5 seconds
setInterval(() => {
  if (document.visibilityState === 'visible') {
    
    // Send a message to background.js
    chrome.runtime.sendMessage({
      type: 'HEARTBEAT',
      payload: {
        url: location.href,
        title: document.title,
        timestamp: Date.now()
      }
    });

  }
}, 5000);