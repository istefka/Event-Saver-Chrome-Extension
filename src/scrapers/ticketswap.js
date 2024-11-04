export function extractTicketswapInfo() {
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

  // Primary: DOM elements (Ticketswap relies heavily on data-testid attributes)
  
  // Title
  const titleElement = document.querySelector('[data-testid="event-title"], h1');
  if (titleElement) {
    eventInfo.title = titleElement.textContent.trim();
  }

  // Date
  const dateElement = document.querySelector('[data-testid="event-date"]');
  if (dateElement) {
    const dateStr = dateElement.textContent.trim();
    eventInfo.startDate = parseDate(dateStr);
  }

  // Venue/Location
  const venueElement = document.querySelector('[data-testid="event-venue"]');
  if (venueElement) {
    const venueName = venueElement.querySelector('[data-testid="venue-name"], h2');
    const venueAddress = venueElement.querySelector('[data-testid="venue-address"]');
    
    if (venueName) {
      eventInfo.location.name = venueName.textContent.trim();
    }
    if (venueAddress) {
      eventInfo.location.address = venueAddress.textContent.trim();
    }
  }

  // Price
  const priceElements = document.querySelectorAll('[data-testid="listing-price"]');
  if (priceElements.length > 0) {
    const prices = Array.from(priceElements)
      .map(el => {
        const match = el.textContent.match(/[\d,.]+/);
        return match ? parseFloat(match[0].replace(',', '.')) : null;
      })
      .filter(price => price !== null);

    if (prices.length > 0) {
      eventInfo.price.min = Math.min(...prices);
      eventInfo.price.max = Math.max(...prices);
    }
  }

  // Image
  const imageElement = document.querySelector('[data-testid="event-image"] img, [class*="event-header"] img');
  if (imageElement) {
    eventInfo.imageUrl = imageElement.src;
  }

  // Description
  const descriptionElement = document.querySelector('[data-testid="event-description"]');
  if (descriptionElement) {
    eventInfo.description = descriptionElement.textContent.trim();
  }

  // Secondary: Meta tags (fallback)
  if (!eventInfo.imageUrl) {
    eventInfo.imageUrl = getMetaContent('og:image');
  }

  if (!eventInfo.description) {
    eventInfo.description = getMetaContent('og:description');
  }

  // Extract organizer (if available)
  const organizerElement = document.querySelector('[data-testid="event-organizer"]');
  if (organizerElement) {
    eventInfo.organizer.name = organizerElement.textContent.trim();
  }

  return eventInfo;
}