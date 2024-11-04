export function getMetaContent(name) {
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

export function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    // Handle various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    // Try parsing common date formats
    const formats = [
      'YYYY-MM-DD HH:mm',
      'DD/MM/YYYY HH:mm',
      'MM/DD/YYYY HH:mm',
      'YYYY.MM.DD HH:mm'
    ];
    
    for (const format of formats) {
      const parsed = new Date(dateStr.replace(format, 'YYYY-MM-DDTHH:mm:ss'));
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  } catch (e) {
    console.error('Date parsing error:', e);
  }
  return null;
}

export function generateUniqueId(prefix = 'evt') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCanonicalUrl() {
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    return canonical.href;
  }
  
  const ogUrl = getMetaContent('og:url');
  if (ogUrl) {
    return ogUrl;
  }
  
  return window.location.href;
}