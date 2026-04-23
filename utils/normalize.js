export function normalizeUrl(url) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `https://www.pinterest.com${url}`;
  return url;
}

export function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}
