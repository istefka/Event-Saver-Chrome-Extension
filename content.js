// Content script for extracting event information
function getMetaContent(name) {
  const selectors = [
    `meta[name="${name}"]`,
    `meta[property="${name}"]`,
    `meta[property="og:${name}"]`,
    `meta[name="og:${name}"]`,
    `meta[property="event:${name}"]`,
    `meta[name="event:${name}"]`,
    `meta[property="twitter:${name}"]`,
    `meta[name="twitter:${name}"]`
  ];

  for (const selector of selectors) {
    const meta = document.querySelector(selector);
    if (meta) {
      return meta.getAttribute('content');
    }
  }
  return null;
}

function extractEventbriteInfo() {
  const eventInfo = {
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
    price: {
      min: 0,
      max: 0
    },
    organizer: {
      id: '',
      name: '',
      imageUrl: ''
    },
    categories: [],
    status: 'pending'
  };

  // Get location from the DOM - specifically under location-heading
  const locationSection = document.querySelector('[id="location-heading"]');
  if (locationSection) {
    const locationContainer = locationSection.closest('section');
    if (locationContainer) {
      // Get venue name
      const venueNameElement = locationContainer.querySelector('.location-info__address-text');
      if (venueNameElement) {
        eventInfo.location.name = venueNameElement.textContent.trim();
      }

      // Get full address
      const addressText = locationContainer.querySelector('.location-info__address');
      if (addressText) {
        const textNodes = Array.from(addressText.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0);
        eventInfo.location.address = textNodes.join(', ');
      }
    }
  }

  // Get organizer information from the "Organizer profile" section
  const organizerSection = document.querySelector('.listing-organizer');
  if (organizerSection) {
    const organizerNameElement = organizerSection.querySelector('.descriptive-organizer-info-mobile__name-link');
    if (organizerNameElement) {
      eventInfo.organizer.name = organizerNameElement.textContent.trim();
    }
  }

  // Get meta information
  eventInfo.title = getMetaContent('og:title') || document.title;
  eventInfo.description = getMetaContent('og:description') || '';
  eventInfo.imageUrl = getMetaContent('og:image') || '';
  eventInfo.startDate = getMetaContent('event:start_time') || '';
  eventInfo.endDate = getMetaContent('event:end_time') || '';
  
  // Get location from meta tags if not found in DOM
  if (!eventInfo.location.name || !eventInfo.location.address) {
    const twitterLocation = getMetaContent('twitter:data1');
    if (twitterLocation) {
      const [venueName, address] = twitterLocation.split(',');
      if (!eventInfo.location.name) {
        eventInfo.location.name = venueName.trim();
      }
      if (!eventInfo.location.address) {
        eventInfo.location.address = address.trim();
      }
    }
  }

  // Get coordinates
  eventInfo.location.latitude = getMetaContent('event:location:latitude') || '';
  eventInfo.location.longitude = getMetaContent('event:location:longitude') || '';

  // Get price information from conversion bar
  const priceContainer = document.querySelector('.conversion-bar-container');
  if (priceContainer) {
    const priceElement = priceContainer.querySelector('.conversion-bar__panel-info');
    if (priceElement) {
      const priceText = priceElement.textContent.trim();
      const priceMatch = priceText.match(/[\d,.]+/g);
      if (priceMatch) {
        if (priceMatch.length === 1) {
          // Single price
          eventInfo.price.min = parseFloat(priceMatch[0].replace(',', '.'));
          eventInfo.price.max = eventInfo.price.min;
        } else if (priceMatch.length === 2) {
          // Price range
          eventInfo.price.min = parseFloat(priceMatch[0].replace(',', '.'));
          eventInfo.price.max = parseFloat(priceMatch[1].replace(',', '.'));
        }
      }
    }
  }

  return eventInfo;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveEvent') {
    const eventInfo = extractEventbriteInfo();
    
    // Save to storage
    chrome.storage.local.get(['events'], (result) => {
      const events = result.events || [];
      events.push({
        ...eventInfo,
        createdAt: new Date().toISOString()
      });
      
      chrome.storage.local.set({ events }, () => {
        // Notify popup that event was saved
        chrome.runtime.sendMessage({ 
          action: 'eventSaved',
          event: eventInfo
        });
      });
    });
  }
  return true; // Required for async response
});