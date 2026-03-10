"use client";

import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Item } from '@/lib/types';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface AssemblyDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (commission: string, consumedItems: Record<string, number>) => void;
  selectedItems: Item[];
  initialQuantities: Record<string, number>;
}

export function AssemblyDialog({ isOpen, onOpenChange, onSave, selectedItems, initialQuantities }: AssemblyDialogProps) {
  const [commission, setCommission] = useState('');
  const [consumedItems, setConsumedItems] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setCommission('');
      // Set initial quantities for the selected items
      const initialConsumed: Record<string, number> = {};
      selectedItems.forEach(item => {
        initialConsumed[item.id] = initialQuantities[item.id] || 0;
      });
      setConsumedItems(initialConsumed);
    }
  }, [isOpen, selectedItems, initialQuantities]);

  const handleQuantityChange = (itemId: string, amount: number) => {
    setConsumedItems(prev => {
      const currentQuantity = prev[itemId] || 0;
      const item = selectedItems.find(i => i.id === itemId);
      const maxQuantity = item ? item.currentStock : currentQuantity;
      let newQuantity = currentQuantity + amount;
      newQuantity = Math.max(0, newQuantity); // Ensure quantity doesn't go below 0
      newQuantity = Math.min(newQuantity, maxQuantity); // Ensure quantity doesn't exceed stock
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleInputChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value, 10) || 0;
    const item = selectedItems.find(i => i.id === itemId);
    const maxQuantity = item ? item.currentStock : newQuantity;
    setConsumedItems(prev => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(newQuantity, maxQuantity))
    }));
  }

  const handleSave = () => {
    if (commission.trim() && Object.values(consumedItems).some(q => q > 0)) {
        onSave(commission, consumedItems);
    }
  };
  
  const totalItems = selectedItems.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Montage protokollieren</DialogTitle>
          <DialogDescription>
            Geben Sie eine Kommissionsnummer an und passen Sie die verbrauchten Mengen an.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="commission" className="text-right">
              Kommission
            </Label>
            <Input
              id="commission"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="col-span-3"
              placeholder="z.B. AU-12345"
              autoFocus
            />
          </div>

          <h3 className="text-lg font-semibold mt-4">Ausgewählte Artikel ({totalItems})</h3>
          {totalItems > 0 ? (
            <div className="mt-2 max-h-[40vh] overflow-y-auto border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Artikel</TableHead>
                            <TableHead className="text-right w-[180px]">Menge</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.articleNumber} (Bestand: {item.currentStock})</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, -item.incrementStep)}>
                                            <MinusCircle className="h-5 w-5" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={consumedItems[item.id] || 0}
                                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                                            className="w-20 h-8 text-right font-mono"
                                            min="0"
                                            max={item.currentStock}
                                        />
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.id, item.incrementStep)}>
                                            <PlusCircle className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">Keine Artikel ausgewählt.</p>
          )}

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={!commission.trim() || totalItems === 0 || Object.values(consumedItems).every(q => q === 0)}
          >
            Montage speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
