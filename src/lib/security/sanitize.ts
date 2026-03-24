export function sanitizeText(input: string): string {
  return input
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeEmail(input: string): string {
  return sanitizeText(input).toLowerCase();
}
