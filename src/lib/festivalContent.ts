export function getPublicFestivalEventTitle(title?: string | null) {
  return (title || '').replace(/\b(?:lyka|laika)\b/gi, 'LAIKA');
}
