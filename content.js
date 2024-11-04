function generateUniqueId() {
  return 'evt-' + Math.random().toString(36).substr(2, 9);
}

function extractEventInfo() {
  const now = new Date().toISOString();
  let eventInfo = {
    id: generateUniqueId(),
    title: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    location: {
      name: '',
      address: '',
      latitude: '',
      longitude: ''
    },
    categories: [],
    price: {
      min: 0,
      max: 0
    },
    maxAttendees: '',
    organizer: {
      id: 'org-' + Math.random().toString(36).substr(2, 9),
      name: '',
      imageUrl: ''
    },
    status: 'approved',
    createdAt: now,
    updatedAt: now,
    source: 'extension',
    shares: 0
  };

  // Eventbrite
  if (window.location.hostname.includes('eventbrite')) {
    eventInfo.title = document.querySelector('.event-title, .eds-event-details__title')?.textContent?.trim();
    eventInfo.description = document.querySelector('.eds-event-details__description')?.textContent?.trim();
    const dateElement = document.querySelector('.eds-event-details__data');
    if (dateElement) {
      const dateText = dateElement.textContent;
      // Parse date text to set startDate and endDate
      try {
        const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          eventInfo.startDate = new Date(dateMatch[1]).toISOString();
          eventInfo.endDate = new Date(dateMatch[1]).toISOString();
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
    eventInfo.location.name = document.querySelector('.eds-venue-details__name')?.textContent?.trim();
    eventInfo.location.address = document.querySelector('.eds-venue-details__address')?.textContent?.trim();
    
    // Extract price if available
    const priceElement = document.querySelector('.eds-ticket-price');
    if (priceElement) {
      const priceText = priceElement.textContent;
      const priceMatch = priceText.match(/\d+/);
      if (priceMatch) {
        eventInfo.price.min = parseInt(priceMatch[0]);
        eventInfo.price.max = parseInt(priceMatch[0]);
      }
    }
  }
  // Meetup
  else if (window.location.hostname.includes('meetup')) {
    eventInfo.title = document.querySelector('h1')?.textContent?.trim();
    eventInfo.description = document.querySelector('[data-testid="event-description"]')?.textContent?.trim();
    const dateElement = document.querySelector('time');
    if (dateElement) {
      const dateStr = dateElement.getAttribute('datetime');
      if (dateStr) {
        eventInfo.startDate = new Date(dateStr).toISOString();
        eventInfo.endDate = new Date(dateStr).toISOString();
      }
    }
    eventInfo.location.name = document.querySelector('[data-testid="venue-name"]')?.textContent?.trim();
    eventInfo.location.address = document.querySelector('[data-testid="venue-address"]')?.textContent?.trim();
  }
  // Ticketswap
  else if (window.location.hostname.includes('ticketswap')) {
    eventInfo.title = document.querySelector('h1')?.textContent?.trim();
    const dateElement = document.querySelector('.event-info time');
    if (dateElement) {
      const dateStr = dateElement.getAttribute('datetime');
      if (dateStr) {
        eventInfo.startDate = new Date(dateStr).toISOString();
        eventInfo.endDate = new Date(dateStr).toISOString();
      }
    }
    eventInfo.location.name = document.querySelector('.event-info .venue-name')?.textContent?.trim();
    eventInfo.location.address = document.querySelector('.event-info .venue-address')?.textContent?.trim();
  }

  // Try to find an image
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) {
    eventInfo.imageUrl = ogImage.getAttribute('content');
  }

  // Try to find categories
  const keywords = document.querySelector('meta[name="keywords"]');
  if (keywords) {
    eventInfo.categories = keywords.getAttribute('content').split(',').map(k => k.trim());
  }

  return eventInfo;
}

function saveEvent(eventInfo) {
  chrome.storage.local.get(['events'], (result) => {
    const events = result.events || [];
    events.push(eventInfo);
    chrome.storage.local.set({ events }, () => {
      chrome.runtime.sendMessage({ action: 'eventSaved' });
      alert('Event saved successfully!');
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveEvent') {
    const eventInfo = extractEventInfo();
    saveEvent(eventInfo);
  }
});