import type { Partner } from '@/data/partners';
import type { SanityPartner } from '@/sanity/lib/types';

export function normalizeSanityPartners(partners?: SanityPartner[] | null): Partner[] {
  if (!partners?.length) {
    return [];
  }

  return partners
    .filter((partner) => partner.name && partner.logoUrl)
    .map((partner) => ({
      name: partner.name as string,
      src: partner.logoUrl as string,
      beltRow: partner.beltRow,
      sortOrder: partner.sortOrder,
    }));
}

function getPartnerRowCount(totalPartners: number) {
  if (totalPartners <= 0) {
    return 0;
  }

  if (totalPartners === 1) {
    return 1;
  }

  if (totalPartners <= 20) {
    return 2;
  }

  if (totalPartners <= 36) {
    return 3;
  }

  return 4;
}

export function splitPartnersIntoBalancedRows(items: Partner[]): Partner[][] {
  const rowCount = getPartnerRowCount(items.length);

  if (!rowCount) {
    return [];
  }

  // Stable sorting also respects manually selected partner lists when no order is set.
  const ordered = [...items].sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999));
  const pinned = ordered.filter((item) => item.beltRow === 'first');
  const automatic = ordered.filter((item) => item.beltRow !== 'first');
  const rows: Partner[][] = Array.from({length: rowCount}, () => []);
  rows[0] = pinned;

  // Water-fill the row capacities around the fixed first-row minimum. If that
  // row is already oversized, only the remaining rows receive automatic logos.
  const sizes = rows.map((row) => row.length);
  for (let index = 0; index < automatic.length; index += 1) {
    const smallest = Math.min(...sizes);
    sizes[sizes.indexOf(smallest)] += 1;
  }

  let startIndex = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const count = sizes[rowIndex] - rows[rowIndex].length;
    rows[rowIndex].push(...automatic.slice(startIndex, startIndex + count));
    rows[rowIndex].sort((a, b) => (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999));
    startIndex += count;
  }

  return rows.filter((row) => row.length);
}
