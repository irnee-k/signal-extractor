document.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setup-screen');
    const activeScreen = document.getElementById('active-screen');
    const statusText = document.getElementById('status-text');
    const lastSignalText = document.getElementById('last-signal');
  
    // 1. Load saved settings when popup opens
    chrome.storage.local.get(['consent_status', 'last_signal_log'], (data) => {
      if (data.consent_status === 'ACTIVE' || data.consent_status === 'PAUSED') {
        showActiveScreen(data.consent_status);
      }
      if (data.last_signal_log) {
        lastSignalText.textContent = data.last_signal_log;
      }
    });
  
    // 2. Handle "Start Tracking"
    document.getElementById('btn-start').addEventListener('click', () => {
      // Save Granular Permissions
      const permissions = {
        articles: document.getElementById('perm-articles').checked,
        code: document.getElementById('perm-code').checked,
        video: document.getElementById('perm-video').checked
      };
  
      chrome.storage.local.set({ 
        consent_status: 'ACTIVE',
        permissions: permissions 
      }, () => {
        showActiveScreen('ACTIVE');
      });
    });
  
    // 3. Handle "Pause"
    document.getElementById('btn-pause').addEventListener('click', () => {
      chrome.storage.local.get(['consent_status'], (data) => {
        const newStatus = data.consent_status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        chrome.storage.local.set({ consent_status: newStatus }, () => {
          showActiveScreen(newStatus);
        });
      });
    });
  
    // 4. Handle "Delete Data"
    document.getElementById('btn-delete').addEventListener('click', () => {
      if(confirm("Are you sure? This will wipe your local data.")) {
          // In a real app, we would also call the Backend API DELETE endpoint here.
          chrome.storage.local.clear(() => {
              location.reload(); // Reset UI to start
          });
      }
    });
  
    // Helper to toggle screens
    function showActiveScreen(status) {
      setupScreen.classList.add('hidden');
      activeScreen.classList.remove('hidden');
      
      statusText.textContent = status;
      statusText.className = status === 'ACTIVE' ? 'status-active' : 'status-paused';
      
      const btnPause = document.getElementById('btn-pause');
      btnPause.textContent = status === 'ACTIVE' ? '⏸ Pause Tracking' : '▶ Resume Tracking';
    }
  });