"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Assembly } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PackageSearch } from 'lucide-react';

export function AssembliesList() {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const savedAssemblies = localStorage.getItem('assemblies');
    if (savedAssemblies) {
      setAssemblies(JSON.parse(savedAssemblies));
    }
    setIsClient(true);
  }, []);

  const sortedAssemblies = useMemo(() => {
      if (!isClient) return [];
      return [...assemblies].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [assemblies, isClient]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString));
  }

  if (!isClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <PackageSearch className="size-16 mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold">Lade Montagen...</h2>
        </div>
    );
  }

  if (sortedAssemblies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <PackageSearch className="size-16 mb-4" />
        <h2 className="text-xl font-semibold">Keine Montagen gefunden</h2>
        <p>Protokollieren Sie eine Montage auf der Fahrzeugbestandsseite, um sie hier zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {sortedAssemblies.map(assembly => (
          <AccordionItem value={assembly.id} key={assembly.id}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4">
                <span className="font-semibold">Kommission: {assembly.commission}</span>
                <span className="text-sm text-muted-foreground">{formatDate(assembly.date)}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikel</TableHead>
                      <TableHead>Art.-Nr.</TableHead>
                      <TableHead className="text-right">Verbrauchte Menge</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assembly.items.map(item => (
                      <TableRow key={item.itemId}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.articleNumber}</TableCell>
                        <TableCell className="text-right font-mono">{item.quantityConsumed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
