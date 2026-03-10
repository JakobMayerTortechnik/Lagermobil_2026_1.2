export type ItemType = 'assembly' | 'spareParts' | 'tools';

export type Item = {
  id: string;
  name: string;
  articleNumber: string;
  listPrice: number;
  currentStock: number;
  targetStock: number;
  incrementStep: number;
  type: ItemType;
};

export type AssemblyItem = {
  itemId: string;
  name:string;
  articleNumber: string;
  quantityConsumed: number;
};

export type Assembly = {
  id: string; 
  commission: string;
  date: string; // ISO date string
  items: AssemblyItem[];
};

export type Order = {
  id: string;
  commission: string;
  customer: {
    name: string;
    address: string;
  };
  type: 'Montage' | 'Reparatur' | 'Angebot' | 'Reklamation' | 'Urlaub' | 'Sonstiges';
  status: 'Geplant' | 'In Arbeit' | 'Abgeschlossen';
  startTime: string; // ISO date string
  endTime: string; // ISO date string
}
