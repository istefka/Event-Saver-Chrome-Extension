export function extractMeetupInfo() {
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
    }
  };

  // Primary: JSON-LD data
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      eventInfo.title = data.name || '';
      eventInfo.description = data.description || '';
      eventInfo.startDate = data.startDate || '';
      eventInfo.endDate = data.endDate || '';
      
      if (data.location) {
        eventInfo.location.name = data.location.name || '';
        eventInfo.location.address = data.location.address?.streetAddress || '';
        eventInfo.location.latitude = data.location.geo?.latitude || '';
        eventInfo.location.longitude = data.location.geo?.longitude || '';
      }
    } catch (e) {
      console.error('Error parsing Meetup JSON-LD:', e);
    }
  }

  // Secondary: DOM elements specific to Meetup
  
  // Title
  if (!eventInfo.title) {
    const titleElement = document.querySelector('[data-testid="event-title"], .eventTitle');
    if (titleElement) {
      eventInfo.title = titleElement.textContent.trim();
    }
  }

  // Date/Time
  const dateElement = document.querySelector('[data-testid="event-datetime"], .eventDateTime');
  if (dateElement) {
    const startTimeEl = dateElement.querySelector('[data-testid="event-start-time"]');
    const endTimeEl = dateElement.querySelector('[data-testid="event-end-time"]');
    
    if (startTimeEl) {
      eventInfo.startDate = parseDate(startTimeEl.getAttribute('datetime'));
    }
    if (endTimeEl) {
      eventInfo.endDate = parseDate(endTimeEl.getAttribute('datetime'));
    }
  }

  // Location
  const venueElement = document.querySelector('[data-testid="venue"], .venueDisplay');
  if (venueElement) {
    const venueName = venueElement.querySelector('[data-testid="venue-name"]');
    const venueAddress = venueElement.querySelector('[data-testid="venue-address"]');
    
    if (venueName) {
      eventInfo.location.name = venueName.textContent.trim();
    }
    if (venueAddress) {
      eventInfo.location.address = venueAddress.textContent.trim();
    }
  }

  // Price
  const priceElement = document.querySelector('[data-testid="event-price"], .eventPrice');
  if (priceElement) {
    const priceText = priceElement.textContent.trim();
    const priceMatch = priceText.match(/[\d,.]+/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[0].replace(',', '.'));
      eventInfo.price.min = price;
      eventInfo.price.max = price;
    }
  }

  // Organizer
  const organizerElement = document.querySelector('[data-testid="group-name"], .groupName');
  if (organizerElement) {
    eventInfo.organizer.name = organizerElement.textContent.trim();
  }

  const organizerImageElement = document.querySelector('[data-testid="group-photo"], .groupPhoto img');
  if (organizerImageElement) {
    eventInfo.organizer.imageUrl = organizerImageElement.src;
  }

  // Tertiary: Meta tags (fallback)
  if (!eventInfo.imageUrl) {
    eventInfo.imageUrl = getMetaContent('og:image') || 
                        getMetaContent('twitter:image');
  }

  if (!eventInfo.description && !jsonLd) {
    eventInfo.description = getMetaContent('og:description') || 
                           getMetaContent('description');
  }

  return eventInfo;
}