# Event Saver Chrome Extension

A Chrome extension that allows you to save events from various websites (Eventbrite, Meetup, Ticketswap) and store them locally in a structured format.

## Features

- Save events from supported websites with one click
- Automatically extracts event details including:
  - Title and description
  - Date and time
  - Location details
  - Price information
  - Categories
  - Organizer information
- View all saved events in a clean, organized popup
- Delete events you no longer need
- Works offline (all data stored locally)

## Installation

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" button in the top left
5. Select the directory containing the extension files
6. The Event Saver extension icon should now appear in your Chrome toolbar

## Usage

1. Navigate to an event page on any supported website:
   - Eventbrite
   - Meetup
   - Ticketswap

2. Click the Event Saver extension icon in your toolbar
3. Click the "Save Current Page" button to save the event
4. The event will be saved and appear in your list

To view saved events:
- Click the extension icon to see all your saved events
- Each event shows key information like title, date, location, and price
- Click the "×" button next to any event to remove it from your list

## Supported Websites

The extension currently supports event extraction from:
- Eventbrite.com
- Meetup.com
- Ticketswap.com

## Data Structure

Events are saved in the following format:
```json
{
  "id": "evt-xxx",
  "title": "Event Title",
  "description": "Event Description",
  "imageUrl": "https://...",
  "startDate": "2024-01-01T10:00:00.000Z",
  "endDate": "2024-01-01T18:00:00.000Z",
  "location": {
    "name": "Venue Name",
    "address": "Venue Address",
    "latitude": "52.3644",
    "longitude": "4.8924"
  },
  "categories": ["Category1", "Category2"],
  "price": {
    "min": 10,
    "max": 20
  },
  "maxAttendees": "100",
  "organizer": {
    "id": "org-xxx",
    "name": "Organizer Name",
    "imageUrl": "https://..."
  },
  "status": "approved",
  "createdAt": "2024-01-01T09:00:00.000Z",
  "updatedAt": "2024-01-01T09:00:00.000Z",
  "source": "extension",
  "shares": 0
}
```

## Development

To modify the extension:
1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Your changes will be immediately available for testing

## Files Structure

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `content.js` - Content script for extracting event data
- `icons/` - Extension icons in various sizes

## Storage

The extension uses Chrome's local storage to save events, which means:
- Events persist between browser sessions
- Data is stored locally on your machine
- No internet connection required to view saved events
- Storage is limited to Chrome's local storage capacity