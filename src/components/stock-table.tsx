"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Item, Assembly } from '@/lib/types';
import { initialItems, initialSpareParts, initialTools } from '@/lib/mock-data';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Wand2,
  TriangleAlert,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ReorderSuggestionDialog } from './reorder-suggestion-dialog';
import { AssemblyDialog } from './assembly-dialog';
import { suggestReorderQuantities } from '@/ai/flows/suggest-reorder-quantities';
import type { SuggestReorderQuantitiesOutput } from '@/ai/flows/suggest-reorder-quantities';
import { Checkbox } from '@/components/ui/checkbox';

type ItemType = 'assembly' | 'spareParts' | 'tools';

interface StockTableProps {
  itemType: ItemType;
}

const itemTypeConfig = {
    assembly: {
        storageKey: 'items',
        initialData: initialItems,
    },
    spareParts: {
        storageKey: 'spare_parts_items',
        initialData: initialSpareParts,
    },
    tools: {
        storageKey: 'tool_items',
        initialData: initialTools,
    }
}


export function StockTable({ itemType }: StockTableProps) {
  const { storageKey, initialData } = itemTypeConfig[itemType];
  const [items, setItems] = useState<Item[]>(initialData);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [isAssemblyDialogOpen, setAssemblyDialogOpen] = useState(false);
  const [reorderSuggestions, setReorderSuggestions] = useState<SuggestReorderQuantitiesOutput>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});


  useEffect(() => {
    setIsClient(true);
    const savedItems = localStorage.getItem(storageKey);
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
        setItems(initialData);
    }
    const savedAssemblies = localStorage.getItem('assemblies');
    if (savedAssemblies) {
      setAssemblies(JSON.parse(savedAssemblies));
    }
  }, [storageKey, initialData]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('assemblies', JSON.stringify(assemblies));
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [assemblies, items, isClient, storageKey]);

  const { toast } = useToast();

  const handleSelectionChange = (itemId: string, checked: boolean | 'indeterminate') => {
    const newSelection = { ...selectedItems };
    if (checked) {
      const item = items.find(i => i.id === itemId);
      newSelection[itemId] = item ? item.incrementStep : 1;
    } else {
      delete newSelection[itemId];
    }
    setSelectedItems(newSelection);
  };
  
  const handleSaveAssembly = (commission: string, consumedItems: Record<string, number>) => {
    const newAssembly: Assembly = {
      id: new Date().toISOString(),
      commission,
      date: new Date().toISOString(),
      items: [],
    };

    let stockUpdated = false;
    const updatedItems = items.map(item => {
      const consumedQuantity = consumedItems[item.id] || 0;
      if (consumedQuantity > 0) {
        if (item.currentStock >= consumedQuantity) {
          newAssembly.items.push({ 
            itemId: item.id, 
            name: item.name, 
            articleNumber: item.articleNumber, 
            quantityConsumed: consumedQuantity
          });
          stockUpdated = true;
          return { ...item, currentStock: item.currentStock - consumedQuantity };
        } else {
           toast({
            variant: 'destructive',
            title: 'Fehler: Nicht genügend Lagerbestand',
            description: `Für ${item.name} sind nur noch ${item.currentStock} Stück verfügbar.`,
          });
          return item; // return original item if not enough stock
        }
      }
      return item;
    });

    if (stockUpdated && newAssembly.items.length > 0) {
      setItems(updatedItems);
      setAssemblies(prev => [...prev, newAssembly]);
      toast({
        title: 'Montage gespeichert',
        description: `Der Verbrauch für Kommission ${commission} wurde protokolliert.`,
      });
      setAssemblyDialogOpen(false);
      setSelectedItems({});
    } else if (!stockUpdated) {
        toast({
            variant: 'destructive',
            title: 'Keine Artikel verbraucht',
            description: 'Es wurde kein Artikel mit einer Menge größer als 0 gefunden.',
        });
    }
  };

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const historicalDataForAI = assemblies.flatMap(assembly => 
        assembly.items.map(item => ({
          itemId: item.itemId,
          quantitySold: item.quantityConsumed,
          date: assembly.date,
        }))
      );
      
      const currentStockLevels = items.map(item => ({
        itemId: item.id,
        quantity: item.currentStock,
        targetLevel: item.targetStock,
      }));

      // Use mock data if no history exists, to ensure the AI has something to work with.
      if (historicalDataForAI.length === 0) {
        historicalDataForAI.push({ itemId: '1', quantitySold: 2, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() });
        historicalDataForAI.push({ itemId: '3', quantitySold: 20, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() });
      }

      const suggestions = await suggestReorderQuantities({
        historicalSalesData: historicalDataForAI,
        currentStockLevels,
      });

      setReorderSuggestions(suggestions);
      setReorderDialogOpen(true);
    } catch (error) {
      console.error('Error getting reorder suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler bei der Vorschlagerstellung',
        description: 'Die KI-Vorschläge konnten nicht geladen werden.',
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!isClient) return [];
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (a.currentStock / a.targetStock) - (b.currentStock / b.targetStock));
  }, [items, searchTerm, isClient]);

  if (!isClient) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="h-10 bg-muted rounded-md w-1/3 animate-pulse"></div>
                <div className="h-10 bg-muted rounded-md w-1/4 animate-pulse"></div>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
                <div className="h-8 bg-muted rounded-md w-full animate-pulse"></div>
                <div className="h-8 bg-muted rounded-md w-full animate-pulse"></div>
                <div className="h-8 bg-muted rounded-md w-full animate-pulse"></div>
                 <div className="h-8 bg-muted rounded-md w-full animate-pulse"></div>
            </div>
        </div>
    );
  }

  const selectedItemDetails = Object.keys(selectedItems)
    .map(id => items.find(item => item.id === id))
    .filter((item): item is Item => !!item);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Artikel suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
            <Button onClick={() => setAssemblyDialogOpen(true)} disabled={Object.keys(selectedItems).length === 0}>
                <Plus className="mr-2" />
                Zur Montage hinzufügen
            </Button>
            <Button onClick={handleGetSuggestions} disabled={isLoadingSuggestions} variant="outline">
              <Wand2 className="mr-2" />
              {isLoadingSuggestions ? 'Analysiere...' : 'Nachbestellvorschlag'}
            </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] hidden md:table-cell"></TableHead>
              <TableHead>Artikel</TableHead>
              <TableHead className="hidden sm:table-cell">Art.-Nr.</TableHead>
              <TableHead className="text-right">Bestand</TableHead>
              <TableHead className="text-right hidden md:table-cell">Soll</TableHead>
              <TableHead className="text-center w-[80px]">Wählen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => {
              const stockRatio = item.targetStock > 0 ? item.currentStock / item.targetStock : 1;
              const isLowStock = stockRatio < 0.5;
              const isSelected = !!selectedItems[item.id];
              return (
                <TableRow 
                    key={item.id} 
                    data-state={isSelected ? 'selected' : ''}
                    className={cn(
                        'cursor-pointer',
                        isLowStock && 'bg-destructive/10',
                    )}
                    onClick={() => handleSelectionChange(item.id, !isSelected)}
                >
                  <TableCell className="hidden md:table-cell">
                    {isLowStock && <TriangleAlert className="size-5 text-destructive" />}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">Art.-Nr. {item.articleNumber}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{item.articleNumber}</TableCell>
                  <TableCell className="text-right font-mono">{item.currentStock}</TableCell>
                  <TableCell className="text-right font-mono hidden md:table-cell">{item.targetStock}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectionChange(item.id, checked)}
                        aria-label={`Select ${item.name}`}
                        onClick={(e) => e.stopPropagation()} // prevent row click from toggling checkbox
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <AssemblyDialog
        isOpen={isAssemblyDialogOpen}
        onOpenChange={setAssemblyDialogOpen}
        onSave={handleSaveAssembly}
        selectedItems={selectedItemDetails}
        initialQuantities={selectedItems}
      />
      
      <ReorderSuggestionDialog
        isOpen={isReorderDialogOpen}
        onOpenChange={setReorderDialogOpen}
        suggestions={reorderSuggestions}
        items={items}
      />
    </>
  );
}
