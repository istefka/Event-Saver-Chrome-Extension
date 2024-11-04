export function extractEventbriteInfo() {
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
    url: ''
  };

  // Get canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    eventInfo.url = canonicalLink.href;
  }

  // Primary: Meta tags
  eventInfo.title = getMetaContent('og:title') || 
                   getMetaContent('twitter:title') || 
                   document.title;

  eventInfo.description = getMetaContent('og:description') || 
                         getMetaContent('twitter:description') ||
                         getMetaContent('description');

  eventInfo.imageUrl = getMetaContent('og:image') || 
                      getMetaContent('twitter:image');

  // Get dates from meta tags
  eventInfo.startDate = getMetaContent('event:start_time');
  eventInfo.endDate = getMetaContent('event:end_time');

  // Get location from meta tags
  const latitude = getMetaContent('event:location:latitude');
  const longitude = getMetaContent('event:location:longitude');
  
  if (latitude && longitude) {
    eventInfo.location.latitude = latitude;
    eventInfo.location.longitude = longitude;
  }

  // Get location name and address from meta tags
  const twitterLocation = getMetaContent('twitter:data1');
  if (twitterLocation) {
    const [venueName, address] = twitterLocation.split(',');
    eventInfo.location.name = venueName.trim();
    eventInfo.location.address = address.trim();
  }

  // Secondary: JSON-LD data (fallback)
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      
      // Only use JSON-LD data if meta tags didn't provide the information
      if (!eventInfo.title) eventInfo.title = data.name;
      if (!eventInfo.description) eventInfo.description = data.description;
      if (!eventInfo.startDate) eventInfo.startDate = data.startDate;
      if (!eventInfo.endDate) eventInfo.endDate = data.endDate;
      
      if (data.location && !eventInfo.location.name) {
        eventInfo.location.name = data.location.name;
        if (data.location.address) {
          eventInfo.location.address = [
            data.location.address.streetAddress,
            data.location.address.addressLocality,
            data.location.address.addressRegion,
            data.location.address.postalCode,
            data.location.address.addressCountry
          ].filter(Boolean).join(', ');
        }
      }

      // Get price information from offers
      if (data.offers) {
        const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
        const prices = offers
          .map(offer => {
            if (offer.price) return parseFloat(offer.price);
            if (offer.lowPrice) return parseFloat(offer.lowPrice);
            if (offer.highPrice) return parseFloat(offer.highPrice);
            return null;
          })
          .filter(price => !isNaN(price) && price !== null);

        if (prices.length > 0) {
          eventInfo.price.min = Math.min(...prices);
          eventInfo.price.max = Math.max(...prices);
        }
      }

      // Get organizer information
      if (data.organizer) {
        eventInfo.organizer.name = data.organizer.name;
        eventInfo.organizer.url = data.organizer.url;
      }
    } catch (e) {
      console.error('Error parsing Eventbrite JSON-LD:', e);
    }
  }

  // Get categories from breadcrumbs
  const breadcrumbs = document.querySelectorAll('.tags-link');
  if (breadcrumbs.length > 0) {
    eventInfo.categories = Array.from(breadcrumbs)
      .map(link => link.textContent.trim())
      .filter(Boolean);
  }

  return eventInfo;
}