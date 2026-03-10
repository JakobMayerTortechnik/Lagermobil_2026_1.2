import type { Item } from '@/lib/types';

export const initialItems: Item[] = [
  {
    id: '1',
    name: 'Rollenbock SPU',
    articleNumber: '63637',
    listPrice: 45.50,
    currentStock: 8,
    targetStock: 10,
    incrementStep: 1,
    type: 'assembly',
  },
  {
    id: '2',
    name: 'Rollenhalter unten LPU',
    articleNumber: '74746',
    listPrice: 22.00,
    currentStock: 4,
    targetStock: 5,
    incrementStep: 1,
    type: 'assembly',
  },
  {
    id: '3',
    name: 'Schrauben-Set TX-30',
    articleNumber: 'SML-484',
    listPrice: 15.00,
    currentStock: 45,
    targetStock: 100,
    incrementStep: 10,
    type: 'assembly',
  },
  {
    id: '4',
    name: 'Dübel 10mm',
    articleNumber: 'DBL-10',
    listPrice: 8.75,
    currentStock: 120,
    targetStock: 200,
    incrementStep: 10,
    type: 'assembly',
  },
  {
    id: '5',
    name: 'Garagentor-Feder L700',
    articleNumber: 'FDR-L700',
    listPrice: 120.00,
    currentStock: 1,
    targetStock: 4,
    incrementStep: 1,
    type: 'assembly',
  },
];

export const initialSpareParts: Item[] = [
    {
        id: 'sp-1',
        name: 'Handsender 4-Befehl',
        articleNumber: 'HS-4',
        listPrice: 55.00,
        currentStock: 3,
        targetStock: 5,
        incrementStep: 1,
        type: 'spareParts',
    },
    {
        id: 'sp-2',
        name: 'Lichtschranke Universal',
        articleNumber: 'LS-UNI',
        listPrice: 75.00,
        currentStock: 2,
        targetStock: 3,
        incrementStep: 1,
        type: 'spareParts',
    }
];

export const initialTools: Item[] = [
    {
        id: 'tool-1',
        name: 'Akkuschrauber',
        articleNumber: 'AS-18V',
        listPrice: 250.00,
        currentStock: 1,
        targetStock: 1,
        incrementStep: 1,
        type: 'tools',
    },
     {
        id: 'tool-2',
        name: 'Schlagbohrmaschine',
        articleNumber: 'SBM-1',
        listPrice: 180.00,
        currentStock: 1,
        targetStock: 1,
        incrementStep: 1,
        type: 'tools',
    }
];
