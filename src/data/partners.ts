export type Partner = {
  name: string;
  src: string;
  beltRow?: 'auto' | 'first';
  sortOrder?: number;
};

export const partners: Partner[] = [
  {
    name: 'Cariri',
    src: '/assets/partners/cariri.webp',
  },
  {
    name: 'European Union',
    src: '/assets/partners/eu.png',
  },
  {
    name: 'IDB Lab',
    src: '/assets/partners/idblab.webp',
  },
  {
    name: 'Ministry of Planning and Development',
    src: '/assets/partners/ministryped.webp',
  },
];
