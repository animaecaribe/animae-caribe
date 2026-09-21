const GOAT_PREMIERE_PATTERN = /official\s+premier(?:e)?\s+of\s+goat/i;

export function getPublicFestivalEventTitle(title?: string | null) {
  if (!title) {
    return '';
  }

  return GOAT_PREMIERE_PATTERN.test(title)
    ? "OFFICIAL OPENING Premiere of Lyka's Wildwood"
    : title;
}
