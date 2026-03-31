const VISITOR_KEY = 'neos_visitor_id';

function generateVisitorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getVisitorId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) {
    return existing;
  }

  const visitorId = generateVisitorId();
  window.localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}
