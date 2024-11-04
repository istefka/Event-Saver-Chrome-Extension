document.addEventListener('DOMContentLoaded', () => {
  const eventList = document.getElementById('eventList');
  const saveButton = document.getElementById('save-manual');

  function formatDate(dateStr) {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function displayEvents() {
    chrome.storage.local.get(['events'], (result) => {
      const events = result.events || [];
      eventList.innerHTML = '';
      
      events.forEach((event, index) => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.innerHTML = `
          <div>
            <strong>${event.title}</strong><br>
            <small>${formatDate(event.startDate)}</small><br>
            <small>${event.location.name || 'No location'}</small><br>
            <small>${event.location.address || ''}</small><br>
            ${event.price.min || event.price.max ? 
              `<small>Price: ${event.price.min} - ${event.price.max}</small><br>` : ''}
            ${event.categories.length ? 
              `<small>Categories: ${event.categories.join(', ')}</small><br>` : ''}
          </div>
          <span class="delete-btn" data-index="${index}">×</span>
        `;
        eventList.appendChild(eventDiv);
      });

      // Add delete event listeners
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          removeEvent(index);
        });
      });
    });
  }

  function removeEvent(index) {
    chrome.storage.local.get(['events'], (result) => {
      const events = result.events || [];
      events.splice(index, 1);
      chrome.storage.local.set({ events }, displayEvents);
    });
  }

  saveButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'saveEvent' });
    });
  });

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'eventSaved') {
      displayEvents();
    }
  });

  displayEvents();
});