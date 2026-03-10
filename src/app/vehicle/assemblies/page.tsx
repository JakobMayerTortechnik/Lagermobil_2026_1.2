import { AssembliesList } from '@/components/assemblies-list';
import { Wrench } from 'lucide-react';

export default function AssembliesPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 flex items-center gap-4 sticky top-0 z-10">
        <Wrench className="size-6 text-primary" />
        <h1 className="text-xl font-semibold font-headline">Protokollierte Montagen</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <AssembliesList />
      </main>
    </div>
  );
}
