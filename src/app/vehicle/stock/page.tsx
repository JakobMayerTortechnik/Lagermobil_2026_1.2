import { StockTabs } from '@/components/stock-tabs';
import { Package } from 'lucide-react';

export default function StockPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <Package className="size-6 text-primary" />
        <h1 className="text-xl font-semibold font-headline">Fahrzeugbestand</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <StockTabs />
      </main>
    </div>
  );
}
