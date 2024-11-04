// Popup script for managing saved events
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const eventList = document.getElementById('eventList');
  const saveButton = document.getElementById('save-manual');
  const eventCount = document.getElementById('event-count');
  const modal = document.getElementById('eventModal');
  const closeModal = document.getElementById('closeModal');
  const cancelEdit = document.getElementById('cancelEdit');
  const eventForm = document.getElementById('eventForm');
  let currentEventIndex = null;

  // Initialize save button click handler
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'saveEvent' });
        }
      });
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'No date';
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  }

  function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  function formatPrice(price) {
    if (!price.min && !price.max) return 'Free';
    if (price.min === price.max) return `€${price.min}`;
    return `€${price.min} - €${price.max}`;
  }

  function downloadJson(event) {
    const jsonString = JSON.stringify(event, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function createEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">No events saved yet</div>
        <div class="empty-state-text">Visit an event page and click "Save Current Event" to get started</div>
      </div>
    `;
  }

  function showModal(event, index) {
    currentEventIndex = index;
    
    // Fill form with event data
    document.getElementById('title').value = event.title || '';
    document.getElementById('description').value = event.description || '';
    document.getElementById('startDate').value = formatDateForInput(event.startDate);
    document.getElementById('endDate').value = formatDateForInput(event.endDate);
    document.getElementById('imageUrl').value = event.imageUrl || '';
    document.getElementById('venueName').value = event.location.name || '';
    document.getElementById('address').value = event.location.address || '';
    document.getElementById('latitude').value = event.location.latitude || '';
    document.getElementById('longitude').value = event.location.longitude || '';
    document.getElementById('minPrice').value = event.price.min || '';
    document.getElementById('maxPrice').value = event.price.max || '';
    document.getElementById('organizerName').value = event.organizer.name || '';
    document.getElementById('categories').value = (event.categories || []).join(', ');

    modal.style.display = 'block';
  }

  function hideModal() {
    modal.style.display = 'none';
    currentEventIndex = null;
    eventForm.reset();
  }

  function removeEvent(index) {
    chrome.storage.local.get(['events'], (result) => {
      const events = result.events || [];
      events.splice(index, 1);
      chrome.storage.local.set({ events }, displayEvents);
    });
  }

  function displayEvents() {
    chrome.storage.local.get(['events'], (result) => {
      const events = result.events || [];
      
      if (eventCount) {
        eventCount.textContent = events.length;
      }
      
      if (events.length === 0) {
        eventList.innerHTML = createEmptyState();
        return;
      }

      eventList.innerHTML = '';

      events.forEach((event, index) => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-card';
        eventDiv.addEventListener('click', () => showModal(event, index));

        const categoriesHtml = event.categories && event.categories.length > 0 
          ? `<div class="categories">${event.categories.map(cat => `<span class="category">${cat}</span>`).join('')}</div>` 
          : '';

        eventDiv.innerHTML = `
          ${event.imageUrl ? `
            <div class="event-image-container">
              <img src="${event.imageUrl}" class="event-image" alt="${event.title}">
            </div>
          ` : ''}
          <div class="event-content">
            <div class="event-header">
              <div class="event-title">${event.title}</div>
              <div class="event-actions">
                <button class="btn download-btn" data-index="${index}" title="Download JSON">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </button>
                <button class="btn delete-btn" data-index="${index}" title="Delete">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="event-details">
              <div class="detail-row">
                <svg class="detail-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                ${formatDate(event.startDate)}
              </div>
              ${event.location.name ? `
                <div class="detail-row">
                  <svg class="detail-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  ${event.location.name}
                </div>
              ` : ''}
              ${event.location.address ? `
                <div class="detail-row">
                  <svg class="detail-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  ${event.location.address}
                </div>
              ` : ''}
              ${categoriesHtml}
            </div>
          </div>
        `;

        eventList.appendChild(eventDiv);
      });

      // Add event listeners for both delete and download buttons
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(e.target.closest('.delete-btn').dataset.index);
          removeEvent(index);
        });
      });

      document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(e.target.closest('.download-btn').dataset.index);
          chrome.storage.local.get(['events'], (result) => {
            const events = result.events || [];
            if (index >= 0 && index < events.length) {
              downloadJson(events[index]);
            }
          });
        });
      });
    });
  }

  // Initialize event listeners
  if (closeModal) {
    closeModal.addEventListener('click', hideModal);
  }

  if (cancelEdit) {
    cancelEdit.addEventListener('click', hideModal);
  }

  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      chrome.storage.local.get(['events'], (result) => {
        const events = result.events || [];
        
        if (currentEventIndex !== null && currentEventIndex >= 0 && currentEventIndex < events.length) {
          const updatedEvent = {
            ...events[currentEventIndex],
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            imageUrl: document.getElementById('imageUrl').value,
            location: {
              name: document.getElementById('venueName').value,
              address: document.getElementById('address').value,
              latitude: document.getElementById('latitude').value,
              longitude: document.getElementById('longitude').value
            },
            price: {
              min: parseFloat(document.getElementById('minPrice').value) || 0,
              max: parseFloat(document.getElementById('maxPrice').value) || 0
            },
            organizer: {
              ...events[currentEventIndex].organizer,
              name: document.getElementById('organizerName').value
            },
            categories: document.getElementById('categories').value
              .split(',')
              .map(cat => cat.trim())
              .filter(Boolean)
          };

          events[currentEventIndex] = updatedEvent;
          chrome.storage.local.set({ events }, () => {
            hideModal();
            displayEvents();
          });
        }
      });
    });
  }

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'eventSaved') {
      displayEvents();
    }
  });

  // Initial display
  displayEvents();
});