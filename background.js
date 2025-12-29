// In-memory storage for active sessions (temporary tracking)
// Key: URL, Value: { startTime, totalTime, sent }
let activeSessions = {};

const SIGNAL_THRESHOLD_SECONDS = 30; // 30 seconds for testing purposes (Set to 300 for real life)

// 1. Listen for Heartbeats from Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'HEARTBEAT') {
    handleHeartbeat(message.payload);
  }
});

function handleHeartbeat(data) {
  // A. CHECK CONSENT FIRST
  chrome.storage.local.get(['consent_status', 'permissions'], (storage) => {
    
    if (storage.consent_status !== 'ACTIVE') return; // Stop if paused or not set

    const url = data.url;
    
    // Initialize session if new
    if (!activeSessions[url]) {
      activeSessions[url] = { 
        totalTime: 0, 
        title: data.title, 
        lastUpdate: Date.now(),
        signalSent: false
      };
    }

    // Update time (add 5 seconds roughly)
    // In a real app, we calculate exact diff between timestamps to be precise
    activeSessions[url].totalTime += 5; 
    activeSessions[url].lastUpdate = Date.now();

    // B. RULE-BASED PROCESSING
    // Check if we hit the threshold AND haven't sent a signal yet
    if (activeSessions[url].totalTime >= SIGNAL_THRESHOLD_SECONDS && !activeSessions[url].signalSent) {
      
      // Check Granular Permissions (Articles vs Code)
      if (isCodeSite(url) && !storage.permissions.code) return;
      if (isArticleSite(url) && !storage.permissions.articles) return;

      // C. CREATE SIGNAL
      const signal = {
        type: 'LEARNING_ACTIVITY',
        source: new URL(url).hostname,
        sanitized_title: data.title, // In real app, run sanitization regex here
        duration: activeSessions[url].totalTime,
        timestamp: new Date().toISOString()
      };

      // D. MOCK "SEND TO BACKEND"
      sendSignalToBackend(signal);

      // Mark as sent so we don't spam signals for the same session
      activeSessions[url].signalSent = true;
    }
  });
}

function sendSignalToBackend(signal) {
  console.log("🚀 SENDING SECURE SIGNAL:", signal);
  
  // For the prototype, we save this text to display it in the Popup UI
  const logMsg = `Logged: ${signal.sanitized_title.substring(0, 20)}... (${signal.duration}s)`;
  chrome.storage.local.set({ last_signal_log: logMsg });

  // --- REAL IMPLEMENTATION ---
  // fetch('https://api.your-startup.com/v1/signals', {
  //   method: 'POST',
  //   headers: { 
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer ' + userToken 
  //   },
  //   body: JSON.stringify(signal)
  // });
}

// Helpers for Rules
function isCodeSite(url) { return url.includes('github.com'); }
function isArticleSite(url) { return url.includes('medium.com') || url.includes('dev.to'); }
