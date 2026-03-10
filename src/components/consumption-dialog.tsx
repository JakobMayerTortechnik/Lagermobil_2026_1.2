"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Item, ItemType } from '@/lib/types';
import { MinusCircle, PlusCircle, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from './ui/separator';

interface ConsumptionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (consumedItems: Record<string, number>) => void;
  items: Item[];
}

const itemTypeLabels: Record<ItemType, string> = {
  assembly: 'Montagematerial',
  spareParts: 'Ersatzteile',
  tools: 'Werkzeuge & Verbrauch'
};


export function ConsumptionDialog({ isOpen, onOpenChange, onSave, items }: ConsumptionDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedItems({});
    }
  }, [isOpen]);

  const handleQuantityChange = (itemId: string, amount: number) => {
    setSelectedItems(prev => {
      const currentQuantity = prev[itemId] || 0;
      const item = items.find(i => i.id === itemId);
      const maxQuantity = item ? item.currentStock : currentQuantity;
      let newQuantity = currentQuantity + amount;
      newQuantity = Math.max(0, newQuantity);
      newQuantity = Math.min(newQuantity, maxQuantity);
      
      const newSelection = {...prev};
      if (newQuantity > 0) {
        newSelection[itemId] = newQuantity;
      } else {
        delete newSelection[itemId];
      }
      return newSelection;
    });
  };

  const handleInputChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value, 10) || 0;
    const item = items.find(i => i.id === itemId);
    const maxQuantity = item ? item.currentStock : newQuantity;
    const finalQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));

     setSelectedItems(prev => {
        const newSelection = {...prev};
        if (finalQuantity > 0) {
            newSelection[itemId] = finalQuantity;
        } else {
            delete newSelection[itemId];
        }
        return newSelection;
    });
  }
  
  const handleSelectionChange = (itemId: string, checked: boolean | 'indeterminate') => {
    const newSelection = { ...selectedItems };
    if (checked) {
      const item = items.find(i => i.id === itemId);
      // Set initial quantity to incrementStep when selected, if not already set
      newSelection[itemId] = newSelection[itemId] || (item ? item.incrementStep : 1);
    } else {
      delete newSelection[itemId];
    }
    setSelectedItems(newSelection);
  };

  const handleSave = () => {
    if (Object.values(selectedItems).some(q => q > 0)) {
        onSave(selectedItems);
    }
  };
  
  const groupedAndFilteredItems = useMemo(() => {
    const grouped: Record<ItemType, Item[]> = {
      assembly: [],
      spareParts: [],
      tools: []
    };

    items.forEach(item => {
      if (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
         if (grouped[item.type]) {
            grouped[item.type].push(item);
         }
      }
    });

    Object.values(grouped).forEach(group => group.sort((a,b) => a.name.localeCompare(b.name)));

    return grouped;
  }, [items, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Materialverbrauch buchen</DialogTitle>
          <DialogDescription>
            Wählen Sie die verbrauchten Artikel aus und passen Sie die Mengen an.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Artikel suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6">
            {(Object.keys(groupedAndFilteredItems) as ItemType[]).map(type => {
              const categoryItems = groupedAndFilteredItems[type];
              if (categoryItems.length === 0) return null;

              return (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2">{itemTypeLabels[type]}</h3>
                   <Table>
                      <TableBody>
                          {categoryItems.map(item => {
                              const isSelected = !!selectedItems[item.id];
                              return (
                                  <TableRow key={item.id} data-state={isSelected ? 'selected' : ''}>
                                      <TableCell className="w-[50px] text-center">
                                           <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={(checked) => handleSelectionChange(item.id, checked)}
                                              aria-label={`Select ${item.name}`}
                                          />
                                      </TableCell>
                                      <TableCell>
                                          <p className="font-medium">{item.name}</p>
                                          <p className="text-xs text-muted-foreground">{item.articleNumber} (Bestand: {item.currentStock})</p>
                                      </TableCell>
                                      <TableCell className="w-[200px]">
                                          {isSelected && (
                                              <div className="flex items-center justify-end gap-2">
                                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, -item.incrementStep)}>
                                                      <MinusCircle className="h-5 w-5" />
                                                  </Button>
                                                  <Input
                                                      type="number"
                                                      value={selectedItems[item.id] || 0}
                                                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                                                      className="w-20 h-8 text-right font-mono"
                                                      min="0"
                                                      max={item.currentStock}
                                                  />
                                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, item.incrementStep)}>
                                                      <PlusCircle className="h-5 w-5" />
                                                  </Button>
                                              </div>
                                          )}
                                      </TableCell>
                                  </TableRow>
                              )
                          })}
                      </TableBody>
                  </Table>
                </div>
              );
            })}
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={Object.keys(selectedItems).length === 0}
          >
            Verbrauch buchen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
